import * as vi from './vi';
import viJson from './vi.json';
import viMobileJson from './mobileVi.json';

export default { ...viJson, ...viMobileJson, ...(vi.default || vi) }; 