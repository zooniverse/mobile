import ReactNativeBlobUtil from 'react-native-blob-util'
import R from 'ramda'

export const removeLeftOverImages = imageDictionary => {
    R.values(imageDictionary).forEach((localSource) => {
        ReactNativeBlobUtil.fs.unlink(localSource)
    })
}

export const loadRemoteImageToCache = (remoteUri) => {
    return new Promise((resolve, reject) => {
        const appendExt = remoteUri.split('.').pop().split('?')[0];
        const task = ReactNativeBlobUtil.config({
                        fileCache: true,
                        appendExt
                    })
                    .fetch('GET', remoteUri)

        task.then((response) => {
            resolve(response.path())
        })
        .catch(reject)
    })
}
