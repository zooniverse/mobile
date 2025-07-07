import * as sw from './sw';
import swJson from './sw.json';
import swMobileJson from './mobileSw.json';

export default { ...swJson, ...swMobileJson, ...(sw.default || sw) }; 