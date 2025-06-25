import * as te from './te';
import teJson from './te.json';
import teMobileJson from './mobileTe.json';

export default { ...teJson, ...teMobileJson, ...(te.default || te) }; 