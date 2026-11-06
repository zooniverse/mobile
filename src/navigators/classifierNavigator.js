import * as R from 'ramda'

import * as classifierActions from '../actions/classifier'
import * as drawingActions from '../actions/drawing'
import { setNavbarSettingsForPage } from '../actions/navBar'
import { reset } from '../reducers/classifierSlice'
import PageKeys from '../constants/PageKeys'
import theme from '../theme'
import { clearProjectTranslations } from '../i18n'

const navigateToClassifier = R.curry((dispatch, inPreviewMode, inBetaMode, project, navigation, workflow) => {
    dispatch(setNavbarSettingsForPage({
        isPreview: inPreviewMode, //TODO: Decouple preview mode from the color of the safe area container
        title: project.in_museum_mode ? 'ZOONIVERSE - DO REAL RESEARCH!' : project.display_name,
        showBack: !project.in_museum_mode,
        hamburgerMenuShowing: !project.in_museum_mode,
        centerType: 'title',
        backgroundColor: inPreviewMode ? 'rgba(228,89,80,1)' : theme.$zooniverseTeal
    }, PageKeys.ClassifierScreen))

    dispatch(reset())
    dispatch(classifierActions.clearClassifierData())
    dispatch(drawingActions.clearShapes())
    clearProjectTranslations()

    navigation.navigate("ClassifierScreen", {
      project,
      workflow,
      display_name: project.display_name,
      inPreviewMode,
      inBetaMode,
    })
})


export default navigateToClassifier
