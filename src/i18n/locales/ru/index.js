import * as ru from './ru';
import ruJson from './ru.json';
import ruMobileJson from './mobileRu.json';

export default { ...ruJson, ...ruMobileJson, ...(ru.default || ru) }; 