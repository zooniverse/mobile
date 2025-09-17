import * as sv from './sv';
import svJson from './sv.json';
import svMobileJson from './mobileSv.json';

export default { ...svJson, ...svMobileJson, ...(sv.default || sv) }; 