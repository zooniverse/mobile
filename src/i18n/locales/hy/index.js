import * as hy from './hy';
import hyJson from './hy.json';
import hyMobileJson from './mobileHy.json';

export default { ...hyJson, ...hyMobileJson, ...(hy.default || hy) }; 