import * as hr from './hr';
import hrJson from './hr.json';
import hrMobileJson from './mobileHr.json';

export default { ...hrJson, ...hrMobileJson, ...(hr.default || hr) }; 