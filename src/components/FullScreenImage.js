import React from 'react'
import {
    Modal,
    TouchableOpacity,
    View,
    Dimensions
} from 'react-native'
import FontedText from './common/FontedText'
import EStyleSheet from 'react-native-extended-stylesheet'
import ZoomableImage from './ZoomableImage'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types'
import Video from 'react-native-video'


class FullScreenImage extends React.Component {
    render() {
        function displayWithRequisiteComponent(uri, handlePress) {
            if (uri.slice(uri.length - 4).match('.mp4')) {
                return <Video
                    source={{uri: uri}}
                    style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height
                    }}
                    controls={true}
                    repeat={true}
                />

            } else {
                return <ZoomableImage
                    source={uri}
                    handlePress={handlePress}
                />;
            }
        }

        return (
            <Modal
                animationType={'fade'}
                transparent={true}
                onRequestClose={() => {
                }}
                visible={this.props.isVisible}>
                <View style={styles.container}>
                    {
                        this.props.question ?
                            <FontedText style={styles.message}>
                                {this.props.question}
                            </FontedText>
                            :
                            null
                    }
                    {
                        displayWithRequisiteComponent(
                            this.props.source.uri,
                            this.props.handlePress
                        )
                    }
                    <TouchableOpacity
                        activeOpacity={0.5}
                        onPress={this.props.handlePress}
                        style={styles.closeIcon}>
                        <Icon name="times" style={styles.icon}/>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
}

const styles = EStyleSheet.create({
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    closeIcon: {
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 13,
        right: 5
    },
    icon: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 24,
        padding: 15,
    },
    rowContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        position: 'absolute',
        bottom: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    message: {
        fontSize: 20,
        paddingTop: 50,
        color: 'white'
    },
    infoIcon: {
        color: '$transluscentWhite',
        fontSize: 20,
        padding: 5,
    }
})

FullScreenImage.propTypes = {
    source: PropTypes.object,
    isVisible: PropTypes.bool,
    handlePress: PropTypes.func,
    question: PropTypes.string
}

export default FullScreenImage
