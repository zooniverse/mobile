import { indexOf } from 'ramda'

function getSubjectLocation(locationRef) {
  const READABLE_FORMATS = {
    image: ['jpeg', 'png', 'gif']
  }

  var format, mimeType, ref1, src, type
  for (mimeType in locationRef) {
    src = locationRef[mimeType];
    ref1 = mimeType.split('/'), type = ref1[0], format = ref1[1]

    if (type in READABLE_FORMATS && indexOf.call(format, READABLE_FORMATS[type]) >= 0) {
      break
    }
  }

  return {
    type: type,
    format: format,
    src: src
  }
}

export default function getSubjectLocations(subject) {
  const displays = subject.locations.map(getSubjectLocation)
  return displays
}
