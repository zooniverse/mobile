export function isValidLogin(login) {
  return !login.match(/[\s\-\']/)
}
