import React, { useEffect } from 'react';
import { View } from 'react-native';

import PropTypes from 'prop-types';

import PastNotificationsTitle from './PastNotificationsTitle';
import ExpandedNotification from './ExpandedNotification';
import CollapsedNotification from './CollapsedNotification';

function Notification({
  notification,
  expandedNotification,
  setExpandedNotification,
  index,
}) {
  useEffect(() => {
    if (!expandedNotification && index === 0) {
      setExpandedNotification(notification?.id);
    }
  }, []);

  return (
    <View>
      {index === 1 && <PastNotificationsTitle />}
      {expandedNotification === notification?.id ? (
        <ExpandedNotification notification={notification} />
      ) : (
        <CollapsedNotification
          notification={notification}
          setExpandedNotification={setExpandedNotification}
        />
      )}
    </View>
  );
}

Notification.propTypes = {
  notification: PropTypes.object.isRequired,
  expandedNotification: PropTypes.bool.isRequired,
  setExpandedNotification: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
};

export default Notification;
