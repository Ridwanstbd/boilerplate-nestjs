import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER, // Simpan di .env
        pass: process.env.MAILTRAP_PASS, // Simpan di .env
      },
    });
  }

  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    await this.transporter.sendMail({
      from: '"ERP System" <no-reply@erp.com>',
      to: email,
      subject: 'Reset Password Request',
      html: `<p>Klik link ini untuk reset password kamu: <a href="${resetLink}">Reset Password</a></p>`,
    });
  }
}
