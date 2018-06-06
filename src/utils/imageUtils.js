import RNFetchBlob from 'react-native-fetch-blob'
import R from 'ramda'

export const removeLeftOverImages = imageDictionary => {
    R.values(imageDictionary).forEach((localSource) => {
        RNFetchBlob.fs.unlink(localSource)
    })
}

export const loadRemoteImageToCache = (remoteUri) => {
    return new Promise((resolve, reject) => {
        const fileExtension = remoteUri.split('.').pop();
        const task = RNFetchBlob.config({
                        fileCache: true,
                        appendExt: fileExtension
                    })
                    .fetch('GET', remoteUri)

        task.then((response) => {
            resolve(response.path())
        })
        .catch(reject)
    })
}
