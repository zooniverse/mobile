import * as el from './el';
import elJson from './el.json';
import elMobileJson from './mobileEl.json';

export default { ...elJson, ...elMobileJson, ...(el.default || el) }; 