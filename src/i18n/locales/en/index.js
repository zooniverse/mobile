import * as en from './en';
import enJson from './en.json';
import enMobileJson from './mobileEn.json';

export default { ...enJson, ...enMobileJson, ...(en.default || en) };
