import React from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Publication from './Publication'
import PublicationFilter from './PublicationFilter'
import NavBar from './NavBar'
import { fetchPublications } from '../actions/index'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import { addIndex, defaultTo, keys, map } from 'ramda'

GoogleAnalytics.trackEvent('view', 'Publication List')

const mapStateToProps = (state) => ({
  user: state.user,
  isConnected: state.isConnected,
  disciplines: keys(state.publications),
  publications: state.publications,
  selectedDiscipline: state.selectedDiscipline,
})

const mapDispatchToProps = (dispatch) => ({
  fetchPublications() {
    dispatch(fetchPublications())
  },
})

class PublicationList extends React.Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.props.fetchPublications()
  }

  static renderNavigationBar() {
    return <NavBar title={'Publications'} showBack={true} />;
  }

  render() {
    var selectedDiscipline = defaultTo(null, this.props.selectedDiscipline)
    var disciplinesToDisplay = ( selectedDiscipline ? [selectedDiscipline] : this.props.disciplines)

    const renderDisciplineGroup = (discipline, idx) => {
      var projects = this.props.publications[discipline].projects
      return (
        <View key={idx} style={styles.listContainer}>
          <View>
            { addIndex (map)(
              (key, idx) => {
                return renderProjectGroup(projects[key], idx)
              },
              keys(projects)
            ) }
          </View>
        </View>
      )
    }

    const avatar = (imageURI) => {
      return ( <Image source={{uri: `https://${imageURI}`}} style={styles.avatar} /> )
    }

    const defaultAvatar =
      <Image source={require('../../images/simple-avatar.jpg')} style={styles.avatar} />

    const renderProjectGroup = (project, idx) => {
      return (
        <View key={ idx }>
          <View style={styles.projectContainer}>
            { project.avatar_src ? avatar(project.avatar_src) : defaultAvatar }
            <StyledText textStyle={'largeBold'} text={ project.display_name } />
          </View>
          <View style={styles.publicationsContainer}>
            { addIndex(map)(
              (publication, idx) => {
                return renderPublication(publication, idx)
              },
              project.publications
            ) }
          </View>
        </View>
      )
    }

    const renderPublication = (publication, idx) => {
      return (
        <Publication key={idx} publication={ publication } />
      )
    }

    const scrollContainer =
      <ScrollView>
        { addIndex(map)(
          (discipline, idx) => {
            return renderDisciplineGroup(discipline, idx)
          },
          disciplinesToDisplay
        ) }
      </ScrollView>

    const noConnection =
      <View style={styles.messageContainer}>
        <StyledText textStyle={'errorMessage'}
          text={'You must have an internet connection to use Zooniverse Mobile'} />
      </View>

    return (
      <View style={styles.container}>
        { this.props.isConnected ? scrollContainer : noConnection }
        <PublicationFilter />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110,
  },
  listStyle: {
    paddingTop: 90
  },
  messageContainer: {
    padding: 15,
  },
  projectContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '$lightGrey',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  publicationsContainer: {
    paddingBottom: 5,
  },
  avatar: {
    borderRadius: 4,
    height: 30,
    width: 30,
    resizeMode: 'cover',
    marginRight: 8,
  }
});

PublicationList.propTypes = {
  user: React.PropTypes.object,
  isConnected: React.PropTypes.bool,
  dataSource: React.PropTypes.object,
  disciplines: React.PropTypes.array,
  selectedDiscipline: React.PropTypes.string,
  publications: React.PropTypes.object,
  fetchPublications: React.PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicationList)
