import React, { useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Swiper from 'react-native-swiper'
import { addIndex, length, map } from 'ramda'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

import TutorialStep from './TutorialStep'
import FontedText from '../common/FontedText'

import ButtonLarge from './ButtonLarge'
import PaginateDot from './PaginateDot'
import { getCurrentProjectLanguage } from '../../i18n'

const topPadding = Platform.OS === 'ios' ? 10 : 0

const Tutorial = ({
  tutorial,
  isInitialTutorial,
  inMuseumMode = false,
  finishTutorial,
}) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(0)
  const swiperRef = useRef(null)

  const steps = tutorial?.steps ?? []
  const totalSteps = length(steps)
  const hasNextStep = step + 1 < totalSteps

  const tutorialSteps = steps.map((s, index) => (
    <TutorialStep
      key={`TUTORIAL_STEP_${index}`}
      markdownContent={t(
        `tutorial.steps.${index}.content`,
        s.content,
        { ns: 'project', lng: getCurrentProjectLanguage() }
      )}
      inMuseumMode={inMuseumMode}
      mediaUri={tutorial?.mediaResources?.[s.media]?.src ?? null}
      isActive={step === index}
    />
  ))

  const renderCircle = (currentStep, index) => (
    <PaginateDot
      onPress={() => swiperRef.current?.scrollBy?.(index - step, false)}
      active={currentStep === index}
    />
  )

  const Navigation = () => {
    const justifyContent = steps.length > 9 ? 'flex-start' : 'center'
    return (
      <View style={[styles.navigation, { justifyContent }]}>
        {addIndex(map)((_s, idx) => renderCircle(step, idx), steps)}
      </View>
    )
  }

  const finishedButton = (
    <ButtonLarge
      text={t('classifier.letsGo', "Let's Go!")}
      onPress={finishTutorial}
    />
  )

  const tutorialHeader = (
    <FontedText style={[styles.tutorialHeader]}>
      {t('classifier.taskTabs.tutorialTab', 'tutorial')}
    </FontedText>
  )

  return (
    <View style={styles.container}>
      {isInitialTutorial ? tutorialHeader : null}
      <View style={styles.container}>
        <Swiper
          ref={swiperRef}
          showsPagination={false}
          loop={false}
          onIndexChanged={(index) => setStep(index)}
          loadMinimal={true}
        >
          {tutorialSteps}
        </Swiper>
      </View>
      <View style={styles.footer}>
        <View style={styles.line} />
        {!hasNextStep && finishedButton}
        {totalSteps > 0 ? <Navigation /> : null}
      </View>
    </View>
  )
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBEBEB',
  },
  firstTutorialContainer: {
    flex: 1,
    paddingTop: topPadding,
    paddingBottom: 0,
  },
  content: {
    height: '100% - 300',
    marginHorizontal: 25,
    backgroundColor: 'white',
  },
  scrollViewContainerStyle: {
    padding: 15,
  },
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    marginVertical: 16,
    minHeight: 16,
  },
  circleIcon: {
    fontSize: 12,
    color: 'black',
    paddingHorizontal: 3,
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  navIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIcon: {
    fontSize: 16,
    color: '$darkGrey',
    padding: 10,
    backgroundColor: 'transparent',
  },
  disabledIcon: {
    color: '$disabledIconColor',
  },
  emptyNav: {
    height: 36,
    width: 36,
  },
  orangeButton: {
    backgroundColor: '$orange',
    marginBottom: 0,
  },
  tealButton: {
    backgroundColor: '$zooniverseTeal',
    marginBottom: 0,
  },
  whiteText: {
    color: 'white',
  },
  blackText: {
    color: 'black',
  },
  line: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '$lightGreyBackground',
  },
  tutorialHeader: {
    fontSize: 18,
    marginHorizontal: 30,
    marginTop: 10,
    marginBottom: 10,
    paddingTop: topPadding,
    paddingBottom: 0,
    fontWeight: '600',
    letterSpacing: 0.05,
    color: '#005D69',
    textTransform: 'uppercase',
  },
  markdown: {
    flex: 1,
    marginTop: 15,
  },
})

Tutorial.propTypes = {
  tutorial: PropTypes.object,
  projectName: PropTypes.string,
  finishTutorial: PropTypes.func,
  isInitialTutorial: PropTypes.bool,
  inMuseumMode: PropTypes.bool,
}

export default Tutorial
