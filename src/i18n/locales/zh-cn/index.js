import * as zhCn from './zh-cn';
import zhCnJson from './zh-CN.json';
import zhCnMobileJson from './mobileZh-cn.json';

export default { ...zhCnJson, ...zhCnMobileJson, ...(zhCn.default || zhCn) }; 