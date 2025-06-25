import * as de from './de';
import deJson from './de.json';
import deMobileJson from './mobileDe.json';

export default { ...deJson, ...deMobileJson, ...(de.default || de) }; 