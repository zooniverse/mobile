import { useEffect, useState, useCallback } from 'react'

// Fetch only the current subject's text; the classifier screen owns its lifetime.
export async function loadSubjectText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Unable to load subject text')
  return response.text()
}

export default function useSubjectText(subject) {
  const url =
    subject?.locations?.find(location => location['text/plain'])?.[
      'text/plain'
    ] ||
    subject?.displays?.find(
      display => display.type === 'text' && display.format === 'plain'
    )?.src
  const key = `${subject?.id}:${url}`
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState({})
  useEffect(() => {
    let active = true
    if (!url) {
      setState({ key, status: 'error' })
      return () => {
        active = false
      }
    }
    setState({ key, status: 'loading' })
    loadSubjectText(url).then(
      text => {
        if (active) setState({ key, status: 'success', text })
      },
      () => {
        if (active) setState({ key, status: 'error' })
      }
    )
    return () => {
      active = false
    }
  }, [key, url, attempt])
  const retry = useCallback(() => setAttempt(value => value + 1), [])
  return { ...(state.key === key ? state : { status: 'loading' }), retry }
}
