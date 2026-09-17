import nodemailer from 'nodemailer';


async function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      const transport = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      return {transport, testAccount};
    } catch (err) {
      console.error('[email] Failed to create Ethereal test account:', err);
      throw err;
    }
  }

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST ?? 'smtp-relay.brevo.com',
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transport.verify();
    return {transport, testAccount: null};
  } catch (err) {
    console.error('[email] SMTP transporter verification failed:', err);
    throw err;
  }
}

export async function sendOtpEmail(
  toEmail: string,
  otp: string,
): Promise<void> {
  try {
    const {transport, testAccount} = await createTransporter();

    const info = await transport.sendMail({
      from: `"Devote" <${testAccount?.user ?? process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Your Password Reset OTP',
      html: `
            <p>You requested a password reset for your Devote account.</p>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This OTP is valid for 15 minutes. Do not share it with anyone.</p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    });

    // if (testAccount) {
    //   console.log(
    //     '[email] Preview OTP email at:',
    //     nodemailer.getTestMessageUrl(info),
    //   );
    // }
  } catch (err) {
    console.error('[email] Failed to send OTP email to', toEmail, ':', err);
    throw err;
  }
}

export async function sendTempleAdminCredentialsEmail(
  toEmail: string,
  resetLink: string,
  templeName: string,
): Promise<void> {
  try {
    const {transport, testAccount} = await createTransporter();

    const info = await transport.sendMail({
      from: `"Devote" <${testAccount?.user ?? process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Set Up Your Devote Temple Admin Account',
      html: `
            <p>An admin account has been created for you to manage <strong>${templeName}</strong> on Devote.</p>
            <p>Your login email: <strong>${toEmail}</strong></p>
            <p>Click the link below to set your password and activate your account. This link is valid for 24 hours.</p>
            <p><a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#c8651d;color:#ffffff;border-radius:8px;text-decoration:none;">Set Your Password</a></p>
            <p>If the button doesn't work, copy and paste this link into your browser:<br>${resetLink}</p>
            <p>If you were not expecting this account, please ignore this email.</p>
        `,
    });

    // if (testAccount) {
    //   console.log(
    //     '[email] Preview temple admin email at:',
    //     nodemailer.getTestMessageUrl(info),
    //   );
    // }
  } catch (err) {
    console.error(
      '[email] Failed to send temple admin credentials email to',
      toEmail,
      ':',
      err,
    );
    throw err;
  }
}
