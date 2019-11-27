import { tagMuseumRoleForProjects } from '../projects'
import apiClient from 'panoptes-client/lib/api-client'

describe('function > tagMuseumRoleForProjects', function() {
  test('it tags a project in_museum_mode if user has museum role', async () => {
    jest
      .spyOn(apiClient, 'type')
      .mockImplementation(() => {
        return {
          get: () => Promise.resolve([{ id: '1' }])
        }
      })
    let projects = [{ id: '1' }, { id: '2' }]
    await tagMuseumRoleForProjects(projects)
    expect(projects[0].in_museum_mode).toBe(true)
  })

  test('it won\'t tag a project in_museum_mode without user role', async () => {
    jest
      .spyOn(apiClient, 'type')
      .mockImplementation(() => {
        return {
          get: () => Promise.resolve([])
        }
      })
    let projects = [{ id: '1' }, { id: '2' }]
    await tagMuseumRoleForProjects(projects)
    expect(projects[0].in_museum_mode).toBe(false)
  })
})
