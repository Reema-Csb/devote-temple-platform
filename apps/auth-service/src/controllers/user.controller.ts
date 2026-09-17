import {randomUUID, randomBytes} from 'crypto';
import {inject} from '@loopback/core';
import {GetObjectCommand, PutObjectCommand, S3Client} from '@aws-sdk/client-s3';

import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import multer, {FileFilterCallback} from 'multer';
import path from 'path';
import {
  sendOtpEmail,
  sendTempleAdminCredentialsEmail,
} from '../services/email.service';

import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
  RestBindings,
  Request,
  Response,
} from '@loopback/rest';
import {User} from '../models';
import {
  UserRepository,
  UserCredentialRepository,
  UserSessionRepository,
  NotificationPreferenceRepository,
} from '../repositories';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {generateSecret, generateURI, verify as verifyOTP} from 'otplib';
import QRCode from 'qrcode';

function parseUserAgent(ua: string): string {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';

  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';

  return `${browser} on ${os}`;
}

const otpStore: {
  [key: string]: {
    otp: string;
    expiresAt: number;
  };
} = {};

const ADMIN_ROLES = ['super_admin', 'temple_admin'];

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const s3BucketName = process.env.AWS_BUCKET_NAME;
const templeAdminResetTokens: {
  [token: string]: {
    userId: string;
    expiresAt: number;
  };
} = {};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTempPassword(): string {
  return randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
}

export class AuthController {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,

    @repository(UserCredentialRepository)
    public userCredentialRepository: UserCredentialRepository,

    @repository(UserSessionRepository)
    public userSessionRepository: UserSessionRepository,

    @repository(NotificationPreferenceRepository)
    public notificationPreferenceRepository: NotificationPreferenceRepository,

