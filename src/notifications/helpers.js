import { Platform } from 'react-native';

/**
 * Helper function that takes a timestamp and turns it into
 * human readable format like 1s, 5m, 4d, 1y, etc...
 */
export function convertTimestampReadable(timestamp) {
  if (!timestamp) {
    return '';
  }
  if (Platform.OS === 'ios') {
    timestamp *= 1000;
  }
  const now = new Date();
  const date = new Date(timestamp);
  const timeDifference = now - date;

  // Convert milliseconds to seconds
  const seconds = Math.floor(timeDifference / 1000);

  // Define time intervals in seconds
  const minute = 60;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  const year = 365 * day;

  if (seconds < minute) {
    return `${seconds}s ago`;
  } else if (seconds < hour) {
    const minutes = Math.floor(seconds / minute);
    return `${minutes}m ago`;
  } else if (seconds < day) {
    const hours = Math.floor(seconds / hour);
    return `${hours}h ago`;
  } else if (seconds < week) {
    const days = Math.floor(seconds / day);
    return `${days}d ago`;
  } else if (seconds < month) {
    const weeks = Math.floor(seconds / week);
    return `${weeks}w ago`;
  } else if (seconds < year) {
    const months = Math.floor(seconds / month);
    return `${months}mo ago`;
  } else {
    const years = Math.floor(seconds / year);
    return `${years}y ago`;
  }
}
