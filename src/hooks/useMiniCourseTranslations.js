/**
 * Loads mini-course translations into the dedicated `miniCourse` i18next
 * namespace once the project and mini-course have resolved. Sibling to
 * `useProjectTranslations` — intentionally NOT extending that hook so the
 * tutorial translation flow stays untouched.
 *
 * Returns `{ isLoading }` so the parent can render a loading indicator if
 * needed.
 */

import { useEffect, useRef, useState } from 'react'

import {
  getPreferredLanguageFromProject,
  loadMiniCourseTranslations,
} from '../i18n'

const useMiniCourseTranslations = (project, miniCourse) => {
  const [isLoading, setIsLoading] = useState(false)
  const loadedRef = useRef(null)

  useEffect(() => {
    if (!project?.id || !miniCourse?.id) return
    // Re-fetch only when the mini-course itself changes (new project /
    // workflow / mini-course id).
    if (loadedRef.current === miniCourse.id) return

    loadedRef.current = miniCourse.id
    const languages = project.available_languages ?? []
    const language = getPreferredLanguageFromProject(languages)

    const run = async () => {
      try {
        setIsLoading(true)
        await loadMiniCourseTranslations(language, miniCourse)
      } catch (error) {
        console.warn('Error loading mini-course translations:', error)
      } finally {
        setIsLoading(false)
      }
    }
    run()
  }, [project?.id, miniCourse?.id])

  return { isLoading }
}

export default useMiniCourseTranslations
