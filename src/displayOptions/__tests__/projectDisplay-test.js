import {isComplete, sortUnfinishedFirst} from '../projectDisplay'

it('identifies which projects are complete', () => {
    expect(isComplete("0.01")).toEqual(false)
    expect(isComplete("1.00")).toEqual(true)
})

it('sorts the projects so incomplete ones appear before complete ones', () => {
    const projects = [
        {"title": "incomplete project", "completeness": "0.01"},
        {"title": "complete project", "completeness": "1.0"},
    ]

    const sortedProjects = sortUnfinishedFirst(projects)
    expect(sortedProjects.map((project) => project.title))
        .toEqual(["incomplete project", "complete project"])
})


