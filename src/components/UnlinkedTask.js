import React from 'react'
import {
  Switch,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { addIndex, contains, map } from 'ramda'
import theme from '../theme'

const UnlinkedTask = (props) => {
  const annotationValues = props.annotation || []

  const renderUnlinkedTask = ( answer, idx ) => {
    return (
      <View key={ idx } style={styles.rowContainer}>
        <Switch
          value={contains(idx, annotationValues)}
          style={styles.switchComponent}
          onTintColor={theme.headerColor}
          onValueChange={()=>props.onAnswered(props.unlinkedTaskKey, idx)}
        />

        <TouchableOpacity
          style={styles.answerContainer}
          onPress={ ()=>props.onAnswered(props.unlinkedTaskKey, idx) }
          activeOpacity={0.5}>
          <StyledText additionalStyles={[styles.answer]} text={ answer.label } />
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
    margin: 20
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  switchComponent: {
    margin: 3
  },
  answerContainer: {
  },
  answer: {
    alignSelf: 'center',
    flexWrap: 'wrap',
    textAlign: 'center',
    fontSize: 13,
  }
});

UnlinkedTask.propTypes = {
  unlinkedTask: React.PropTypes.object.isRequired,
  onAnswered: React.PropTypes.func.isRequired,
  annotation: React.PropTypes.array,
  unlinkedTaskKey: React.PropTypes.string.isRequired,
}

export default UnlinkedTask