    @inject(RestBindings.Http.REQUEST)
    private req: Request,
  ) {}
  @post('/users/register')
  async register(
    @requestBody()
    body: {
      firstName: string;
      lastName: string;
      phone: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
  ) {
    if (body.password !== body.confirmPassword) {
      throw new HttpErrors.BadRequest('Passwords do not match');
    }

    const existingEmail = await this.userRepository.findOne({
      where: {email: body.email},
    });

    if (existingEmail) {
      throw new HttpErrors.BadRequest('Email already exists');
    }

    const existingPhone = await this.userRepository.findOne({
      where: {phone: body.phone},
    });

    if (existingPhone) {
      throw new HttpErrors.BadRequest('Phone number already exists');
    }

    const user = await this.userRepository.create({
      id: randomUUID(),
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      username: body.email,
      email: body.email,
      phone: body.phone,
    });

    const hashedPassword = await bcrypt.hash(body.password, 10);

    await this.userCredentialRepository.create({
      userId: user.id!,
      authProvider: 'local',
      password: hashedPassword,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    });

    await this.notificationPreferenceRepository.create({
      userId: user.id!,
      pushNotifications: true,
      donationAlerts: true,
      festivalReminders: true,
      templeUpdates: true,
      promotions: true,
      deleted: false,
      createdOn: new Date(),
    });

    return {
      message: 'User registered successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        templeId: user.templeId,
        userImage: user.userImage,
      },
    };
  }

  @post('/users/create-temple-admin')
  async createTempleAdmin(
    @requestBody()
    body: {
      email: string;
      templeId: string;
      templeName: string;
    },
  ) {
    const email = body.email?.trim().toLowerCase();

    if (!email || !EMAIL_REGEX.test(email)) {
      throw new HttpErrors.BadRequest('Please provide a valid email address');
    }

    if (!body.templeId) {
      throw new HttpErrors.BadRequest('templeId is required');
    }

    const existingEmail = await this.userRepository.findOne({
      where: {email},
    });

    if (existingEmail) {
      throw new HttpErrors.BadRequest('Email already exists');
    }

    const tempPassword = generateTempPassword();
    const placeholderPhone = randomBytes(6).toString('hex');
    const resetToken = randomBytes(32).toString('hex');

    const user = await this.userRepository.create({
      id: randomUUID(),
      firstName: (body.templeName?.trim() || 'Temple').slice(0, 50),
      lastName: 'Admin',
      username: email,
      email,
      phone: placeholderPhone,
      role: 'temple_admin',
      templeId: body.templeId,
    });

    templeAdminResetTokens[resetToken] = {
      userId: user.id!,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };

    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    await this.userCredentialRepository.create({
      userId: user.id!,
      authProvider: 'local',
      password: hashedPassword,
      createdOn: new Date().toISOString(),
      modifiedOn: new Date().toISOString(),
    });

    const resetLink = `${process.env.ADMIN_WEB_URL ?? 'http://localhost:3007'}/set-password?token=${resetToken}`;

    await sendTempleAdminCredentialsEmail(
      email,
      resetLink,
      body.templeName?.trim() || 'your temple',
    );

    return {
      message: 'Temple admin created and setup link emailed successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        templeId: user.templeId,
      },
    };
  }

  @post('/users/set-password')
  async setPassword(
    @requestBody()
    body: {
      token: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    if (!body.token) {
      throw new HttpErrors.BadRequest('Reset token is required');
    }

    if (!body.newPassword || body.newPassword.length < 6) {
      throw new HttpErrors.BadRequest('Password must be at least 6 characters');
    }

    if (body.newPassword !== body.confirmPassword) {
      throw new HttpErrors.BadRequest('Passwords do not match');
    }

    const tokenData = templeAdminResetTokens[body.token];

    if (!tokenData) {
      throw new HttpErrors.BadRequest('Invalid or expired setup link');
    }

    if (Date.now() > tokenData.expiresAt) {
      delete templeAdminResetTokens[body.token];
      throw new HttpErrors.BadRequest('This setup link has expired');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await this.userCredentialRepository.updateAll(
      {
        password: hashedPassword,
        modifiedOn: new Date().toISOString(),
      },
      {
        userId: tokenData.userId,
        authProvider: 'local',
      },
    );

    delete templeAdminResetTokens[body.token];

    return {
      message: 'Password set successfully. You can now log in.',
    };
  }

  @post('/users/login')
  async login(
    @requestBody()
    body: {
      email: string;
      password: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: {email: body.email},
    });

    if (!user) {
      throw new HttpErrors.Unauthorized('Invalid email or password');
    }

    const credential = await this.userCredentialRepository.findOne({
      where: {
        userId: user.id,
        authProvider: 'local',
      },
    });

    if (!credential?.password) {
      throw new HttpErrors.Unauthorized('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      credential.password,
    );

    if (!isPasswordValid) {
      throw new HttpErrors.Unauthorized('Invalid email or password');
    }

    // If 2FA is enabled, do not issue token yet — require TOTP verification
    if (user.totpEnabled) {
      return {
        requires2FA: true,
        userId: user.id,
      };
    }

    return this.issueTokenAndSession(user);
  }

  private async issueTokenAndSession(user: User) {
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        templeId: user.templeId,
      },
      process.env.JWT_SECRET ?? 'devote_secret',
      {expiresIn: '1d'},
    );

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const ua = (this.req.headers['user-agent'] as string) ?? '';
    const ipAddress =
      ((this.req.headers['x-forwarded-for'] as string) ?? '')
        .split(',')[0]
        .trim() ||
      this.req.socket?.remoteAddress ||
      'Unknown';

    const session = await this.userSessionRepository.create({
      userId: user.id!,
      deviceInfo: parseUserAgent(ua),
      ipAddress,
      expiresAt,
    });

    const userWithImageUrl = await this.attachPresignedImageUrl(user);
    return {
      message: 'Login successful',
      token,
      sessionId: session.id,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        templeId: user.templeId,
        userImage: userWithImageUrl.userImage,
      },
    };
  }

  @post('/users/login/verify-2fa')
  @response(200, {
    description: 'Verify TOTP code after password login and complete sign-in',
  })
  async loginVerify2FA(
    @requestBody()
    body: {
      userId: string;
      token: string;
    },
  ) {
    const user = await this.userRepository.findById(body.userId);
    if (!user.totpEnabled || !user.totpSecret) {
      throw new HttpErrors.BadRequest('2FA is not enabled for this account');
    }

    const result = await verifyOTP({
      token: body.token,
      secret: user.totpSecret,
    });
    if (!result.valid) {
      throw new HttpErrors.Unauthorized('Invalid authenticator code');
    }

    return this.issueTokenAndSession(user);
  }

  @post('/users/forgot-password')
  async forgotPassword(
    @requestBody()
    body: {
      emailOrPhone: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: {
        or: [{email: body.emailOrPhone}, {phone: body.emailOrPhone}],
      },
    });

    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[body.emailOrPhone] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // OTP valid for 15 minutes
    };

    if (user.email) {
      await sendOtpEmail(user.email, otp);
    } else {
      console.log(`OTP for ${body.emailOrPhone}: ${otp}`);
    }

    return {
      message: 'OTP sent successfully',
    };
  }

  @post('/users/admin/forgot-password')
  async adminForgotPassword(
    @requestBody()
    body: {
      emailOrPhone: string;
    },
  ) {
    const user = await this.userRepository.findOne({
      where: {
        or: [{email: body.emailOrPhone}, {phone: body.emailOrPhone}],
      },
    });

    if (!user?.role || !ADMIN_ROLES.includes(user.role)) {
      throw new HttpErrors.NotFound('Not an Admin');
    }

    if (!user.email) {
      throw new HttpErrors.BadRequest(
        'This admin account has no email on file. Contact support.',
      );
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[body.emailOrPhone] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000, // OTP valid for 15 minutes
    };

    await sendOtpEmail(user.email, otp);

    return {
      message: 'OTP sent successfully',
    };
  }

  @post('/users/verify-otp')
  async verifyOtp(
    @requestBody()
    body: {
      emailOrPhone: string;
      otp: string;
    },
  ) {
    const storedOtpData = otpStore[body.emailOrPhone];

    if (!storedOtpData) {
      throw new HttpErrors.BadRequest('OTP not found');
    }

    if (Date.now() > storedOtpData.expiresAt) {
      delete otpStore[body.emailOrPhone];

      throw new HttpErrors.BadRequest('OTP expired');
    }

    if (storedOtpData.otp !== body.otp) {
      throw new HttpErrors.BadRequest('Invalid OTP');
    }

    return {
      message: 'OTP verified successfully',
    };
  }

  @post('/users/reset-password')
  async resetPassword(
    @requestBody()
    body: {
      emailOrPhone: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    if (body.newPassword !== body.confirmPassword) {
      throw new HttpErrors.BadRequest('Passwords do not match');
    }

    const user = await this.userRepository.findOne({
      where: {
        or: [{email: body.emailOrPhone}, {phone: body.emailOrPhone}],
      },
    });

    if (!user) {
      throw new HttpErrors.NotFound('User not found');
    }

    const credential = await this.userCredentialRepository.findOne({
      where: {
        userId: user.id,
        authProvider: 'local',
      },
    });
    if (!credential) {
      throw new HttpErrors.NotFound('User credential not found');
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    await this.userCredentialRepository.updateAll(
      {
        password: hashedPassword,
        modifiedOn: new Date().toISOString(),
      },
      {
        userId: user.id,
        authProvider: 'local',
      },
    );

    delete otpStore[body.emailOrPhone];

    return {
      message: 'Password reset successful',
    };
  }

  @post('/users')
  @response(200, {
    description: 'User model instance',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {
            title: 'NewUser',
            exclude: ['id'],
          }),
        },
      },
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    return this.userRepository.create(user);
  }

  @get('/users/count')
  @response(200, {
    description: 'User model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(@param.where(User) where?: Where<User>): Promise<Count> {
    return this.userRepository.count(where);
  }

  @get('/users')
  @response(200, {
    description: 'Array of User model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(User, {includeRelations: true}),
        },
      },
    },
  })
  async find(@param.filter(User) filter?: Filter<User>): Promise<User[]> {
    const users = await this.userRepository.find(filter);

    return Promise.all(users.map(user => this.attachPresignedImageUrl(user)));
  }

  @patch('/users')
  @response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @param.where(User) where?: Where<User>,
  ): Promise<Count> {
    return this.userRepository.updateAll(user, where);
  }

  @get('/users/{id}')
  @response(200, {
    description: 'User model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(User, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(User, {exclude: 'where'}) filter?: FilterExcludingWhere<User>,
  ): Promise<User> {
    const user = await this.userRepository.findById(id, filter);

    return this.attachPresignedImageUrl(user);
  }
  @post('/users/{id}/profile-image')
  @response(200, {
    description: 'Upload user profile image and save S3 key',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            userImage: {
              type: 'string',
            },
            user: getModelSchemaRef(User),
          },
        },
      },
    },
  })
  async uploadProfileImage(
    @param.path.string('id') id: string,

    @requestBody.file()
    request: Request,

    @inject(RestBindings.Http.RESPONSE)
    responseObject: Response,
  ): Promise<{
    message: string;
    userImage: string;
    user: User;
  }> {
    if (!s3BucketName) {
      throw new HttpErrors.InternalServerError(
        'AWS_BUCKET_NAME is not configured',
      );
    }

    await this.userRepository.findById(id);

    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (
        _request: Express.Request,
        file: Express.Multer.File,
        callback: FileFilterCallback,
      ) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.mimetype)) {
          callback(
            new HttpErrors.BadRequest(
              'Only JPG, PNG and WEBP images are allowed',
            ),
          );
          return;
        }

        callback(null, true);
      },
    });

    await new Promise<void>((resolve, reject) => {
      upload.single('file')(
        request as never,
        responseObject as never,
        (error: unknown) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        },
      );
    });

    const uploadedFile = (
      request as Request & {
        file?: Express.Multer.File;
      }
    ).file;

    if (!uploadedFile) {
      throw new HttpErrors.BadRequest('Profile image file is required');
    }

    const extension =
      path.extname(uploadedFile.originalname).toLowerCase() ||
      this.getImageExtension(uploadedFile.mimetype);

    const s3Key = `users/${id}/profile-images/` + `${randomUUID()}${extension}`;
    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3BucketName,
        Key: s3Key,
        Body: uploadedFile.buffer,
        ContentType: uploadedFile.mimetype,
      }),
    );

    await this.userRepository.updateById(id, {
      userImage: s3Key,
    });

    const updatedUser = await this.userRepository.findById(id);

    return {
      message: 'Profile image uploaded successfully',
      userImage: s3Key,
      user: updatedUser,
    };
  }

  private async attachPresignedImageUrl(user: User): Promise<User> {
    if (!user.userImage || !s3BucketName) {
      return user;
    }

    const command = new GetObjectCommand({
      Bucket: s3BucketName,
      Key: user.userImage,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return new User({
      ...user,
      userImage: presignedUrl,
    });
  }

  private getImageExtension(mimeType: string): string {
    const extensionMap: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    return extensionMap[mimeType] ?? '';
  }

  @patch('/users/{id}')
  @response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @put('/users/{id}')
  @response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @del('/users/{id}')
  @response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }

  @post('/users/{id}/change-password')
  @response(200, {
    description: 'Change password for an authenticated user',
  })
  async changePassword(
    @param.path.string('id') id: string,
    @requestBody() body: {currentPassword: string; newPassword: string},
  ) {
    const credential = await this.userCredentialRepository.findOne({
      where: {userId: id, authProvider: 'local'},
    });

    if (!credential?.password) {
      throw new HttpErrors.NotFound('User credential not found');
    }

    const isMatch = await bcrypt.compare(
      body.currentPassword,
      credential.password,
    );
    if (!isMatch) {
      throw new HttpErrors.Unauthorized('Current password is incorrect');
    }

    const hashed = await bcrypt.hash(body.newPassword, 10);
    await this.userCredentialRepository.updateAll(
      {password: hashed, modifiedOn: new Date().toISOString()},
      {userId: id, authProvider: 'local'},
    );

    return {message: 'Password updated successfully'};
  }

  @get('/users/{id}/sessions')
  @response(200, {
    description: 'List active sessions for a user',
  })
  async getSessions(@param.path.string('id') id: string) {
    const now = new Date().toISOString();
    return this.userSessionRepository.find({
      where: {
        userId: id,
        revoked: false,
        expiresAt: {gt: now} as never,
      },
      order: ['createdOn DESC'],
    });
  }

  @del('/users/{id}/sessions/{sessionId}')
  @response(200, {
    description: 'Revoke a specific session',
  })
  async revokeSession(
    @param.path.string('id') id: string,
    @param.path.string('sessionId') sessionId: string,
  ) {
    const session = await this.userSessionRepository.findById(sessionId);
    if (session.userId !== id) {
      throw new HttpErrors.Forbidden('Not authorized to revoke this session');
    }
    await this.userSessionRepository.updateById(sessionId, {
      revoked: true,
      revokedOn: new Date().toISOString(),
    });
    return {message: 'Session revoked successfully'};
  }

  @post('/users/{id}/2fa/setup')
  @response(200, {
    description: 'Generate TOTP secret and QR code for Google Authenticator',
  })
  async setup2FA(@param.path.string('id') id: string) {
    const user = await this.userRepository.findById(id);
    const secret = generateSecret();
    const otpauthUrl = generateURI({
      issuer: 'Devote',
      label: user.email,
      secret,
    });

    await this.userRepository.updateById(id, {
      totpSecret: secret,
    } as Partial<User>);

    const qrCode = await QRCode.toDataURL(otpauthUrl);
    return {qrCode, secret};
  }

  @post('/users/{id}/2fa/verify')
  @response(200, {
    description: 'Verify TOTP token and enable 2FA',
  })
  async verify2FA(
    @param.path.string('id') id: string,
    @requestBody() body: {token: string},
  ) {
    const user = await this.userRepository.findById(id);
    if (!user.totpSecret) {
      throw new HttpErrors.BadRequest('2FA setup not initiated');
    }

    const result = await verifyOTP({
      token: body.token,
      secret: user.totpSecret,
    });
    if (!result.valid) {
      throw new HttpErrors.BadRequest('Invalid verification code');
    }

    await this.userRepository.updateById(id, {
      totpEnabled: true,
    } as Partial<User>);
    return {message: '2FA enabled successfully'};
  }

  @post('/users/{id}/2fa/disable')
  @response(200, {
    description: 'Verify TOTP token and disable 2FA',
  })
  async disable2FA(
    @param.path.string('id') id: string,
    @requestBody() body: {token: string},
  ) {
    const user = await this.userRepository.findById(id);
    if (!user.totpSecret || !user.totpEnabled) {
      throw new HttpErrors.BadRequest('2FA is not enabled');
    }

    const result = await verifyOTP({
      token: body.token,
      secret: user.totpSecret,
    });
    if (!result.valid) {
      throw new HttpErrors.BadRequest('Invalid verification code');
    }

    await this.userRepository.updateById(id, {
      totpEnabled: false,
      totpSecret: undefined,
    } as Partial<User>);
    return {message: '2FA disabled successfully'};
  }
}
