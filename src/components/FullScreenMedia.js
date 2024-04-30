import React from 'react'
import {
    TouchableOpacity,
    View,
    Dimensions,
    StyleSheet
} from 'react-native'
import Modal from "react-native-modal";
import FontedText from './common/FontedText'
import EStyleSheet from 'react-native-extended-stylesheet'
import ZoomableImage from './ZoomableImage'
import Icon from 'react-native-vector-icons/Fontisto'
import PropTypes from 'prop-types'
import VideoPlayer from 'react-native-video-controls';
import { BlurView } from '@react-native-community/blur';

class FullScreenMedia extends React.Component {
    render() {
        function displayWithRequisiteComponent(uri, handlePress) {
            if (uri.slice(uri.length - 4).match('.mp4')) {
                return <VideoPlayer
                    source={{uri: uri}}
                    style={{
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height
                    }}
                    controls={true}
                    repeat={true}
                    resizeMode='contain'
                    disableFullscreen
                    disableBack
                    disableVolume
                />

            } else {
                return <ZoomableImage
                    uri={uri}
                    handlePress={handlePress}
                />;
            }
        }

        return (
            <Modal
                style={styles.modalContainer}
                coverScreen={false}
                visible={this.props.isVisible}>
                <View style={styles.container}>
                    <BlurView
                        blurType="dark"
                        blurAmount={5}
                        style={styles.blur}
                    />
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
                        <Icon name="close" style={styles.icon}/>
                    </TouchableOpacity>
                </View>
            </Modal>
        );
    }
}

const styles = EStyleSheet.create({
    blur: {
        flex: 1,
        ...StyleSheet.absoluteFillObject,
    },
    container: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    closeIcon: {
        backgroundColor: 'transparent',
        position: 'absolute',
        bottom: 42,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    icon: {
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 40,
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
    },
    modalContainer: {
        margin: 0,
    }
})

FullScreenMedia.propTypes = {
    source: PropTypes.object,
    isVisible: PropTypes.bool,
    handlePress: PropTypes.func,
    question: PropTypes.string
}

export default FullScreenMedia
