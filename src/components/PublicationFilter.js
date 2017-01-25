import React from 'react'
import {
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import StyledText from './StyledText'
import { addIndex, compose, join, keys, length, lensIndex, map, over, toUpper } from 'ramda'
import { PUBLICATIONS } from '../constants/publications'
import Icon from 'react-native-vector-icons/FontAwesome'

class PublicationFilter extends React.Component {
  constructor(props) {
    super(props)
    this.state = {showFilter: false}
    this.toggleFilter = this.toggleFilter.bind(this)
  }

  toggleFilter() {
    this.setState({ showFilter: !this.state.showFilter })
  }

  selectDiscipline(discipline) {
    this.props.setSelectedDiscipline(discipline)
    this.toggleFilter()
  }

  render() {
    var selectedDiscipline = this.props.selectedDiscipline

    const toTitle = compose(
      join(''),
      over(lensIndex(0), toUpper)
    );

    const renderDiscipline = (discipline, idx) => {
      return (
        <View key={idx} style={styles.dropdownItem}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={ this.selectDiscipline.bind(this, discipline) }
            style={styles.itemTouchContainer}>
            <StyledText text={ toTitle(discipline) } />
          </TouchableOpacity>
        </View>
      )
    }

    const overlay =
      <TouchableWithoutFeedback onPress={this.toggleFilter}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

    const filter =
      <View style={styles.dropdownContainer}>
        <View style={styles.dropdownItem}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={ this.selectDiscipline.bind(this, null) }
            style={styles.itemTouchContainer}>
            <StyledText text={ 'View All' } />
          </TouchableOpacity>
        </View>
        { addIndex(map)(
          (discipline, idx) => {
            return renderDiscipline(discipline, idx)
          },
          this.props.disciplines
        ) }
      </View>

    return (
        <View style={[styles.container, this.state.showFilter && styles.fullHeightContainer]}>
          { this.state.showFilter ? overlay : null }
          <View style={styles.dropdownViewContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={this.toggleFilter}
              style={styles.headerTouchContainer}>
              <View style={styles.dropdownHeader}>
                <StyledText text={ selectedDiscipline ? `Viewing ${toTitle(selectedDiscipline)}` : 'Choose Category' } />
                <Icon name="angle-down" style={styles.icon} />
              </View>
            </TouchableOpacity>
            { this.state.showFilter ? filter : null }
          </View>
        </View>
    );
  }
}

//the following are required for absolutely positioned items on Android
const topPadding = (Platform.OS === 'ios') ? 70 : 58
const filterWidth = 150
const itemHeight = 40
const menuHeight = itemHeight * (length(keys(PUBLICATIONS)) + 1)

const styles = EStyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '$lightTransparent',
  },
  container: {
    position: 'absolute',
    flex: 1,
    top: topPadding,
    right: 0,
    left: 0,
    width: '100%',
    height: itemHeight
  },
  fullHeightContainer: {
    bottom: 0,
    height: '100%'
  },
  dropdownViewContainer: {
    position: 'absolute',
    flex: 1,
    top: 0,
    right: 0,
    left: 0,
    height: itemHeight
  },
  headerTouchContainer: {
    height: itemHeight,
    width: '100%'
  },
  itemTouchContainer: {
    height: itemHeight,
    width: 110
  },
  dropdownHeader: {
    backgroundColor: '$lightTransparent',
    position: 'absolute',
    flex: 1,
    top: 0,
    right: 0,
    left: 0,
    width: '100%',
    height: itemHeight,
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '$lightGrey',
    flexDirection: 'row',
    padding: 10,
  },
  dropdownContainer: {
    backgroundColor: 'white',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'grey',
    position: 'absolute',
    top: itemHeight,
    left: 5,
    width: filterWidth,
    height: menuHeight
  },
  dropdownItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '$lightGrey',
    flex: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 15,
    paddingRight: 25,
    width: filterWidth,
    height: itemHeight,
  },
  icon: {
    color: 'grey',
    fontSize: 14,
    marginLeft: 10,
  }
});

PublicationFilter.propTypes = {
  selectedDiscipline: React.PropTypes.string,
  disciplines: React.PropTypes.array,
  setSelectedDiscipline: React.PropTypes.func
}

export default PublicationFilter
