import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import { Actions } from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';
import ZooIcon from './ZooIcon'
import FontedText from '../components/common/FontedText'

class Discipline extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    GoogleAnalytics.trackEvent('view', this.props.tag)
    const navigationProps = {selectedProjectTag: this.props.tag, color: this.props.color}
    Actions.ProjectList(navigationProps)
  }

  render() {
    const customIconSize = this.props.tag === 'preview' ? { fontSize: 45 } : []
    return (
      <TouchableOpacity
        onPress={this.handleClick}>
        <View style={[styles.titleContainer, { backgroundColor: this.props.color }]}>
          <View style={styles.zooIconContainer}>
            { this.props.faIcon
              ? <Icon name={this.props.faIcon} style={[styles.icon, styles.faIcon, styles.zooIconContainer, customIconSize]} />
              : <ZooIcon iconName={this.props.icon} /> }
          </View>
          <FontedText style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{this.props.title}</FontedText>
          <Icon name="chevron-right" style={styles.chevronIcon} />
        </View>
      </TouchableOpacity>
    );
  }
}

const widths = {
  containerHorizontalPadding: 15,
  containerHorizontalMargin: 10,
  zooIconContainerWidth: 80,
  rightIconWidth: 20,
}

const titleSurroundWidth = widths.rightIconWidth + widths.zooIconContainerWidth +
  (widths.containerHorizontalMargin * 2) + (widths.containerHorizontalPadding * 2)

const styles = EStyleSheet.create({
  $titleSurroundWidth: titleSurroundWidth,
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: widths.containerHorizontalPadding,
    height: 90,
    marginHorizontal: widths.containerHorizontalMargin,
    marginTop: 10,
    marginBottom: 0
  },
  title: {
    color: '$textColor',
    fontSize: 26,
    fontWeight: 'bold',
    lineHeight: 31,
    width: '100% - $titleSurroundWidth'
  },
  icon: {
    fontSize: 30,
    color: '$textColor',
  },
  chevronIcon: {
    fontSize: 26,
    color: '$textColor',
  },
  faIcon: {
    paddingLeft: 10
  },
  zooIconContainer:{
    width: widths.zooIconContainerWidth
  },
});

Discipline.propTypes = {
  icon: PropTypes.string,
  faIcon: PropTypes.string,
  title: PropTypes.string.isRequired,
  tag: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
}

export default Discipline
