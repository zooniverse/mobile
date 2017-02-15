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
import ZooIcon from './ZooIcon'

class Discipline extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    GoogleAnalytics.trackEvent('view', this.props.tag)
    this.props.setSelectedProjectTag()
    Actions.ProjectList({tag: this.props.tag, color: this.props.color})
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.handleClick}>
        <View style={[styles.titleContainer, { backgroundColor: this.props.color }]}>
          <View style={styles.zooIconContainer}>
            { this.props.faIcon
              ? <Icon name={this.props.faIcon} style={[styles.icon, styles.faIcon, styles.zooIconContainer]} />
              : <ZooIcon iconName={this.props.icon} /> }
          </View>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{this.props.title}</Text>
          <Icon name="angle-right" style={styles.icon} />
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
    borderRadius: 4,
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
    fontFamily: 'OpenSans-Semibold',
    backgroundColor: '$transparent',
    color: '$textColor',
    fontSize: 28,
    lineHeight: 38,
    width: '100% - $titleSurroundWidth'
  },
  icon: {
    fontSize: 30,
    color: '$textColor',
    width: widths.rightIconWidth,
  },
  faIcon: {
    paddingLeft: 10
  },
  zooIconContainer:{
    width: widths.zooIconContainerWidth
  },
});

Discipline.propTypes = {
  icon: React.PropTypes.string,
  faIcon: React.PropTypes.string,
  title: React.PropTypes.string.isRequired,
  tag: React.PropTypes.string.isRequired,
  color: React.PropTypes.string.isRequired,
  setSelectedProjectTag: React.PropTypes.func.isRequired
}

export default Discipline
