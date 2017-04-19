import { Dimensions } from 'react-native'
import { setState } from '../actions/index'

export function setDimensions() {
  return dispatch => {
    const deviceWidth = Dimensions.get('window').width
    const deviceHeight = Dimensions.get('window').height
    dispatch(setState('device.width', deviceWidth))
    dispatch(setState('device.height', deviceHeight))
    dispatch(setState('device.subjectDisplayWidth', deviceWidth - 70))
    dispatch(setState('device.subjectDisplayHeight', deviceHeight - 350))
  }

}
