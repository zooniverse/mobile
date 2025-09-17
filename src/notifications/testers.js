/**
 * List of push notification testing accounts.
 * When logged in as one of these accounts it will email the
 * push notification token to the listed email. This is used
 * for testing push notifications before they are sent to everyone.
 */
export const pushTesters = [
  {
    userName: 'corychambers',
    email: 'cory@zooniverse.org',
  },
];

// Add zootester1 through zootester10
for (let i = 1; i <= 10; i++) {
  pushTesters.push({userName: `zootester${i}`, email: 'android@zooniverse.org'})
}
