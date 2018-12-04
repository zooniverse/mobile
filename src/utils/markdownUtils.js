
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

/**
 * The react-native markdown library we use, react-native-simple-markdown, 
 * does not support images with sizing ex: ![](https://someImage.jpg =200x200)
 * This is a custom rule we pass into the markdown rendering engine that 
 * teaches it to recognize those images 
 */
const LINK_INSIDE = '(?:\\[[^\\]]*\\]|[^\\]]|\\](?=[^\\[]*\\]))*';
const LINK_HREF_AND_TITLE = '\\s*<?([^\\s]*?)>?(?:\\s+[""]([\\s\\S]*?)[""])?\\s*';
const IMAGE_SIZE = '( =[0-9]*[xX]([0-9]*)?)?';
const inlineRegex = (regex) => {
    const match = (source, state) => {
        if (state.inline) {
            return regex.exec(source);
        } else {
            return null;
        }
    };
    match.regex = regex;
    return match;
};

export const markdownImageRule = {
    image: { 
        match: inlineRegex(new RegExp('^!\\[(' + LINK_INSIDE + ')\\]\\(' + LINK_HREF_AND_TITLE + IMAGE_SIZE + '\\)'))
    }
}