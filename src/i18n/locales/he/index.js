import * as he from './he';
import heJson from './he.json';
import heMobileJson from './mobileHe.json';

export default { ...heJson, ...heMobileJson, ...(he.default || he) }; 