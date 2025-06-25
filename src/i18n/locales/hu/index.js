import * as hu from './hu';
import huJson from './hu.json';
import huMobileJson from './mobileHu.json';

export default { ...huJson, ...huMobileJson, ...(hu.default || hu) }; 