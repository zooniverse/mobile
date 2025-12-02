import { MAILERSEND_TOKEN } from '@env';

// Will email a push notification token for a tester.
export const sendEmailTestingToken = async (token, pushTester, platform) => {
  try {
    const subject = 'Firebase testing token';
    const msg = `New token for ${pushTester.userName} on ${platform}: ${token}`;
    const email = pushTester.email;

    return await sendEmail(subject, msg, email);
  } catch (e) {
    throw new Error('Issue emailing testing push notification token.');
  }
};

// Sends an email via MailerSend api, currently only used to email push notification tokens.
export const sendEmail = async (subject, msg, emailTo) => {
  try {
    const send = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MAILERSEND_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { email: 'noreply@test-2p0347z2663lzdrn.mlsender.net', name: 'Zoon Mobile App' },
        to: [{ email: emailTo }],
        subject: subject,
        text: msg,
      }),
    });

    const responseText = await send.text();
    if (!send.ok) {
      throw new Error(`MailerSend API error: ${send.status} - ${responseText}`);
    }

    return send.ok;
  } catch (e) {
    throw new Error('Issue sending email via api.');
  }
};
