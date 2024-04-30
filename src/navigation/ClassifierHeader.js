import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';

import { DrawerActions, useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BlurView } from '@react-native-community/blur';
import PropTypes from 'prop-types';

function ClassifierHeader({ project }) {
  const navigation = useNavigation();
  const title = project?.display_name;
  const bkgImage = project?.background?.src;
  const museumMode = project?.in_museum_mode;
  const titleWidth = museumMode ? '100%' : '70%';

  const navigateHome = () => {
    navigation.navigate('ZooniverseApp', { refresh: false });
  };

  /**
   * BlurView must not be a surrounding component or it will cause layout issues on Android.
   */
  const HeaderContent = () => (
    <View style={styles.contentContainer}>
      <BlurView
        style={styles.fullSize}
        blurType="dark"
        blurAmount={1}
        reducedTransparencyFallbackColor="black"
      />
      {!museumMode && (
        <TouchableOpacity
          onPress={navigateHome}
          style={styles.zoonIconContainer}
        >
          <Image
            source={require('../../images/zooni-nav-logo.png')}
            style={styles.navIcon}
          />
        </TouchableOpacity>
      )}
      <Text style={[styles.titleText, { width: titleWidth }]}>{title}</Text>
      {!museumMode && (
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.drawerIconContainer}
        >
          <FontAwesome name="bars" color="#fff" size={24} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {bkgImage ? (
        <ImageBackground
          source={{
            uri: bkgImage,
          }}
          resizeMode="cover"
          style={styles.headerContainer}
        >
          <HeaderContent />
        </ImageBackground>
      ) : (
        <View style={styles.headerContentContainer}>
          <HeaderContent />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  drawerIconContainer: {
    marginRight: 16,
  },
  fullSize: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  headerContainer: {
    flex: 1,
  },
  headerContentContainer: {
    backgroundColor: '#005D69',
    flex: 1,
  },
  navIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  titleText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  zoonIconContainer: {
    marginLeft: 16,
  },
});

ClassifierHeader.propTypes = {
  project: PropTypes.object,
};

export default ClassifierHeader;
