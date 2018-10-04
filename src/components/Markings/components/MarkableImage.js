import React, { Component } from 'react'
import {
    ImageBackground,
    View
} from 'react-native'
import PropTypes from 'prop-types'
import SvgOverlay from './SvgOverlay'
import { connect } from 'react-redux'
// import { bindActionCreators } from 'redux'
// import * as drawingScreenAction from '../../../actions/drawingScreen'

// const mapStateToProps = (state) => ({
    // shapes: state.drawingScreen.shapes
// })

// const mapDispatchToProps = (dispatch) => ({
//      drawingScreenActions: bindActionCreators(drawingScreenAction, dispatch)
// })

class MarkableImage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            mode: 'edit'
        }

        // this.onShapeDeleted = this.onShapeDeleted.bind(this)
        // this.onShapeCreated = this.onShapeCreated.bind(this)
        // this.onShapeModified = this.onShapeModified.bind(this)
    }

    // onShapeDeleted(shapeIndex) {
    //     this.props.drawingScreenActions.removeShapeAtIndex(shapeIndex)
    // }

    // onShapeCreated(newShape) {
    //     this.props.drawingScreenActions.addShape(newShape)
    // }

    // onShapeModified(modifications, index) {
    //     this.props.drawingScreenActions.mutateShapeAtIndex(modifications, index)
    // }

    render() {
        return (
            <View style={styles.svgContainer}>
                <ImageBackground 
                    style={styles.svgOverlayContainer}
                    source={{uri: this.props.source}}
                    resizeMode="contain"
                >
                    <SvgOverlay
                        shape="rect"
                        mode={this.state.mode}
                        onShapeCreated={this.onShapeCreated}
                        onShapeDeleted={this.onShapeDeleted}
                        onShapeModified={this.onShapeModified}
                    />
                </ImageBackground>
            </View>
        )
    }

}

const styles = {
    svgContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    svgOverlayContainer: {
        flex: 1
    },
}

MarkableImage.propTypes = {
    drawingScreenActions: PropTypes.shape({
        removeShapeAtIndex: PropTypes.func,
        addShape: PropTypes.func,
        mutateShapeAtIndex: PropTypes.func
    }),
    source: PropTypes.string,
}

export default connect(null, null)(MarkableImage)
