import * as da from './da';
import daJson from './da.json';
import daMobileJson from './mobileDa.json';

export default { ...daJson, ...daMobileJson, ...(da.default || da) }; 