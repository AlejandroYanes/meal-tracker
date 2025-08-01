import { type ReactElement } from 'react';
import { Resend } from 'resend';

import { env } from '@/env';
import { isProductionServer } from '@/utils/envs';

const resend = new Resend(env.RESEND_API_KEY);

interface Payload {
  to: string;
  subject: string;
  body: ReactElement | string;
}

export async function sendEmail(payload: Payload) {
  const { error, data } = await resend.emails.send({
    from: 'Meal Tracker <contact@auth-natant.co.uk>',
    to: payload.to,
    subject: payload.subject,
    react: payload.body,
  });

  if (error) {
    console.log(`❌ Error sending email to ${payload.to}`);
    console.error(error);
    return { success: false, email: payload.to, message: error.message };
  }

  return { success: true, email: payload.to, data };
}

interface BatchPayload {
  to: string[];
  from?: string;
  subject: string;
  body: ReactElement | string;
}

export async function sendEmailBatch(payload: BatchPayload) {
  const batch = payload.to.map((to) => ({
    from: payload.from ?? 'Writer <contact@auth-natant.co.uk>',
    to,
    subject: payload.subject,
    react: payload.body,
  }));

  const { error, data } = await resend.batch.send(batch);

  if (error) {
    console.log(`❌ Error sending email batch: ${error.message}`);
    return { success: false, email: payload.to, message: error.message };
  }

  return { success: true, email: payload.to, data };
}

interface VerificationEmailPayload {
  email: string;
  url: string;
}
export function sendVerificationEmail(payload: VerificationEmailPayload) {
  return sendEmail({
    to: isProductionServer() ? payload.email : env.RESEND_FALLBACK_EMAIL,
    subject: 'Sign in to Writer',
    body: (
      <div>
        <p>
          Please verify your email address by clicking the link below:
        </p>
        <a href={payload.url}>{payload.url}</a>
        <br />
        <br />
        <p>
          This link will expire in 24 hours.
        </p>
      </div>
    ),
  });
}
