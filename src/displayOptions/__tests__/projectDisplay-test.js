import {sortUnfinishedFirst} from '../projectDisplay'

it('sorts the projects so incomplete ones appear before complete ones', () => {
    const projects = [
        {"title": "incomplete project", "completeness": "0.01"},
        {"title": "complete project", "completeness": "1.0"},
    ]

    const sortedProjects = sortUnfinishedFirst(projects)
    expect(sortedProjects.map((project) => project.title))
        .toEqual(["incomplete project", "complete project"])
})


