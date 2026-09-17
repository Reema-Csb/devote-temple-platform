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

      return {
        transport,
        testAccount,
      };
    } catch (error) {
      console.error('[email] Failed to create Ethereal test account:', error);

      throw error;
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

    return {
      transport,
      testAccount: null,
    };
  } catch (error) {
    console.error('[email] SMTP transporter verification failed:', error);

    throw error;
  }
}

export type BankDetailChangeEmailData = {
  templeId: string;
  beneficiaryName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: string;
  panNumber: string;
  gstin?: string;
  requestedOn: string;
};

export async function sendBankDetailChangeRequestEmail(
  toEmail: string,
  data: BankDetailChangeEmailData,
): Promise<void> {
  try {
    const {transport, testAccount} = await createTransporter();

    const senderEmail =
      testAccount?.user ?? process.env.SMTP_FROM ?? process.env.SMTP_USER;

    if (!senderEmail) {
      throw new Error('SMTP sender email is not configured');
    }

    await transport.sendMail({
      from: `"Devote" <${senderEmail}>`,
      to: toEmail,
      subject: 'Temple Bank Details Change Request',
      html: `
        <div style="font-family: Arial, sans-serif; color: #2d1606;">
          <h2 style="color: #c8651d;">
            Bank Details Change Request
          </h2>

          <p>
            A Temple Admin has submitted a request to change the
            temple bank details.
          </p>

          <p>
            <strong>Temple ID:</strong> ${data.templeId}
          </p>

          <p>
            <strong>Beneficiary:</strong> ${data.beneficiaryName}
          </p>

          <p>
            <strong>Account Number:</strong> ${data.accountNumber}
          </p>

          <p>
            <strong>IFSC Code:</strong> ${data.ifscCode}
          </p>

          <p>
            <strong>Account Type:</strong> ${data.accountType}
          </p>

          <p>
            <strong>PAN:</strong> ${data.panNumber}
          </p>

          <p>
            <strong>GSTIN:</strong> ${data.gstin || 'Not provided'}
          </p>

          <p>
            <strong>Requested On:</strong> ${data.requestedOn}
          </p>

          <p>
            <strong>Status:</strong>
            <span style="color: #d97706;">Requested</span>
          </p>

          <p>
            Please log in to the Devote Super Admin portal to review
            this request.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error(
      '[email] Failed to send bank change request email to',
      toEmail,
      ':',
      error,
    );

    throw error;
  }
}
