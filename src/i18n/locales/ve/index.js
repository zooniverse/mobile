import * as ve from './ve';
import veJson from './ve.json';
import veMobileJson from './mobileVe.json';

export default { ...veJson, ...veMobileJson, ...(ve.default || ve) }; 