import React, { Component } from 'react';
import { 
    Image,
    View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'

import SubjectLoadingIndicator from './SubjectLoadingIndicator'

class LoadableMedia extends Component {

    constructor(props) {
        super(props)

        this.state = {
            loaded: false
        }
    }

    _onLoad() {
        return () => {
            this.setState({
                loaded: true
            })
        }
    }

    _onLoadStart() {
        return () => {
            this.setState({
                loaded: false
            })
        }
    }
    
    render() {
        const { style, source } = this.props

        return (
            <View style={styles.container}>
                {
                    !this.state.loaded &&
                        <View style={[style, styles.loadingIndicator]} >
                            <SubjectLoadingIndicator />
                        </View>
                }
                <Image
                    source={source.uri}
                    resizeMode={'contain'}
                    style={[styles.image]}
                    onLoad={this._onLoad()} 
                    onLoadStart={this._onLoadStart()}
                />
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    loadingIndicator: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        flex: 1,
    },
    image: {
        flex: 1, // Allows the image to expand
        width: undefined, // Ensures width and height are not constrained by specific values
        height: undefined,
        alignSelf: 'stretch', // Stretches the image to the boundaries of its container
    },

})

LoadableMedia.propTypes = {
    style: PropTypes.any,
    source: PropTypes.object,
}

export default LoadableMedia;
