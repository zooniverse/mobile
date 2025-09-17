import * as pt from './pt';
import ptJson from './pt.json';
import ptMobileJson from './mobilePt.json';

export default { ...ptJson, ...ptMobileJson, ...(pt.default || pt) }; 