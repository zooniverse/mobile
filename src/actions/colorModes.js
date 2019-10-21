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
        {backgroundColor: '#5c5c5c'},
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

export function disabledButtonStyleFor(museumMode) {
    return switchOn(
        museumMode,
        {
            backgroundColor: '#2D2D2D',
            borderStyle: 'solid',
            borderColor: 'white',
            borderWidth: 1,
        },
        {
            backgroundColor: 'rgba(0, 151, 157, .35)'
        },
    )
}

export function selectedButtonStyleFor(museumMode) {
    return switchOn(
        museumMode,
        {
            backgroundColor: 'rgba(0, 151, 157, 1)',
            borderStyle: 'solid',
            borderColor: 'white',
            borderWidth: 1,
        },
        {
            backgroundColor: 'rgba(0, 52, 59, 1)'
        },
    )
}

export function unselectedButtonStyleFor(museumMode) {
    return switchOn(
        museumMode,
        {
            backgroundColor: '#5c5c5c',
            borderStyle: 'solid',
            borderColor: 'white',
            borderWidth: 1,
        },
        {
            backgroundColor: 'rgba(0, 151, 157, 1)'
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
        {color: '#5C5C5C'},
        {color: 'black'}
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