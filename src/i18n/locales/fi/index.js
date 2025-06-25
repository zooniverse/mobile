import * as fi from './fi';
import fiJson from './fi.json';
import fiMobileJson from './mobileFi.json';

export default { ...fiJson, ...fiMobileJson, ...(fi.default || fi) }; 