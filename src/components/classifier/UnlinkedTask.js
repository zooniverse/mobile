import React from 'react'
import {
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import FontedText from '../common/FontedText'
import { addIndex, contains, map } from 'ramda'
import Toggle from 'react-native-toggle-element'

const trackBarStyles = {
  height: 12,
  width: 26,
  activeBackgroundColor: '#ADDDE0',
  inActiveBackgroundColor: '#A6A7A9',
}

const thumbButtonStyles = {
  width: 18,
  height: 18,
  radius: 9,
  activeBackgroundColor: '#005D69',
  inActiveBackgroundColor: '#EBEBEB'
}

const UnlinkedTask = (props) => {
  const annotationValues = props.annotation || []

  const renderUnlinkedTask = ( answer, idx ) => {
    return (
      <View key={ idx } style={styles.rowContainer}>
        <Toggle
          value={contains(idx, annotationValues)}
          onPress={()=>props.onAnswered(props.unlinkedTaskKey, idx)}
          trackBar={trackBarStyles}
          thumbButton={thumbButtonStyles}
        />
        <TouchableOpacity
          onPress={ ()=>props.onAnswered(props.unlinkedTaskKey, idx) }
          activeOpacity={0.5}
        >
          <FontedText style={styles.answer}>
            {answer.label }
          </FontedText>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      { addIndex(map)(
        (answer, idx) => {
          return renderUnlinkedTask(answer, idx)
        },
        props.unlinkedTask.answers
      ) }
    </View>
  )
}

const styles = EStyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    justifyContent: 'flex-end',
    margin: 15,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  switchComponent: {
    marginLeft: 0,
    marginVertical: 3,
    marginRight: 3,
  },
  answer: {
    flexWrap: 'wrap',
    margin: 3,
    fontSize: 10,
  }
});

UnlinkedTask.propTypes = {
  unlinkedTask: PropTypes.object.isRequired,
  onAnswered: PropTypes.func.isRequired,
  annotation: PropTypes.array,
  unlinkedTaskKey: PropTypes.string.isRequired,
}

export default UnlinkedTask
