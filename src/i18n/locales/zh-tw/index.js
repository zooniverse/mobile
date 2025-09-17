import * as zhTw from './zh-tw';
import zhTwJson from './zh-TW.json';
import zhTwMobileJson from './mobileZh-tw.json';

export default { ...zhTwJson, ...zhTwMobileJson, ...(zhTw.default || zhTw) }; 