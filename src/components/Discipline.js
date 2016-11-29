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
    Actions.ProjectList()
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.handleClick}>
        <View style={[styles.titleContainer, { backgroundColor: this.props.color }]}>
          <View style={styles.zooIconContainer}>
            <ZooIcon iconName={this.props.icon} />
          </View>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{this.props.title}</Text>
          <Icon name="angle-right" style={styles.icon} />
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = EStyleSheet.create({
  titleContainer: {
    borderRadius: 4,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
    height: 90,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
    marginBottom: 0
  },
  title: {
    fontFamily: 'OpenSans-Semibold',
    backgroundColor: '$transparent',
    color: '$textColor',
    fontSize: 22,
    lineHeight: 30,
    width: '100% - 120'
  },
  icon: {
    fontSize: 30,
    color: '$textColor',
    width: 20,
  },
  zooIconContainer:{
    width: 60
  },
});

Discipline.propTypes = {
  icon: React.PropTypes.string.isRequired,
  title: React.PropTypes.string.isRequired,
  tag: React.PropTypes.string.isRequired,
  color: React.PropTypes.string.isRequired,
  setSelectedProjectTag: React.PropTypes.func.isRequired
}

export default Discipline
