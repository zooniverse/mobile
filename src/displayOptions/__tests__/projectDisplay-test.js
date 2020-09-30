import {isComplete, sortUnfinishedFirst} from '../projectDisplay'

it('identifies which projects are complete', () => {
    expect(isComplete("0.86475842858515")).toEqual(false)
    expect(isComplete("1")).toEqual(true)
    expect(isComplete("0.605204421920542")).toEqual(false)
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

it('sorts the projects so incomplete ones appear before complete ones', () => {
    const projects = [
        {"title": "incomplete project", "completeness": "0.01"},
        {"title": "complete project", "completeness": "1.0"},
        {"title": "incomplete project", "completeness": "0.01"},
        {"title": "complete project", "completeness": "1.0"},
        {"title": "incomplete project", "completeness": "0.01"},
        {"title": "complete project", "completeness": "1.0"},
        {"title": "incomplete project", "completeness": "0.01"},
    ]

    const sortedProjects = sortUnfinishedFirst(projects)
    expect(sortedProjects.map((project) => project.title))
        .toEqual([
            "incomplete project",
            "incomplete project",
            "incomplete project",
            "incomplete project",
            "complete project",
            "complete project",
            "complete project",
        ])
})


