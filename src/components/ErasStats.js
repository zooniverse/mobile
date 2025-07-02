import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

import auth from 'panoptes-client/lib/auth';
import { useFocusEffect } from '@react-navigation/native';

import { getErasStats } from '../api/eras';
import theme from '../theme';

function ErasStats({ user }) {
  const [erasStats, setErasStats] = useState(null);
  const [showThisWeek, setShowThisWeek] = useState(false);

  /**
   * useFocusEffect to refetch the eras stats everytime the user
   * comes back to the home screen.
   */
  useFocusEffect(
    React.useCallback(() => {
      fetchStats();
    }, [])
  );

  const getStatsDateString = (date) => {
    if (date instanceof Date) {
      return date.toISOString().substring(0, 10)
    } else {
      return date?.substring(0, 10)
    }
  }

  const fetchStats = async () => {
    /**
     * It makes a direct API call to get the eras stats which means
     * it'll need a user token. It needs to call checkCurrent to ensure
     * there is a token available when you call checkBearerToken.
     * Without this, the token could be empty if no other API calls 
     * had already been made.
     */
    await auth.checkCurrent();
    const getToken = await auth.checkBearerToken();

    // Set the date variables.
    const today = new Date()
    const todayUTC = getStatsDateString(today)
    const thisWeekStart = new Date()
    thisWeekStart.setUTCDate(today.getUTCDate() - 6)

    // Use Promise.all to run these two async tasks in parallel
    const [thisWeek, allTime] = await Promise.all([
      getErasStats(user?.id, getStatsDateString(thisWeekStart), todayUTC, 'day', `Bearer ${getToken}`),
      getErasStats(
        user?.id,
        getStatsDateString(user?.created_at),
        todayUTC,
        'month',
        `Bearer ${getToken}`
      ),
    ]);

    // If there was no error, set the state.
    if (!allTime?.error && !thisWeek?.error) {
      setErasStats({
        thisWeek: {
          classifications:
            typeof thisWeek?.total_count === 'number'
              ? thisWeek.total_count
              : '',
          projects: Array.isArray(thisWeek?.project_contributions)
            ? thisWeek.project_contributions.length
            : '',
        },
        allTime: {
          classifications:
            typeof allTime?.total_count === 'number' ? allTime.total_count : '',
          projects: Array.isArray(allTime?.project_contributions)
            ? allTime.project_contributions.length
            : '',
        },
      });
    }
  };

  if (!erasStats) return null;

  const classifications = showThisWeek
    ? erasStats?.thisWeek?.classifications
    : erasStats?.allTime?.classifications;
  const projects = showThisWeek
    ? erasStats?.thisWeek?.projects
    : erasStats?.allTime?.projects;

  const thisWeekBorderWidth = showThisWeek ? 3.5 : 1.5;
  const thisWeekBorderColor = showThisWeek
    ? theme.$zooniverseTeal
    : theme.$disabledGrey;
  const thisWeekTitleColor = showThisWeek ? theme.$black : theme.$disabledGrey;
  const allTimeBorderWidth = !showThisWeek ? 3.5 : 1.5;
  const allTimeBorderColor = !showThisWeek
    ? theme.$zooniverseTeal
    : theme.$disabledGrey;
  const allTimeTitleColor = !showThisWeek ? theme.$black : theme.$disabledGrey;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomWidth: thisWeekBorderWidth,
              borderColor: thisWeekBorderColor,
            },
          ]}
          onPress={() => setShowThisWeek(true)}
        >
          <Text style={[styles.tabTitle, { color: thisWeekTitleColor }]}>
            THIS WEEK
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomWidth: allTimeBorderWidth,
              borderColor: allTimeBorderColor,
            },
          ]}
          onPress={() => setShowThisWeek(false)}
        >
          <Text style={[styles.tabTitle, { color: allTimeTitleColor }]}>
            ALL TIME
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.countContainer}>
        <View style={styles.countSection}>
          <Text style={styles.countTitle}>Classifications</Text>
          <Text style={styles.count}>{classifications}</Text>
        </View>
        <View style={styles.countSection}>
          <Text style={styles.countTitle}>Projects</Text>
          <Text style={styles.count}>{projects}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: 428,
    width: '100%',
  },
  count: {
    fontWeight: '600',
    letterSpacing: 0.5,
    color: theme.$zooniverseTeal,
    fontSize: 37.5,
    marginTop: 4,
  },
  countContainer: {
    flexDirection: 'row',
  },
  countSection: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  countTitle: {
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 18.7,
    letterSpacing: 0.5,
    color: theme.$black,
    marginTop: 16,
  },
  tab: {
    width: '50%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    height: 32,
    marginTop: 16,
  },
  tabTitle: {
    fontWeight: '700',
    fontSize: 12,
    lineHeight: 14.03,
    letterSpacing: 0.5,
    color: theme.$black,
  },
});

export default ErasStats;
