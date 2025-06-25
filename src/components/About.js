import React from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import EStyleSheet from 'react-native-extended-stylesheet';
import PropTypes from 'prop-types';

import { setNavbarSettingsForPage } from '../actions/navBar';
import PageKeys from '../constants/PageKeys';
import { Translation, withTranslation } from 'react-i18next';
import StyledMarkdown from './StyledMarkdown';

class About extends React.Component {
  componentDidMount() {
    const Title = <Translation>
          { (t) => (t('project.nav.about', 'About'))}
        </Translation>
    this.props.setNavbarSettingsForPage({
      title: Title,
      showBack: true,
      centerType: 'title',
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.block}>
            <StyledMarkdown
              markdown={this.props.t('aboutTheZooniverse.title', titleBkup)}
            />
            <StyledMarkdown
              markdown={this.props.t(
                'aboutTheZooniverse.whatIsZooniverse',
                whatIsZooniverseBkup
              )}
            />
          </View>

          <View style={styles.block}>
            <StyledMarkdown
              markdown={this.props.t('aboutTheZooniverse.anyoneCanResearch', anyoneCanResearchBkup)}
            />
          </View>

          <View style={styles.block}>
            <StyledMarkdown
              markdown={this.props.t('aboutTheZooniverse.accelerateResearch', accelerateResearchBkup)}
            />
          </View>
          <View style={styles.block}>
            <StyledMarkdown
              markdown={this.props.t('aboutTheZooniverse.discoveries', discoveriesBkup)}
            />
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
  block: {
    padding: 15,
    paddingTop: 18,
    paddingBottom: 0,
  },
});

About.propTypes = {
  setNavbarSettingsForPage: PropTypes.func,
};

const mapDispatchToProps = (dispatch) => ({
  setNavbarSettingsForPage: (settings) =>
    dispatch(setNavbarSettingsForPage(settings, PageKeys.About)),
});

export default withTranslation()(connect(null, mapDispatchToProps)(About));
const titleBkup = '## What is the Zooniverse?';
const whatIsZooniverseBkup = 'The Zooniverse is the world’s largest and most popular platform for people-powered research. This research is made possible by volunteers — more than a million people around the world who come together to assist professional researchers. Our goal is to enable research that would not be possible, or practical, otherwise. Zooniverse research results in new discoveries, datasets useful to the wider research community, and [many publications](/about/publications).';
const anyoneCanResearchBkup = '### At the Zooniverse, anyone can be a researcher\n\nYou don’t need any specialised background, training, or expertise to participate in any Zooniverse projects. We make it easy for anyone to contribute to real academic research, on their own computer, at their own convenience.\n\nYou’ll be able to study authentic objects of interest gathered by researchers, like images of faraway galaxies, historical records and diaries, or videos of animals in their natural habitats. By answering simple questions about them, you’ll help contribute to our understanding of our world, our history, our Universe, and more.\n\nWith our wide-ranging and ever-expanding suite of projects, covering many disciplines and topics across the sciences and humanities, there\'s a place for anyone and everyone to explore, learn and have fun in the Zooniverse. To volunteer with us, just go to the [Projects](/projects) page, choose one you like the look of, and get started.';
const accelerateResearchBkup = '### We accelerate important research by working together\n\nThe major challenge of 21st century research is dealing with the flood of information we can now collect about the world around us. Computers can help, but in many fields the human ability for pattern recognition — and our ability to be surprised — makes us superior. With the help of Zooniverse volunteers, researchers can analyze their information more quickly and accurately than would otherwise be possible, saving time and resources, advancing the ability of computers to do the same tasks, and leading to faster progress and understanding of the world, getting to exciting results more quickly.\n\nOur projects combine contributions from many individual volunteers, relying on a version of the ‘wisdom of crowds’ to produce reliable and accurate data. By having many people look at the data we often can also estimate how likely we are to make an error. The product of a Zooniverse projects is often exactly what’s needed to make progress in many fields of research.';
const discoveriesBkup = '### Volunteers and professionals make real discoveries together\n\nZooniverse projects are constructed with the aim of converting volunteers\' efforts into measurable results. These projects have produced a large number of [published research papers](/about/publications), as well as several open-source sets of analyzed data. In some cases, Zooniverse volunteers have even made completely unexpected and scientifically significant discoveries.\n\nA significant amount of this research takes place on the Zooniverse discussion boards, where volunteers can work together with each other and with the research teams. These boards are integrated with each project to allow for everything from quick hashtagging to in-depth collaborative analysis. There is also a central Zooniverse board for general chat and discussion about Zooniverse-wide matters.\n\nMany of the most interesting discoveries from Zooniverse projects have come from discussion between volunteers and researchers. We encourage all users to join the conversation on the discussion boards for more in-depth participation.';
