import * as pl from './pl';
import plJson from './pl.json';
import plMobileJson from './mobilePl.json';

export default { ...plJson, ...plMobileJson, ...(pl.default || pl) }; 