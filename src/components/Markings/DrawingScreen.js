import React from 'react'
import {
    Animated,
    Dimensions,
    Platform,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'
import { loadRemoteImageToCache } from '../../utils/imageUtils'
import NativeImage from '../../nativeModules/NativeImage'
import Icon from 'react-native-vector-icons/FontAwesome'
import { 
    DrawingTitle,
    DrawingButton,
    SvgOverlay
} from './components'
import FontedText from '../common/FontedText';

const imageViewSize = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 250
}

export default class DrawingScreen extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            imageLoaded: false,
            imageWidth: 0,
            imageHeight: 0,
            localImagePath: '',
            imageContainerWidthAnimated: new Animated.Value(imageViewSize.width),
            imageContainerHeightAnimated: new Animated.Value(imageViewSize.height),
            imageContainerWidth: imageViewSize.width,
            imageContainerHeight: imageViewSize.height,
            expanded: false,
            mode: 'draw'
        }

        this.state.imageContainerWidthAnimated.addListener( ({value}) => {
            this.setState({
                imageContainerWidth: value
            })
        })

        this.state.imageContainerHeightAnimated.addListener( ({value}) => {
            this.setState({
                imageContainerHeight: value
            })
        })

    }

  componentDidMount() { 
    loadRemoteImageToCache('https://upload.wikimedia.org/wikipedia/commons/9/91/F-15_vertical_deploy.jpg').then(localImagePath => {      
        const nativeImage = new NativeImage(localImagePath)
        nativeImage.getImageSize().then(({width, height}) => {
            this.setState({
                imageWidth: width,
                imageHeight: height,
                localImagePath,
                imageLoaded: true
            })
        })
    })
  }

  render() {
    if (!this.state.imageLoaded) {
        return (
            <View style={styles.loadingContent}>
                <Text> Loading Content </Text>
            </View>
        )
    }

    const pathPrefix = Platform.OS === 'android' ? 'file://' : ''
    const imageSizeStyle = {
        width: this.state.imageContainerWidthAnimated,
        height: this.state.imageContainerHeightAnimated
    }

    return (
        <View style={styles.screenContainer}>
            <Animated.View style={styles.imageContainer}>
                <Animated.Image
                    source={{ uri: pathPrefix + this.state.localImagePath}}
                    style={[ imageSizeStyle, styles.image]}
                    resizeMode="contain"
                />
                <Animated.View style={[imageSizeStyle, styles.svgContainer]}>
                    <Animated.View style={[imageSizeStyle, styles.svgOverlayContainer]}>
                        <SvgOverlay
                            shape="rect"
                            mode={this.state.mode}
                        />
                    </Animated.View>
                </Animated.View>
                <DrawingTitle 
                    color="green" 
                    shape="rect" 
                    text="Draw Around Remote" 
                    style={styles.drawingTitle}
                />
                <TouchableOpacity style={styles.closeButton}>
                    <Icon name="times" style={styles.closeIcon} />
                </TouchableOpacity>
                <FontedText 
                    numberOfLines={2} 
                    style={styles.saveText}
                >
                    Save And Close 
                </FontedText>
                <View style={styles.drawingButtonsContainer}>
                    <DrawingButton 
                        style={styles.drawingButton}
                        type="edit"
                        enabled={this.state.mode === 'edit'}
                        onPress={() => this.setState({mode: 'edit'})}
                    />
                    <DrawingButton 
                        style={styles.drawingButton}
                        type="draw"
                        enabled={this.state.mode === 'draw'}
                        onPress={() => this.setState({mode: 'draw'})}
                    />
                    <DrawingButton 
                        style={styles.drawingButton} 
                        type="erase" 
                        enabled={this.state.mode === 'erase'}
                        onPress={() => this.setState({mode: 'erase'})}
                    />
                </View>
            </Animated.View>
        </View>
    )
  }
}

const styles = {
    loadingContent: {
        flex: 1,
        margin: 15,
        justifyContent: 'center',
        alignContent: 'center'
    },
    screenContainer: {
        flex: 1
    },
    imageContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center'
    },
    image: {
        backgroundColor: 'rgba(0,0,0,.4)', 
        alignSelf: 'center'
    },
    svgContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    svgOverlayContainer: {
        alignSelf: 'center'
    },
    drawingTitle: {
        position: 'absolute',
        top: 15,
        left: 15
    },
    closeButton: {
        position: 'absolute',
        top: 15,
        right: 25
    }, 
    closeIcon: { 
        color: 'white',
        fontSize: 24
    },
    saveText: {
        width: 90,
        position: 'absolute',
        bottom: 25,
        right: 25,
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center'
    },
    drawingButtonsContainer: {
        position: 'absolute',
        bottom: 15,
        left: 20,
        flexDirection: 'row'
    },
    drawingButton: {
        paddingRight: 10
    }
}