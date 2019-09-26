export function framingBackgroundColorFor(museumMode) {
    return switchOn(
        museumMode,
        {backgroundColor: '#2D2D2D'},
        {backgroundColor: '#eff2f5'}
    )
}

export function contentBackgroundColorFor(museumMode) {
    return switchOn(
        museumMode,
        {backgroundColor: '#333333'},
        {backgroundColor: 'white'}
    )
}

export function separatorColorFor(museumMode) {
    return switchOn(
        museumMode,
        {borderBottomColor: 'black'},
        {borderBottomColor: '$borderGrey'}
    )
}

export function deselectedTabColorFor(museumMode) {
    return switchOn(
        museumMode,
        {backgroundColor: '#282828'},
        {backgroundColor: '$lightestGrey'}
    )
}

export function helpTextColorFor(museumMode) {
    return switchOn(
        museumMode,
        {color: '#addde0'},
        {color: 'rgba(0,93,105,1)'}
    )
}

export function ancillaryTextColorFor(museumMode) {
    return switchOn(
        museumMode,
        {color: 'white'},
        {color: '$headerGrey'}
    )
}

export function textColorFor(museumMode) {
    return switchOn(
        museumMode,
        '#addde0',
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