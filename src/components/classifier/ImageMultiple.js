import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import {
  View,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import CircleIconButton from '../common/CircleIconButton';
import FullScreenMedia from '../FullScreenMedia';

const ImageMultiple = ({
  displays,
  // subjectDisplayWidth,
  // subjectDisplayHeight,
  swiping,
}) => {
  const images = displays?.map((disp) => ({ uri: disp.src }));
  const [slideIndex, setSlideIndex] = useState(0);
  const [showFullSizeImage, setShowFullSizeImage] = useState(false);
  const [showExpandImage, setShowExpandImage] = useState(false);
  const [longPress, setLongPress] = useState(false);
  const intervalId = useRef(null);
  const pressTimer = useRef(null); // Timer to distinguish between tap and long press
  const dimensions = Dimensions.get('window').width;

  // Start the slideshow auto-play with a setInterval.
  const startSlideshow = () => {
    setShowExpandImage(false);

    intervalId.current = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 500);
  };

  // Stop the slideshow auto-play and show the expand image button.
  const stopSlideshow = () => {
    setShowExpandImage(true);
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  };

  // When component loads start the slideshow.
  useEffect(() => {
    startSlideshow();

    return () => {
      stopSlideshow();
    };
  }, []);
  // }, [images.length]);

  // Handle when a paginate dot is pressed.
  const pageDotPressed = (dotIdx) => {
    // If the dot pressed is the currently selected dot then toggle the auto-play.
    if (dotIdx === slideIndex) {
      if (!intervalId.current) {
        startSlideshow();
      } else {
        stopSlideshow();
      }
    } else {
      // Else pause the auto-play and set slideshow index to the selected dot.
      stopSlideshow();
      setSlideIndex(dotIdx);
    }
  };

  /**
   * When the user presses an image 1 of 2 things should happen.
   * 1) When holding longer than 200ms it's assumed that the user is holding the image to pause it.
   * 2) When holding less than 200ms it's assumed the user is tapping the image.
   * The timer is used to detect the difference between the two gestures.
   */
  const onPressIn = () => {
    pressTimer.current = setTimeout(() => {
      if (swiping) return; // Don't want swiping to interfere with the start/pausing.
      setLongPress(true);
      stopSlideshow();
    }, 200);
  };

  /**
   * When the user presses out of an image it will check if the press was regestered as long or not.
   * If registered as a long press, then resume the auto-play.
   * If was not a long press, toggle the auto-play. Stop > Start & Start > Stop.
   */
  const onPressOut = () => {

    if (swiping) return; // Don't want swiping to interfere with the start/pausing.
    clearTimeout(pressTimer.current);

    if (longPress) {
      setLongPress(false); // Reset the longPress state
      startSlideshow();
    } else {
      if (intervalId.current) {
        stopSlideshow();
      } else {
        startSlideshow();
      }
    }
  };

  const PaginateDot = ({ dotIdx }) => {
    return (
      <TouchableOpacity
        onPress={() => pageDotPressed(dotIdx)}
        style={{ marginTop: 8 }}
      >
        <FontAwesome
          key={dotIdx}
          solid
          size={16}
          name={dotIdx === slideIndex ? 'circle' : 'circle-thin'}
          color="gray"
          style={{ marginHorizontal: 6 }}
        />
      </TouchableOpacity>
    );
  };


  return (
    <View style={[styles.container, { borderWidth: 0, borderColor: 'blue', width: dimensions - 32}]}>
      <View style={{borderWidth: 0, borderColor: 'red'}}>
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
          <Image
            source={images[slideIndex]}
            style={{ width: dimensions - 32, height: 294}}
            resizeMode="contain"
          />
        </TouchableWithoutFeedback>
        {showExpandImage && !longPress && (
          <TouchableOpacity
            onPress={() => setShowFullSizeImage(true)}
            style={{ position: 'absolute', right: 16, bottom: 16 }}
          >
            <FontAwesome5
              name="expand-arrows-alt"
              size={24}
              color="rgba(255, 255, 255, 0.6)"
            />
            {/* <CircleIconButton type={'expand'} radius={15} /> */}
          </TouchableOpacity>
        )}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 8, flexWrap: 'wrap', borderWidth: 0, justifyContent: 'center' }}>
        {images.map((i, idx) => (
          <PaginateDot dotIdx={idx} key={idx} />
        ))}
      </View>
      <FullScreenMedia
        source={images[slideIndex]}
        isVisible={showFullSizeImage}
        handlePress={() => setShowFullSizeImage(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
});

export default ImageMultiple;
