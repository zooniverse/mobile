import * as it from './it';
import itJson from './it.json';
import itMobileJson from './mobileIt.json';

export default { ...itJson, ...itMobileJson, ...(it.default || it) };
