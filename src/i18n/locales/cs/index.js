import * as cs from './cs';
import csJson from './cs.json';
import csMobileJson from './mobileCs.json';

export default { ...csJson, ...csMobileJson, ...(cs.default || cs) }; 