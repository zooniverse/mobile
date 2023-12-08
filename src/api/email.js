import { SENDGRID_TOKEN } from '@env';

// Will email a push notification token for a tester.
export const sendEmailTestingToken = async (token, pushTester, platform) => {
  try {
    const subject = 'Firebase testing token';
    const msg = `New token for ${pushTester.userName} on ${platform}: ${token}`;
    const email = pushTester.email;

    return await sendEmail(subject, msg, email, email);
  } catch (e) {
    throw new Error('Issue emailing testing push notification token.');
  }
};

// Sends an email via sendgrid api, currently only used to email push notification tokens.
export const sendEmail = async (subject, msg, emailTo, emailFrom) => {
  try {
    const send = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: emailTo }] }],
        from: { email: emailFrom },
        subject: subject,
        content: [
          {
            type: 'text/plain',
            value: msg,
          },
        ],
      }),
    });

    return send?.ok;
  } catch (e) {
    throw new Error('Issue sending email via api.');
  }
};
