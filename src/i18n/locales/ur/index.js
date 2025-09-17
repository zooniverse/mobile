import * as ur from './ur';
import urJson from './ur.json';
import urMobileJson from './mobileUr.json';

export default { ...urJson, ...urMobileJson, ...(ur.default || ur) }; 