
const imageRegEx = /(?: ?!\[[^\]]*\]\((https?:\/\/[^ ]*\.(?:png|jpg|gif|jpeg))[^\)]*\)|\n {0,3}\[[^\]]*]: *(https?:\/\/[^ ]*\.(?:png|jpg|gif|jpeg)))/i
const markdownImageRegEx = / ?!\[[^\]]*\](\([^\)]*\)|\[[^\]]*\])/g

/**
 * Returns the first image in a markdown string
 * @param {} markdownSring 
 */
export const extractFirstLinkedImageFrom = (markdownSring) => {
    const matchArray = markdownSring.match(imageRegEx)
    return matchArray ? matchArray[1] : null
}

/**
 * Removes all image links from a markdown string
 * @param {} markdownString 
 */
export const removeImagesFrom = (markdownString) => {
    return markdownString.replace(markdownImageRegEx, '')
}

/**
 * Checks whether a markdown string contains images
 * @param {} markdownString 
 */
export const markdownContainsImage = (markdownString) => {
    return markdownString.match(markdownImageRegEx) !== null
}