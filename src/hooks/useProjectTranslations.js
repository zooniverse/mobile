/**
 * Loads the project's i18n translations once the workflow, guide, and
 * tutorial have all resolved. Exposes an `isLoading` flag so the shell
 * can render `TranslationsLoadingIndicator` while the fetch is in flight.
 *
 * Mirrors the legacy `loadTranslations` pattern that lived inside each
 * classifier screen (`QuestionClassifier`, `SwiperClassifier`, etc.).
 */

import { useEffect, useRef, useState } from 'react'

import {
  getPreferredLanguageFromProject,
  loadProjectTranslations,
} from '../i18n'

const useProjectTranslations = (project, workflow, guide, tutorial) => {
  const [isLoading, setIsLoading] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return
    if (!project?.id || !workflow?.id || !guide?.id || !tutorial?.id) return

    loadedRef.current = true
    const languages = project.available_languages ?? []
    const language = getPreferredLanguageFromProject(languages)

    const run = async () => {
      try {
        setIsLoading(true)
        await loadProjectTranslations(language, project, workflow, guide, tutorial)
      } catch (error) {
        console.warn('Error loading project translations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [project, workflow, guide, tutorial])

  return { isLoading }
}

export default useProjectTranslations
