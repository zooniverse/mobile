import { createMockComponent } from './mockUtils'

const DeviceInfo = createMockComponent('DeviceInfo');
DeviceInfo.isTablet = () => false
export default DeviceInfo;