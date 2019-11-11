import React, { Component } from 'react';
import {
    Alert,
    Animated,
    Image,
    Linking,
    TouchableOpacity,
    View,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome'
import * as R from 'ramda';
import GoogleAnalytics from 'react-native-google-analytics-bridge'
import {Actions} from 'react-native-router-flux'

import navigateToClassifier from '../../navigators/classifierNavigator'
import FontedText from '../common/FontedText'
import Separator from '../common/Separator'
import PopupMessage from './PopupMessage'
import theme from '../../theme'

const horizontalPadding = 15

const mapStateToProps = (state, ownProps) => ({
    containsNativeWorkflows: ownProps.project.workflows.length > 0,
});

const mapDispatchToProps = (dispatch, ownProps) => ({
    navigateToClassifier: navigateToClassifier(dispatch, ownProps.inPreviewMode, ownProps.inBetaMode, ownProps.project)
})

class ProjectTile extends Component {
    constructor(props) {
        super(props)

        this.state = {
            popupOpacity: new Animated.Value(0),
            popupHeight: 0
        }
        this._onMainViewPress = this._onMainViewPress.bind(this)
    }

    _overlayBanner() {
        const bannerStyle = this.props.inPreviewMode ? [styles.bannerContainer, styles.testBannerStyle] : styles.bannerContainer
        return (
            <View style={bannerStyle}>
                <FontedText style={styles.bannerText}>
                    { this.props.inPreviewMode ? 'PREVIEW' : 'OUT OF DATA' }
                </FontedText>
            </View>
        )
    }

    _workFlowList = () => {
        const mobileVerifiedWorkflows = this.props.project.workflows.filter( workflow => workflow.mobile_verified)
        const overlayBanner = 
            <View style={styles.bannerView}>
                {this._overlayBanner()}
            </View>
        const workflowsView = R.addIndex(R.map)((workflow, index) => {
            const shouldShowBanner = isComplete(workflow.completeness) && !this.props.inPreviewMode
            return (
                <View key={index}>
                    <Separator />
                    <View>
                        <TouchableOpacity 
                            onPress={() => this.props.navigateToClassifier(workflow) }
                        >
                            <View style={styles.cell}>
                                <View style={ styles.descriptionContent }>
                                    { shouldShowBanner ? overlayBanner : null }
                                    <FontedText style={styles.cellTitle}>
                                        {workflow.display_name}
                                    </FontedText>
                                </View>
                                <View style={styles.chevronContainer}>
                                    <Icon name="chevron-right" style={styles.chevronIcon}/>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }, mobileVerifiedWorkflows);
        return (
            <View style={styles.cellsContainer}>
                {workflowsView}
            </View>
        )
    }

    _onMainViewPress() {
        const { workflows, display_name, redirect } = this.props.project
        
        GoogleAnalytics.trackEvent('view', display_name)

        if (workflows.length > 1) {
            Animated.timing(this.state.popupOpacity, { toValue: 1, duration: 300 }).start(() => {
                setTimeout(() => {
                    Animated.timing(this.state.popupOpacity, {toValue: 0}).start();
                }, 1200);
            });
        } else if (workflows.length === 1) {
            this.props.navigateToClassifier(R.head(workflows))
        } else if (redirect) {
            this._openURL(redirect)
        } else {
            Actions.ZooWebView({project: this.props.project})
        }
    }

    _openURL(url){
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Alert.alert(
                    'Error',
                    'Sorry, but it looks like you are unable to open the project in your default browser.',
                )
            }
        })
    }

    render() {
        let shouldDisplayIsOutOfData = false
        if (!this.props.containsNativeWorkflows) {
            const projectIsComplete = isComplete(this.props.project.completeness)
            shouldDisplayIsOutOfData = projectIsComplete
        }
        else if (!this.props.containsMultipleNativeWorkflows) {
            const workflowIsComplete = isComplete(this.props.project.workflows[0].completeness)
            shouldDisplayIsOutOfData = workflowIsComplete
        }

        const avatarUri = R.prop('avatar_src', this.props.project);
        const avatarSource = avatarUri !== undefined ? { uri: avatarUri } : require('../../../images/teal-wallpaper.png');
        const borderColorTransform = this.state.popupOpacity.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.$borderGrey, 'black']
        });
        const popupStyle = {marginTop: -this.state.popupHeight, opacity: this.state.popupOpacity}
        return (
            <Animated.View style={[styles.mainContainer, {borderColor: borderColorTransform} ]}>
                <TouchableOpacity
                    onPress={this._onMainViewPress}
                >
                    <View style={styles.contentContainer}>
                        <Image
                            resizeMode="cover"
                            style={[styles.avatar]}
                            source= {avatarSource}
                        />
                        <View style={styles.descriptionContainer}>
                            {this.props.containsNativeWorkflows ? <PhoneIcon /> : null}
                            <View style={styles.descriptionContent}>
                                <FontedText style={styles.title} numberOfLines={1}>
                                    {this.props.project.title}
                                </FontedText> 
                                <Separator style={styles.separator} />
                                <FontedText style={styles.description} numberOfLines={3}>
                                    {this.props.project.description}
                                </FontedText>
                            </View>
                        </View>
                        <View style={styles.bannerOverlay}>
                            { shouldDisplayIsOutOfData || this.props.inPreviewMode ? this._overlayBanner() : null }
                        </View>
                    </View>
                    <Animated.View 
                        onLayout={(event) => this.setState({popupHeight: event.nativeEvent.layout.height})}
                        style={popupStyle}
                    > 
                        <PopupMessage />
                    </Animated.View>
                    { this.props.project.workflows.length > 1 ? this._workFlowList() : null }
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

const isComplete = (completenessString) => {
    const completenessFloat = Number.parseFloat(completenessString)
    const isComplete = !Number.isNaN(completenessFloat) && completenessFloat >= 1
    return isComplete
}

const PhoneIcon = () => {
    return (
        <Image 
            source={require('../../../images/mobile-friendly.png')}
            style={styles.phoneIcon}
        />
    );
};

const styles = EStyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column', 
        marginHorizontal: horizontalPadding, 
        borderWidth: 1, 
        backgroundColor: 'white'
    },
    avatar: {
        height: 175,
    },
    descriptionContainer: {
        paddingVertical: 20, 
        paddingHorizontal: 15, 
        flexDirection: 'row', 
        flexGrow: 1
    },
    descriptionContent: {
        flex: 1
    },
    title: {
        fontWeight: 'bold', 
        fontSize: 14
    },
    separator: {
        marginVertical: 6
    },
    description: {
        lineHeight: 22,
        fontSize: 14
    },
    phoneIcon: {
        height: 42,
        width: 25,
        marginRight: 15
    },
    bannerOverlay: {
        position: 'absolute', 
        left: 0, 
        top: 15, 
    },
    bannerContainer: {
        backgroundColor: '$zooniverseTeal',
        shadowColor: 'black',
        shadowOffset: {width: 2, height: 2},
        shadowOpacity: .5,
        shadowRadius: 4
    },
    testBannerStyle: {
        backgroundColor: '$testRed'
    },
    bannerText: {
        paddingHorizontal: 15,
        paddingVertical: 4,
        color: 'white',
        fontWeight: 'bold',
        shadowColor: 'black',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: .22,
        shadowRadius: 2,
    },
    cell: {
        flexDirection: 'row',
        paddingHorizontal: 15
    },
    cellTitle: {
        fontWeight: 'bold', 
        color: '$headerGrey', 
        paddingVertical: 15, 
        paddingRight: 15, 
        flex: 1
    },
    chevronContainer: {
        justifyContent: 'center'
    },
    chevronIcon: {
        fontSize: 15,
        color: '$chevronGrey'
    },
    cellsContainer: {
        paddingHorizontal: 0
    },
    bannerView: {
        marginTop: -1,
        marginLeft: -15,
        width: 129
    },
    contentContainer: {
        overflow: 'hidden'
    }
});

ProjectTile.propTypes = {
    project: PropTypes.object,
    containsNativeWorkflows: PropTypes.bool,
    containsMultipleNativeWorkflows: PropTypes.bool,
    outOfData: PropTypes.bool,
    inPreviewMode: PropTypes.bool,
    inBetaMode: PropTypes.bool,
    navigateToClassifier: PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectTile);