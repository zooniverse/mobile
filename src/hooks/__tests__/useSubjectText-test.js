import { loadSubjectText } from '../useSubjectText'

const originalFetch = global.fetch
afterEach(() => {
  global.fetch = originalFetch
  jest.restoreAllMocks()
})
it('fetches fresh text on each call and preserves whitespace', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: true, text: async () => '  a\n' })
    .mockResolvedValueOnce({ ok: true, text: async () => '  b\n' })
  const values = await Promise.all([
    loadSubjectText('url'),
    loadSubjectText('url')
  ])
  expect(values).toEqual(['  a\n', '  b\n'])
  expect(fetch).toHaveBeenCalledTimes(2)
})
it('reports a failed fetch and allows a later retry', async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({ ok: true, text: async () => '' })
  await expect(loadSubjectText('url')).rejects.toThrow()
  await expect(loadSubjectText('url')).resolves.toBe('')
})
