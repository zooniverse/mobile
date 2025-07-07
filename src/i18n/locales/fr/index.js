import * as fr from './fr';
import frJson from './fr.json';
import frMobileJson from './mobileFr.json';

export default { ...frJson, ...frMobileJson, ...(fr.default || fr) }; 