import React, { Component } from 'react';
import { 
    Image,
    View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types'

import SubjectLoadingIndicator from './SubjectLoadingIndicator'

class LoadableImage extends Component {

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
            <View style={style}>
                {
                    !this.state.loaded &&
                        <View style={[style, styles.loadingIndicator]} >
                            <SubjectLoadingIndicator />
                        </View>
                }
                <Image
                    source={source}
                    resizeMode={'contain'}
                    style={[style, styles.image]}
                    onLoad={this._onLoad()} 
                    onLoadStart={this._onLoadStart()}
                />
            </View>
        )
    }
}

const styles = EStyleSheet.create({
    image: {
        position: 'absolute',
        resizeMode: 'contain',
    },
    loadingIndicator: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    }

})

LoadableImage.propTypes = {
    style: PropTypes.any,
    source: PropTypes.object,
}

export default LoadableImage;
