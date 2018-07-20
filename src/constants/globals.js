export const GLOBALS = {
  GOOGLE_ANALYTICS_TRACKING: 'UA-1224199-62',
  GLYPHMAP: {
    'arts': 61742,
    'astronomy': 61743,
    'biology': 61732,
    'climate': 61733,
    'history': 61734,
    'humanitarian': 61735,
    'language': 61736,
    'literature': 61737,
    'medicine': 61744,
    'nature': 61739,
    'physics': 61740,
    'social-science': 61745,
    'zooniverse-logo': 61729
  },
  //description: 'Help review projects to see if they are ready for launch',
  DISCIPLINES: [
    {value: 'recent', label: 'Recent', color: 'rgba(0, 151, 157, 1)', display: false, faIcon: 'clock-o'},
    {value: 'preview', label: 'Preview', color: 'rgba(228,89,80,1)', display: false, faIcon: 'mobile'},
    {value: 'arts', label: 'Arts', color: '#AFA48C', display: false },
    {value: 'biology', label: 'Biology', color: '#9DDDF9', display: true },
    {value: 'climate', label: 'Climate', color: '#A1BFBE', display: false },
    {value: 'history', label: 'History', color: '#F9DB46', display: false },
    {value: 'humanitarian', label: 'Humanitarian', color: '#C46FC6', display: false },
    {value: 'language', label: 'Language', color: '#18807F', display: false },
    {value: 'literature', label: 'Literature', color: '#EADF5C', display: false },
    {value: 'medicine', label: 'Medicine', color: '#EF4343', display: false },
    {value: 'nature', label: 'Nature', color: '#46D178', display: true },
    {value: 'physics', label: 'Physics', color: '#F27441', display: false },
    {value: 'social science', label: 'Social Science', color: '#7EA8CE', display: false },
    {value: 'astronomy', label: 'Space', color: '#512BAD', display: true },
    {value: 'beta', label: 'Beta Review', color: 'rgb(107, 107, 107)', display: false, faIcon: 'flask', description: 'Projects in Development'},
  ]
}

export const loggedInDisciplineTags = (hasRecents, hasPreviews) => {
  let disciplines = []
  if (hasRecents) disciplines.push('recent')
  if (hasPreviews) disciplines.push('preview')
  return disciplines
}
