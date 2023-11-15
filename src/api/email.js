/**
 * TODO:
 * Update so that when zootester1 logs in it emails the token to collab@zooniverse.com
 * Also when corychambers logs in to email cory.
 * Should set local storage so it only emails the email one time
 * sendgrid credentials should be shared and stored in passbolt.
 * use .env file to store the api token.
 */
export const sendEmail = (msg) => {
  fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization:
        'Bearer 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',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: 'cory@zooniverse.org' }] }],
      from: { email: 'cory@zooniverse.org' },
      subject: 'New Firebase Token',
      content: [
        {
          type: 'text/plain',
          value: msg,
        },
      ],
    }),
  });
};
