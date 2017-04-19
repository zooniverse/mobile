import { indexOf } from 'ramda'

export default function getSubjectLocation(subject, frame = 0) {
  const READABLE_FORMATS = {
    image: ['jpeg', 'png', 'gif']
  }

  var format, mimeType, ref, ref1, src, type
  ref = subject.locations[frame]
  for (mimeType in ref) {
    src = ref[mimeType];
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
