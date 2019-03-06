import RNFetchBlob from 'rn-fetch-blob'
import R from 'ramda'

export const removeLeftOverImages = imageDictionary => {
    R.values(imageDictionary).forEach((localSource) => {
        RNFetchBlob.fs.unlink(localSource)
    })
}

export const loadRemoteImageToCache = (remoteUri) => {
    return new Promise((resolve, reject) => {
        const appendExt = remoteUri.split('.').pop().split('?')[0];
        const task = RNFetchBlob.config({
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
