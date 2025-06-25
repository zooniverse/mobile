import * as uk from './uk';
import ukJson from './uk.json';
import ukMobileJson from './mobileUk.json';

export default { ...ukJson, ...ukMobileJson, ...(uk.default || uk) }; 