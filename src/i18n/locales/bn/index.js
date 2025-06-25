import * as bn from './bn';
import bnJson from './bn.json';
import bnMobileJson from './mobileBn.json';

export default { ...bnJson, ...bnMobileJson, ...(bn.default || bn) }; 