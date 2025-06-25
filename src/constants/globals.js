import theme from "../theme"

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
    'social science': 61745,
    'zooniverse-logo': 61729
  },
  //description: 'Help review projects to see if they are ready for launch',
  DISCIPLINES: [
    {value: 'all projects', label: 'All Projects', color: theme.$zooniverseTeal, display: false, faIcon: 'globe', translation: 'Mobile.projectLabels.allProjects' },
    {value: 'translated projects', label: '', color: theme.$zooniverseTeal, display: false, faIcon: 'globe', translation: 'ZooFooter.projectLabels.projects' },
    {value: 'recent', label: 'Recent', color: theme.$zooniverseTeal, display: false, faIcon: 'clock-o', translation: 'Mobile.projectLabels.recent' },
    {value: 'preview', label: 'Preview', color: 'rgba(228,89,80,1)', display: false, faIcon: 'mobile', translation: 'Mobile.projectLabels.preview' },
    {value: 'arts', label: 'Arts', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.arts' },
    {value: 'biology', label: 'Biology', color: theme.$zooniverseTeal, display: true, translation: 'ZooFooter.projectLabels.biology' },
    {value: 'climate', label: 'Climate', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.climate' },
    {value: 'history', label: 'History', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.history' },
    {value: 'humanitarian', label: 'Humanitarian', color: theme.$zooniverseTeal, display: false, translation: 'Mobile.projectLabels.humanitarian' },
    {value: 'language', label: 'Language', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.language' },
    {value: 'literature', label: 'Literature', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.literature' },
    {value: 'medicine', label: 'Medicine', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.medicine' },
    {value: 'nature', label: 'Nature', color: theme.$zooniverseTeal, display: true, translation: 'ZooFooter.projectLabels.nature' },
    {value: 'physics', label: 'Physics', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.physics' },
    {value: 'social science', label: 'Social Science', color: theme.$zooniverseTeal, display: false, translation: 'ZooFooter.projectLabels.social' },
    {value: 'astronomy', label: 'Space', color: theme.$zooniverseTeal, display: true, translation: 'ZooFooter.projectLabels.space' },
    {value: 'beta', label: 'Beta Review', color: 'rgb(107, 107, 107)', display: false, faIcon: 'flask', description: 'Projects in Development'},
  ]
}

export const loggedInDisciplineTags = (hasRecents, hasPreviews) => {
  let disciplines = []
  if (hasRecents) disciplines.push('recent')
  if (hasPreviews) disciplines.push('preview')
  return disciplines
}
