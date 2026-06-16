'use server';

import { Resend } from 'resend';

/**
 * SGOD Email Service Protocol
 * Interfaces with Resend infrastructure to provide real-time division alerts.
 * API Key re_4hvXth4B_NFYpYfAQQaXug3xoxVMhGpAd integrated per mission requirements.
 */
const resend = new Resend('re_4hvXth4B_NFYpYfAQQaXug3xoxVMhGpAd');

export async function sendPortalEmail({
  to,
  subject,
  html,
  fromName = 'SGOD Portal',
}: {
  to: string | string[];
  subject: string;
  html: string;
  fromName?: string;
}) {
  try {
    const recipients = Array.isArray(to) ? to : [to];
    
    // Safety check for empty recipient list
    if (recipients.length === 0) return { success: false, error: 'No recipients provided' };

    // Note: Using 'onboarding@resend.dev' for immediate delivery compatibility with unverified domains.
    const { data, error } = await resend.emails.send({
      from: `${fromName} <onboarding@resend.dev>`,
      to: recipients,
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Protocol Error]:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[Email Dispatch System Failure]:', error);
    return { success: false, error };
  }
}
