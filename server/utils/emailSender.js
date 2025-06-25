import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendTicketEmail = async ({ email, name, pdfPath }) => {
  try {
    await transporter.sendMail({
      from: '"OMNITIX" <no-reply@omnitix.com>',
      to: email,
      subject: `Your OMNITIX Booking is Confirmed!`,
      text: `Hi ${name},\n\nPlease find your ticket attached.\n\nEnjoy the event!\n- OMNITIX Team`,
      attachments: [
        {
          filename: path.basename(pdfPath),
          path: pdfPath,
          contentType: 'application/pdf',
        },
      ],
    });

  } catch (err) {
    console.error('Ticket email error:', err);
  }
};

export const sendResetEmail = async (toEmail, resetLink) => {
  try {
    await transporter.sendMail({
      from: '"OMNITIX" <no-reply@omnitix.com>',
      to: toEmail,
      subject: 'Reset Your Password - OMNITIX',
      text: `You requested a password reset.\n\nClick this link to reset your password:\n${resetLink}\n\nThis link expires in 30 minutes.`,
      html: `
        <p>You requested a password reset.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link will expire in 30 minutes.</p>
      `,
    });

  } catch (err) {
    console.error('Reset email error:', err);
  }
};
