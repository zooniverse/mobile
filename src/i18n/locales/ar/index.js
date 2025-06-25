import * as ar from './ar';
import arJson from './ar.json';
import arMobileJson from './mobileAr.json';

export default { ...arJson, ...arMobileJson, ...(ar.default || ar) }; 