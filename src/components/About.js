import React from 'react'
import {
  ScrollView,
  Text,
  View
} from 'react-native'
import { connect } from 'react-redux'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'

import StyledText from './StyledText'
import { setNavbarSettingsForPage } from '../actions/navBar'
import PageKeys from '../constants/PageKeys'

class About extends React.Component {

  componentDidMount() {
    this.props.setNavbarSettingsForPage({
      title: 'About',
      showBack: true,
      centerType: 'title'
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.block}>
            <View style={styles.header}><StyledText textStyle={'largeBold'} text={'What is the Zooniverse?'} /></View>
            <Text style={styles.paragraph}>
              The Zooniverse is the world’s largest and most popular platform for people-powered research. This research is made possible by volunteers—hundreds of thousands of people around the world who come together to assist professional researchers. Our goal is to enable research that would not be possible, or practical, otherwise. Zooniverse research results in new discoveries, datasets useful to the wider research community, and many publications.
            </Text>
          </View>

          <View style={styles.block}>
            <View style={styles.header}><StyledText textStyle={'largeBold'} text={'Anyone can be a researcher'} /></View>
            <Text style={styles.paragraph}>
              You don’t need any specialised background, training, or expertise to participate in any Zooniverse projects. We make it easy for anyone to contribute to real academic research, on their own computer, at their own convenience.
            </Text>
            <Text style={styles.paragraph}>
              You’ll be able to study authentic objects of interest gathered by researchers, like images of faraway galaxies, historical records and diaries, or videos of animals in their natural habitats. By answering simple questions about them, you’ll help contribute to our understanding of our world, our history, our Universe, and more.
            </Text>
            <Text style={styles.paragraph}>
              With our wide-ranging and ever-expanding suite of projects, covering many disciplines and topics across the sciences and humanities, there’s a place for anyone and everyone to explore, learn and have fun in the Zooniverse. To volunteer with us, just go to the Projects page, choose one you like the look of, and get started.
            </Text>
          </View>

          <View style={styles.block}>
            <View style={styles.header}><StyledText textStyle={'largeBold'} text={'We accelerate important research by working together'} /></View>
            <Text style={styles.paragraph}>
              The major challenge of 21st century research is dealing with the flood of information we can now collect about the world around us. Computers can help, but in many fields the human ability for pattern recognition—and our ability to be surprised—makes us superior. With the help of Zooniverse volunteers, researchers can analyze their information more quickly and accurately than would otherwise be possible, saving time and resources, advancing the ability of computers to do the same tasks, and leading to faster progress and understanding of the world, getting to exciting results more quickly.
            </Text>
            <Text style={styles.paragraph}>
              Our projects combine contributions from many individual volunteers, relying on a version of the ‘wisdom of crowds’ to produce reliable and accurate data. By having many people look at the data we often can also estimate how likely we are to make an error. The product of a Zooniverse projects is often exactly what’s needed to make progress in many fields of research.
            </Text>
          </View>

          <View style={styles.block}>
            <View style={styles.header}><StyledText textStyle={'largeBold'} text={'Volunteers and professionals make real discoveries together'} /></View>
            <Text style={styles.paragraph}>
            Zooniverse projects are constructed with the aim of converting volunteers’ efforts into measurable results. These projects have produced a large number of published research papers, as well as several open-source sets of analyzed data. In some cases, Zooniverse volunteers have even made completely unexpected and scientifically significant discoveries.
            </Text>
            <Text style={styles.paragraph}>
              A significant amount of this research takes place on the Zooniverse discussion boards, where volunteers can work together with each other and with the research teams. These boards are integrated with each project to allow for everything from quick hashtagging to in-depth collaborative analysis. There is also a central Zooniverse board for general chat and discussion about Zooniverse-wide matters.
            </Text>
            <Text style={styles.paragraph}>
              Many of the most interesting discoveries from Zooniverse projects have come from discussion between volunteers and researchers. We encourage all users to join the conversation on the discussion boards for more in-depth participation.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 5,
  },
  block: {
    padding: 15,
    paddingTop: 18,
    paddingBottom: 0
  },
  paragraph: {
    fontFamily: 'OpenSans',
    lineHeight: 22,
    paddingBottom: 15
  }
})

About.propTypes = {
  setNavbarSettingsForPage: PropTypes.func,
}

const mapDispatchToProps = (dispatch) => ({
  setNavbarSettingsForPage: (settings) => dispatch(setNavbarSettingsForPage(settings, PageKeys.About))
});

export default connect(null, mapDispatchToProps)(About);
