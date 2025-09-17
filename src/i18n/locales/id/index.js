import * as id from './id';
import idJson from './id.json';
import idMobileJson from './mobileId.json';

export default { ...idJson, ...idMobileJson, ...(id.default || id) }; 