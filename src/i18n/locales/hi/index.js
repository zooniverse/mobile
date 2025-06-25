import * as hi from './hi';
import hiJson from './hi.json';
import hiMobileJson from './mobileHi.json';

export default { ...hiJson, ...hiMobileJson, ...(hi.default || hi) }; 