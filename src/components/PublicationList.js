import React from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import Publication from './Publication'
import PublicationFilter from './PublicationFilter'
import NavBar from './NavBar'
import { fetchPublications, setState } from '../actions/index'
import { connect } from 'react-redux'
import { addIndex, defaultTo, keys, map } from 'ramda'
import { setNavbarSettingsForPage } from '../actions/navBar'
import PageKeys from '../constants/PageKeys';

const mapStateToProps = (state) => ({
  user: state.user,
  disciplines: keys(state.main.publications),
  publications: state.main.publications,
  selectedDiscipline: state.main.selectedDiscipline,
})

const mapDispatchToProps = (dispatch) => ({
  fetchPublications() {
    dispatch(fetchPublications())
  },
  setSelectedDiscipline(selected) {
    dispatch(setState('selectedDiscipline', selected))
  },
  setNavbarSettingsForPage: (settings) => dispatch(setNavbarSettingsForPage(settings, PageKeys.Publications))

})

export class PublicationList extends React.Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
      this.props.fetchPublications()

      this.props.setNavbarSettingsForPage({
      title: 'Publications',
      showBack: true,
      centerType: 'title'
    })
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
      <Image source={require('../../images/teal-wallpaper.png')} style={styles.avatar} />

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

    return (
      <View style={styles.container}>
        { scrollContainer }
        <PublicationFilter
          selectDiscipline = {this.props.selectedDiscipline}
          disciplines = {this.props.disciplines}
          setSelectedDiscipline = {this.props.setSelectedDiscipline}
        />
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  listStyle: {
    paddingTop: 20
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
  disciplines: PropTypes.array,
  selectedDiscipline: PropTypes.string,
  publications: PropTypes.object,
  fetchPublications: PropTypes.func,
  setSelectedDiscipline: PropTypes.func,
  setNavbarSettingsForPage: PropTypes.func,
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicationList)
