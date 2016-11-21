import React, { Component } from 'react';
import {
  View
} from 'react-native'
import Svg, { Path } from 'react-native-svg'
import EStyleSheet from 'react-native-extended-stylesheet'
import getColorFromString from '../utils/color-from-string'
import { connect } from 'react-redux'
import { addIndex, keys, map, sort } from 'ramda'

const size = 120
const position = size / 2
const width = 10
const radius = position - width

const mapStateToProps = (state) => ({
  projects: state.user.projects,
  totalClassifications: state.user.totalClassifications || 0
})

export class CircleRibbon extends Component {
  getPointOnCircle(amount, radius) {
    const degrees = amount * 360
    const startingFromTop = degrees - 90
    const radians = startingFromTop * Math.PI / 180
    return {
      x: (radius * Math.cos(radians)) + position,
      y: (radius * Math.sin(radians)) + position,
    }
  }

  calcLargeArc(classifications) {
    if (classifications / this.props.totalClassifications >= 0.5) {
      return 1
    } else {
      return 0
    }
  }

  render() {
    let projects = map((key) => {
      return this.props.projects[key]
    }, keys(this.props.projects))

    const diff = (a, b) => { return a.sort_order - b.sort_order }
    projects = sort(diff, projects)

    const renderArc = (project, idx) => {
      const index = projects.indexOf(project)
      const startAmount = projects.slice(0, index).reduce((count, otherArc) => {
        return count + otherArc.activity_count
      }, 0) / this.props.totalClassifications

      if (!isFinite(startAmount)) {
        return null
      }

      const endAmount = startAmount + (project.activity_count / this.props.totalClassifications)
      const startPoint = this.getPointOnCircle(startAmount, radius)
      const endPoint = this.getPointOnCircle(endAmount, radius)
      const largeArc = this.calcLargeArc(project.activity_count)
      const color = getColorFromString(project.slug)

      return (
        <Path
          key = {idx}
          d = { `
            M ${startPoint.x} ${startPoint.y}
            A ${radius} ${radius} 0 ${largeArc} 1 ${endPoint.x}, ${endPoint.y}
          ` }
          stroke = {color}
          strokeWidth = {width}
          fill = 'transparent' />
      )
    }

    const circle =
      <Svg height={size} width={size}>
        { addIndex (map)(
          (project, idx) => {
            return renderArc(project, idx)
          },
          projects
        ) }
      </Svg>

    return (
      <View style={styles.container}>
        { circle }
      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    position: 'relative',
    top: -103,
    width: size,
    height: size,
  },
});

CircleRibbon.propTypes = {
  projects: React.PropTypes.object,
  totalClassifications: React.PropTypes.number
}

export default connect(mapStateToProps)(CircleRibbon)
