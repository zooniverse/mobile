import React from 'react'
import {
    ScrollView,
    View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import StyledMarkdown from '../StyledMarkdown'
import StyledText from '../StyledText'
import SizedImage from '../SizedImage'

import ButtonLarge from './ButtonLarge';
import { useTranslation } from 'react-i18next';
import { getCurrentProjectLanguage } from '../../i18n';

const ITEM_ICON_RADIUS = 50

const FieldGuideItemDetail = (props) => {
    const { t } = useTranslation();
    return (
        <ScrollView style={styles.itemDetailContainer}>
            <View onLayout={props.setHeaderHeight}>
                {props.icons?.[props.item.icon]?.src
                    ? <SizedImage
                        source={{uri: props.icons[props.item.icon].src}}
                        maxHeight={ITEM_ICON_RADIUS * 2}
                        additionalStyles={[styles.itemDetailIcon]}
                    />
                    : null
                }
                <StyledText additionalStyles={[
                    styles.itemDetailTitle,
                ]} text={t(`fieldGuide.items.${props?.item?.index}.title`, props.item.title, {ns: 'project', lng: getCurrentProjectLanguage()})}/>
            </View>
            <StyledMarkdown
                markdown={t(`fieldGuide.items.${props?.item?.index}.content`, props.item.content, {ns: 'project', lng: getCurrentProjectLanguage()})}
                onReceivedHeight={props.setContentHeight}
                extraCSS={ 'body {color: #000000}'}
            />
            <View style={{marginVertical: 8, alignItems: 'center'}}>
                <ButtonLarge text="< Back" onPress={props.onClose} />
            </View>
        </ScrollView>
    )
}

const styles = EStyleSheet.create({
    itemDetailContainer: {
        paddingHorizontal: 15,
    },
    itemDetailIcon: {
        alignSelf: 'center',
        maxWidth: ITEM_ICON_RADIUS * 2,
        maxHeight: ITEM_ICON_RADIUS * 2,
        borderRadius: ITEM_ICON_RADIUS
    },
    itemDetailTitle: {
        marginTop: 5,
        marginBottom: 10,
        fontSize: 20,
        textAlign: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        marginVertical: 5,
    }
});

FieldGuideItemDetail.propTypes = {
    item: PropTypes.shape({
        title: PropTypes.string,
        content: PropTypes.string,
        icon: PropTypes.string,
    }),
    icons: PropTypes.object,
    setContentHeight: PropTypes.func,
    setHeaderHeight: PropTypes.func,
    onClose: PropTypes.func,
    inMuseumMode: PropTypes.bool,
}

export default FieldGuideItemDetail
