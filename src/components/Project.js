import React, { Component } from 'react';
import {
  Alert,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'

class Project extends Component {
  constructor(props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
    GoogleAnalytics.trackEvent('view', this.props.project.display_name)
    if (this.props.project.redirect) {
      this.openURL(this.props.project.redirect)
    } else {
      Actions.ZooWebView({project: this.props.project})
    }

  }

  openURL(url){
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'Sorry, but it looks like you are unable to open the project in your default browser.',
        )
      }
    });
  }

  render() {
    const imageURI = `https://${this.props.project.avatar_src}`
    return (
      <View style={styles.container}>
        <Image source={{uri: imageURI}} style={styles.avatar} />
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.handleClick}
          style={styles.touchContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>{this.props.project.display_name}</Text>
            <Icon name="angle-right" style={styles.icon} />
          </View>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  $boxHeight: 220,
  $titleHeight: 36,
  $borderRadius: 4,
  container: {
    height: '$boxHeight + 12',
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20,
  },
  avatar: {
    borderRadius: '$borderRadius',
    flex: 1,
    height: '$boxHeight',
    resizeMode: 'cover'
  },
  touchContainer: {
    position: 'absolute',
    bottom: 0
  },
  titleContainer: {
    borderBottomLeftRadius: '$borderRadius',
    borderBottomRightRadius: '$borderRadius',
    backgroundColor: '$projectTitleColor',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingRight: 15,
    height: '$titleHeight',
  },
  title: {
    backgroundColor: '$transparent',
    color: '$textColor',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 20,
    width: '100% - 60'
  },
  icon: {
    backgroundColor: '$transparent',
    color: '$textColor',
    fontSize: 30,
    width: 60
  }
});

Project.propTypes = { project: React.PropTypes.object.isRequired }
export default Project
