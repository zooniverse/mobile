import {
    extractFirstLinkedImageFrom,
    removeImagesFrom
} from '../markdownUtils'

it('extractFirstLinkedImageFrom Exctracts an image correctly', () => {
    let stringWithImage = 'Does this image look like ![Example Alt Text](https://panoptes-uploads.zooniverse.org/production/subject_location/2824d466-3adf-4d4d-9a95-cbdcd48d776f.png =400x275)'
    const foundImage = extractFirstLinkedImageFrom(stringWithImage)
    expect(foundImage).toBeDefined()
    expect(foundImage).toEqual('https://panoptes-uploads.zooniverse.org/production/subject_location/2824d466-3adf-4d4d-9a95-cbdcd48d776f.png')
})

it('extractFirstLinkedImageFrom Returns null when image not found', () => {
    let stringWithImage = 'Does this image look like'
    const foundImage = extractFirstLinkedImageFrom(stringWithImage)
    expect(foundImage).toBeNull()
})

it('extractFirstLinkedImageFrom returns the first Image Only', () => {
    let stringWithImage = 'Does this ![](http://dingdong.jpeg) image look like ![Example Alt Text](http://dongding.jpeg)'
    const foundImage = extractFirstLinkedImageFrom(stringWithImage)
    expect(foundImage).toBeDefined()
    expect(foundImage).toEqual('http://dingdong.jpeg')
})

it('extractFirstLinkedImageFrom only returns the network images', () => {
    let stringWithImage = '![](abe.gif) la la la la ![](https://haha.gif)'
    const foundImage = extractFirstLinkedImageFrom(stringWithImage)
    expect(foundImage).toBeDefined()
    expect(foundImage).toEqual('https://haha.gif')
})

it('removeImagesFrom', () => {
    let markdownWithImage = 'hello hello, [hello]! ![image](ading) ![image](adong) hello'
    const markdownWithImagesRemoved = removeImagesFrom(markdownWithImage)
    expect(markdownWithImagesRemoved).toEqual('hello hello, [hello]! hello')
})