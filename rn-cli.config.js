//This is needed because of https://github.com/oblador/react-native-vector-icons/issues/626#issuecomment-362386341
const blacklist = require('metro-config/src/defaults/blacklist')
module.exports = {
  getBlacklistRE () {
    return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/])
  },
}