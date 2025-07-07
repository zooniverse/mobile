import * as mr from './mr';
import mrJson from './mr.json';
import mrMobileJson from './mobileMr.json';

export default { ...mrJson, ...mrMobileJson, ...(mr.default || mr) }; 