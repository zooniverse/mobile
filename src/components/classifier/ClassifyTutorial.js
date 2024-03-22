import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Swiper from 'react-native-swiper';
import ClassifyTutorialStep from './ClassifyTutorialStep';
import { useDispatch, useSelector } from 'react-redux';
import PaginateDot from './PaginateDot';
import LetsGoBtn from './LetsGoBtn';
import { setTutorialCompleted } from '../../actions/classifier';

const ClassifyTutorial = ({
  workflowId,
  needsTutorial,
  projectId = null,
  setShowTaskTab = () => {},
}) => {
  const dispatch = useDispatch();
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { tutorial } = useSelector((state) => state.classifier);
  const wfTutorial = tutorial[workflowId] || {};
  const steps = wfTutorial?.steps ?? [];
  const mediaResources = tutorial?.mediaResources ?? {};

  const navigateToSlide = (index) => {
    swiperRef.current.scrollTo(index);
  };

  const finishTutorial = () => {
    if (needsTutorial) {
      dispatch(setTutorialCompleted(workflowId, projectId));
    } else {
      // go to tasks
      setShowTaskTab(true)
    }
  };

  return (
    <View style={styles.container}>
      <Swiper
        ref={swiperRef}
        showsButtons={false}
        showsPagination={false}
        loop={false}
        onIndexChanged={setActiveIndex}
      >
        {steps.map((step, index) => {
          const mediaUri = mediaResources[step?.media]?.src ?? null;
          return (
            <ClassifyTutorialStep key={index} step={step} mediaUri={mediaUri} />
          );
        })}
      </Swiper>
      <View style={styles.bottomContainer}>
        {activeIndex === steps.length - 1 && (
          <LetsGoBtn onPress={finishTutorial} />
        )}
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <PaginateDot
              key={index}
              active={index === activeIndex}
              onPress={() => navigateToSlide(index)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomContainer: {
    // height: 100,
    marginHorizontal: 16,
    marginTop: 16,
    justifyContent: 'space-around',
  },
  container: {
    // borderWidth: 3,
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
});

export default ClassifyTutorial;
