import * as ko from './ko';
import koJson from './ko.json';
import koMobileJson from './mobileKo.json';

export default { ...koJson, ...koMobileJson, ...(ko.default || ko) }; 