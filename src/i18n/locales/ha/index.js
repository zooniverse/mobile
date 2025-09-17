import * as ha from './ha';
import haJson from './ha.json';
import haMobileJson from './mobileHa.json';

export default { ...haJson, ...haMobileJson, ...(ha.default || ha) }; 