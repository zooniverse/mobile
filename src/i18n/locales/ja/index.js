import * as ja from './ja';
import jaJson from './ja.json';
import jaMobileJson from './mobileJa.json';

export default { ...jaJson, ...jaMobileJson, ...(ja.default || ja) }; 