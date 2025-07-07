import * as nl from './nl';
import nlJson from './nl.json';
import nlMobileJson from './mobileNl.json';

export default { ...nlJson, ...nlMobileJson, ...(nl.default || nl) }; 