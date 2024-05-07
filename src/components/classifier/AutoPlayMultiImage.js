import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import {
  View,
  Image,
  StyleSheet,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';

import ExpandImageIcon from './ExpandImageIcon';
import SubjectLoadingIndicator from '../common/SubjectLoadingIndicator';

const AutoPlayMultiImage = ({ images, swiping, expandImage, currentCard }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showExpandImage, setShowExpandImage] = useState(false);
  const [longPress, setLongPress] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const intervalId = useRef(null);
  const pressTimer = useRef(null); // Timer to distinguish between tap and long press

  // Preload images
  useEffect(() => {
    const preloadImages = async () => {
      try {
        // Android has an issue where the images will flash during the first iteration unless you preload.
        // I tried prefetch but the issue still occurred. Apparently, getSize will actually preload the images.
        await Promise.all(images.map((image) => Image.getSize(image.uri)));
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error preloading images', error);
      }
    };

    if (images.length > 0) {
      preloadImages();
    }
  }, [images]);

  // Start the slideshow auto-play with a setInterval.
  const startSlideshow = () => {
    setShowExpandImage(false);

    intervalId.current = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex + 1) % images.length); // Makes sure it wraps aronud to zero.
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

  // When component loads start the slideshow. Only do this if it is the current card to prevent peformance issues and glitchy behavior.
  useEffect(() => {
    if (currentCard && imagesLoaded) {
      startSlideshow();
    }

    return () => {
      stopSlideshow();
    };
  }, [currentCard, imagesLoaded]);

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
        style={styles.dotContainer}
      >
        <FontAwesome
          key={dotIdx}
          solid
          size={16}
          name={dotIdx === slideIndex ? 'circle' : 'circle-thin'}
          color="gray"
          style={styles.dot}
        />
      </TouchableOpacity>
    );
  };


  return (
    <View style={styles.container}>
      {!imagesLoaded ? (
        <SubjectLoadingIndicator multipleSubjects={true} />
      ) : (
        <>
            <>
              <TouchableWithoutFeedback
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                key={images[slideIndex].uri}
              >
                <Image
                  source={images[slideIndex]}
                  style={styles.image}
                  resizeMode="contain"
                />
              </TouchableWithoutFeedback>
            </>
          {showExpandImage && !longPress && (
            <TouchableOpacity
              onPress={() => expandImage(images[slideIndex]?.uri)}
              style={styles.expandContainer}
            >
              <ExpandImageIcon />
            </TouchableOpacity>
          )}
          {
            // Only show the pagination dots if it is the current card on top
            currentCard && (
              <View style={styles.dotsContainer}>
                {images.map((i, idx) => (
                  <PaginateDot dotIdx={idx} key={idx} />
                ))}
              </View>
            )
          }
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  dot: {
    marginHorizontal: 6,
  },
  dotContainer: {
    marginTop: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
    borderWidth: 0,
    justifyContent: 'center',
  },
  expandContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  image: {
    flex: 1, // Allows the image to expand
    width: undefined, // Ensures width and height are not constrained by specific values
    height: undefined,
    alignSelf: 'stretch', // Stretches the image to the boundaries of its container
  },
});

AutoPlayMultiImage.propTypes = {
  images: PropTypes.array,
  swiping: PropTypes.bool,
  expandImage: PropTypes.func,
  currentCard: PropTypes.bool,
  dotIdx: PropTypes.number,
};

export default AutoPlayMultiImage;
