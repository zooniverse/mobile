import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import ClassifyQuestion from './ClassifyQuestion';
import Swiper from 'react-native-deck-swiper';
import { useDispatch, useSelector } from 'react-redux';
import reactotron from 'reactotron-react-native';
import ImageMultiple from './ImageMultiple';
import {
  addAnnotationToTask,
  addSubjectsForWorklow,
  saveClassification,
} from '../../actions/classifier';
import SwiperButtons from './SwiperButtons';
import ImageSingle from './ImageSingle';

function WorkflowTypeSwipe({ task, workflow }) {
  const swiperRef = useRef();
  const dispatch = useDispatch();
  const [swiperIndex, setSwiperIndex] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [swiperDimensions, setSwiperDimensions] = useState({
    width: 1,
    height: 1,
  });
  const { subjectLists: subjectListsFromState } = useSelector(
    (state) => state.classifier
  );
  const subjectLists = subjectListsFromState[workflow?.id] ?? [];

  const onSwiperLayout = (layout) => {
    setSwiperDimensions({
      width: layout?.width ?? 1,
      height: layout?.height ?? 1,
    });
  };

  // it should swipe when you click the yes/no buttons
  const ShowCard = ({ subject, index }) => {
    reactotron.log({ subject });
    const displays = subject?.displays ?? [];
    if (displays.length === 1) {
      return (
        <ImageSingle
          displays={displays}
          // subjectDisplayWidth={swiperDimensions?.width}
          // subjectDisplayHeight={swiperDimensions?.height}
        />
      );
    } else if (displays.length > 1 && index === swiperIndex) {
      return (
        <ImageMultiple
          displays={displays}
          // subjectDisplayWidth={swiperDimensions?.width}
          // subjectDisplayHeight={swiperDimensions?.height}
          swiping={false}
        />
      );
    }

    /**
     * Fallback if for some reason there are no images.
     * Or if there are multiple but it is not the currently displayed image
     * in the multi-image set. The reasoning is that it shouldn't
     * start the auto-play for multiple images for performance reasons.
     */
    return null;
  };

  const onAnswered = (answer, subject) => {
    const { id, first_task } = workflow;
    dispatch(addAnnotationToTask(id, first_task, answer, false));
    dispatch(saveClassification(workflow, subject, swiperDimensions));
    setSwiperIndex((prev) => prev + 1);
    // this.props.classifierActions.addAnnotationToTask(
    //   id,
    //   first_task,
    //   answer,
    //   false
    // );
    // this.props.classifierActions.saveClassification(
    //   this.props.route.params.workflow,
    //   subject,
    //   this.state.swiperDimensions
    // );
    // this.setState({ swiperIndex: this.state.swiperIndex + 1 });
  };

  const swiperLabelStyle = {
    label: {
      color: 'white',
      fontWeight: 'normal',
    },
    wrapper: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      width: swiperDimensions.width,
      height: swiperDimensions.height,
    },
  };

  const windowWidth = Dimensions.get('window').width;

  const onSwiped = (subjectIndex) => {
    // this.setState({swiperIndex: this.state.swiperIndex + 1})
    setSwiperIndex((prev) => prev + 1);

    if (subjectIndex > subjectLists.length - 8) {
      dispatch(addSubjectsForWorklow(workflow?.id));
      // this.props.classifierActions.addSubjectsForWorklow(this.props.route.params.workflow.id)
    }
  };

  return (
    <View style={styles.container}>
      <ClassifyQuestion question={task?.question} />
      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cardHorizontalMargin={0}
          keyExtractor={(cardData) => cardData?.id}
          cards={subjectLists}
          renderCard={(card, index) => (
            <ShowCard subject={card} index={index} />
          )}
          cardVerticalMargin={0}
          marginTop={0}
          backgroundColor="transparent"
          onSwipedAll={onSwiped}
          onSwipedRight={(cardIndex) =>
            onAnswered(0, this.props.subjectLists[cardIndex])
          }
          onSwipedLeft={(cardIndex) =>
            onAnswered(1, this.props.subjectLists[cardIndex])
          }
          dragStart={() => setSwiping(true)}
          dragEnd={() => setSwiping(false)}
          cardIndex={swiperIndex}
          disableTopSwipe
          disableBottomSwipe
          outputRotationRange={['-30deg', '0deg', '30deg']}
          overlayOpacityHorizontalThreshold={10}
          swipeAnimationDuration={500}
          animateOverlayLabelsOpacity
          animateCardOpacity
          inputOverlayLabelsOpacityRangeX={[
            -windowWidth / 4,
            0,
            windowWidth / 4,
          ]}
          outputOverlayLabelsOpacityRangeX={[1, 0, 1]}
          verticalSwipe={false}
          stackSeparation={-18}
          stackSize={2}
          overlayLabels={{
            left: {
              title: 'No',
              style: swiperLabelStyle,
            },
            right: {
              title: 'Yes',
              style: swiperLabelStyle,
            },
          }}
          loadMinimal={true}
        />
      </View>
      <SwiperButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  swiperContainer: {
    flex: 1,
  },
});

export default WorkflowTypeSwipe;
