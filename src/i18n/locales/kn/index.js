import * as kn from './kn';
import knJson from './kn.json';
import knMobileJson from './mobileKn.json';

export default { ...knJson, ...knMobileJson, ...(kn.default || kn) }; 