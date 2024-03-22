import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import reactotron from 'reactotron-react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FullScreenMedia from '../FullScreenMedia';
import { useRoute } from '@react-navigation/native';
import DrawableSubject from '../Markings/DrawableSubject';

function ImageSingle({ displays, putImageInLocalStorage = null }) {
  if (!Array.isArray(displays) || displays.length !== 1 || !displays[0]?.src)
    return null;

  const imageSrc = displays[0].src;
  const width = Dimensions.get('window').width;
  const [showFullSizeImage, setShowFullSizeImage] = useState(false);
  const route = useRoute();
  const tool = route?.params?.tools ?? [];
  reactotron.log({tool})

  // Image.getSize(imageSrc, (width, height) => reactotron.log('wh', width, height))

  return (
    <View
      style={[
        styles.container,
        { borderWidth: 0, borderColor: 'blue', width: width - 32 },
      ]}
    >
      <View
        style={{
          borderWidth: 0,
          borderColor: 'red',
          width: width - 32,
          height: 294,
        }}
      >
        <Image
          source={{ uri: imageSrc }}
          style={{ width: width - 32, height: 294 }}
          resizeMode="contain"
        />
        <TouchableOpacity
          onPress={() => setShowFullSizeImage(true)}
          style={{
            position: 'absolute',
            right: 16,
            bottom: 16,
            borderWidth: 0,
            borderColor: 'yellow',
          }}
        >
          <FontAwesome5
            name="expand-arrows-alt"
            size={24}
            color="rgba(255, 255, 255, 0.6)"
          />
        </TouchableOpacity>
      </View>
      {tool ? (
        <DrawableSubject
          tool={tool}
          visible={showFullSizeImage}
          inMuseumMode={false}
          imageSource={imageSrc}
          onClose={() => {
            putImageInLocalStorage();

            setShowFullSizeImage(false);
          }}
          warnForRequirements={false}
        />
      ) : (
        <FullScreenMedia
          source={{ uri: imageSrc }}
          isVisible={showFullSizeImage}
          handlePress={() => setShowFullSizeImage(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 3,
    borderColor: 'red',
  },
});

export default ImageSingle;
