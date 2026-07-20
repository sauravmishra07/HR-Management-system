import nodemailer from 'nodemailer';
import config from '../../config/index.js';
import logger from './logger.js';

let transporter = null;

/**
 * Lazily build a nodemailer transporter. When SMTP creds are absent (dev),
 * mail is logged instead of sent so the app never crashes on missing config.
 */
function getTransporter() {
  if (transporter) return transporter;
  if (!config.mail.user || !config.mail.pass) return null;
  transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.secure,
    auth: { user: config.mail.user, pass: config.mail.pass },
  });
  return transporter;
}

export async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    logger.info(`[mail:dev] To: ${to} | Subject: ${subject}`);
    return { queued: false, dev: true };
  }
  const info = await tx.sendMail({ from: config.mail.from, to, subject, html, text });
  logger.info(`Mail sent to ${to} (${info.messageId})`);
  return { queued: true, messageId: info.messageId };
}
