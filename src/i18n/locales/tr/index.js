import * as tr from './tr';
import trJson from './tr.json';
import trMobileJson from './mobileTr.json';

export default { ...trJson, ...trMobileJson, ...(tr.default || tr) }; 