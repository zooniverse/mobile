import EStyleSheet from 'react-native-extended-stylesheet';

export function framingBackgroundColorFor(museumMode) {
    return switchOn(
        museumMode,
        {backgroundColor: colors.darkGrey},
        {backgroundColor: colors.paleGrey}
    )
}

export function contentBackgroundColorFor(museumMode) {
    return switchOn(
        museumMode,
        {backgroundColor: colors.mediumGrey},
        {backgroundColor: 'white'}
    )
}

export function separatorColorFor(museumMode) {
    return switchOn(
        museumMode,
        {borderBottomColor: 'black'},
        {borderBottomColor: colors.mediumGrey}
    )
}

export function disabledButtonStyleFor(museumMode) {
    return switchOn(
        museumMode,
        {
            backgroundColor: colors.darkGrey,
            ...styles.darkModeButtonBorder,
        },
        {
            backgroundColor: colors.transparentTeal
        },
    )
}

export function selectedButtonStyleFor(museumMode) {
    return switchOn(
        museumMode,
        {
            backgroundColor: colors.teal,
            ...styles.darkModeButtonBorder,
        },
        {
            backgroundColor: colors.aquamarine
        },
    )
}

export function unselectedButtonStyleFor(museumMode) {
    return switchOn(
        museumMode,
        {
            backgroundColor: colors.mediumGrey,
            ...styles.darkModeButtonBorder,
        },
        {
            backgroundColor: colors.teal
        },
    )
}

export function selectedTextColorFor(museumMode) {
    return switchOn(
        museumMode,
        {color: 'white'},
        {color: 'black'}
    )
}

export function deselectedTextColorFor(museumMode) {
    return switchOn(
        museumMode,
        {color: colors.mediumGrey},
        {color: 'black'}
    )
}

export function helpTextColorFor(museumMode) {
    return switchOn(
        museumMode,
        {color: colors.seafoam},
        {color: colors.turquoise}
    )
}

export function ancillaryTextColorFor(museumMode) {
    return switchOn(
        museumMode,
        {color: 'white'},
        {color: colors.mediumGrey}
    )
}

export function textColorFor(museumMode) {
    return switchOn(
        museumMode,
        colors.seafoam,
        'black'
    )
}

function switchOn(mode, withModeStyle, withoutModeStyle) {
    if (mode) {
        return withModeStyle
    } else {
        return withoutModeStyle
    }
}

const styles =EStyleSheet.create({
    darkModeButtonBorder: {
        borderStyle: 'solid',
        borderColor: 'white',
        borderWidth: 1,
    },
})

const colors = {
    aquamarine: 'rgba(0, 52, 59, 1)',
    darkGrey: '#2D2D2D',
    mediumGrey: '#5c5c5c',
    paleGrey: '#eff2f5',
    seafoam: '#addde0',
    teal: 'rgba(0, 151, 157, 1)',
    turquoise: 'rgba(0,93,105,1)',
    transparentTeal: 'rgba(0, 151, 157, .35)',

}
