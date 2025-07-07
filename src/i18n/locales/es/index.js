import * as es from './es';
import esJson from './es.json';
import esMobileJson from './mobileEs.json';

export default { ...esJson, ...esMobileJson, ...(es.default || es) }; 