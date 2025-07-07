import React from 'react'
import EStyleSheet from 'react-native-extended-stylesheet'
import {
    View, 
    ActivityIndicator
} from 'react-native'
import PropTypes from 'prop-types'

import FontedText from './FontedText'
import Theme from '../../theme'
import { useTranslation } from 'react-i18next'

const SubjectLoadingIndicator = (props) => {
    const { t } = useTranslation();
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.$zooniverseTeal} />
        <FontedText style={styles.loadingText}>
          {props.multipleSubjects
            ? t('Mobile.classifier.loadingSubjects', 'Loading Subjects')
            : t('Mobile.classifier.loadingSubject', 'Loading Subject')}
        </FontedText>
      </View>
    );
}

SubjectLoadingIndicator.propTypes = {
    multipleSubjects: PropTypes.bool
}

const styles = EStyleSheet.create({
    loadingContainer: {
        flex:1, 
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    loadingText: {
        color: '$zooniverseTeal'
    }
})

export default SubjectLoadingIndicator