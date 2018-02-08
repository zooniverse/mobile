import React from 'react'
import {
  Animated,
  Image,
  ImageBackground,
  StatusBar,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Button from './Button'
import { Actions } from 'react-native-router-flux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

GoogleAnalytics.trackEvent('view', 'Onboarding')

class Onboarding extends React.Component {
  constructor(props) {
    super(props)
    this.handlePress = this.handlePress.bind(this)
     this.state = {
       fadeAnim: new Animated.Value(0), // init opacity 0
     }
  }

  componentDidMount() {
    StatusBar.setHidden(true)
    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 1,
        delay: 1000
      }
    ).start()
  }

  handlePress() {
    Actions.SignIn()
  }

  componentWillUnmount() {
    StatusBar.setHidden(false)
  }

  getRandomImage(images) {
    const randomInt = Math.round(Math.random() * (images.length - 1))
    return images[randomInt]
  }


  render() {
    const images=[
      require('../../images/Planet.jpg'),
      require('../../images/Penguin.jpg'),
      require('../../images/Chimp.jpg'),
      require('../../images/Space.jpg')]

    const introText = 'The Zooniverse enables everyone to take part in real cutting edge research in many fields across the sciences, humanities, and more.'

    var requiredImage = this.getRandomImage(images)

    return (
      <ImageBackground source={requiredImage} style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../images/logo.png')} style={styles.logo} />
          <StyledText
            additionalStyles={[styles.text]}
            text={introText} />
        </View>
        <View style={styles.footerContainer}>
          <Animated.View style={{opacity: this.state.fadeAnim}}>
            <Button
              additionalStyles={[styles.button]}
              additionalTextStyles={[styles.buttonText]}
              handlePress={this.handlePress}
              text={'Get Started'} />
          </Animated.View>
        </View>
      </ImageBackground>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'black',
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '30%',
  },
  logo: {
    width: '80%',
    height: '10%',
    resizeMode: 'contain',
  },
  subheader: {
    fontSize: 24,
    backgroundColor: 'transparent',
    color: 'white'
  },
  text: {
    backgroundColor: 'transparent',
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    width: '80%',
  },
  footerContainer: {
    alignSelf: 'flex-end',
    paddingBottom: 50,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%'
  },
  button: {
    backgroundColor: 'white',
    width: '70%',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '$darkTeal',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 22,
    letterSpacing: 1,
    textAlign: 'center',
  }


})

export default Onboarding
