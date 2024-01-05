import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Dimensions,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';

import Timestamp from './Timestamp';

function CollapsedNotification({ notification, setExpandedNotification }) {
  const windowWidth = Dimensions.get('window').width - 180;

  return (
    <TouchableOpacity
      onPress={() => setExpandedNotification(notification.id)}
      style={styles.collapsedContainer}
    >
      <View style={{ flexDirection: 'row' }}>
        {notification?.project?.avatar_src && (
          <Image
            resizeMode="cover"
            style={[styles.thumb]}
            source={{ uri: notification.project.avatar_src }}
          />
        )}
        <View style={{ width: windowWidth }}>
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} style={styles.collapsedTitle}>
              {notification?.title}
            </Text>
            <Timestamp timestamp={notification?.timestamp} />
          </View>
          <Text numberOfLines={1} style={styles.blurbText}>
            {notification?.body}
          </Text>
        </View>
      </View>
      <View>
        <Ionicons name="chevron-down" color="#A6A7A9" size={28} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  blurbText: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.2,
    color: '#000',
  },
  collapsedTitle: {
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 12.89,
    letterSpacing: 0.1,
    color: '#000',
    textTransform: 'uppercase',
  },
  collapsedContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.25,
    borderTopColor: '#A6A7A9',
    marginHorizontal: 16,
    height: 79,
  },
  thumb: {
    height: 44,
    width: 44,
    borderRadius: 6,
    marginRight: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});

CollapsedNotification.propTypes = {
  notification: PropTypes.object.isRequired,
  setExpandedNotification: PropTypes.func.isRequired,
};

export default CollapsedNotification;
