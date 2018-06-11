import { NativeModules } from 'react-native'

class NativeImage {
    constructor(imagePath) {
        this.imagePath = imagePath
    }

    /**
     * @returns a promise that resolves with an object that looks like 
     * {
     *  width,
     *  height
     * }
     * 
     * Or rejects with an error message
     */
    getImageSize() {
        return NativeModules.ImageSizer.getImageDimensions(this.imagePath)
    }
}

export default NativeImage