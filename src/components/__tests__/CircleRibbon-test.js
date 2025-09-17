import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'
import { CircleRibbon } from '../CircleRibbon'

it('renders correctly with projects', () => {
  let projects = {
    '11':
     { name: 'Whales as Individuals',
       slug: 'tedcheese/whales-as-individuals',
       activity_count: 5,
       sort_order: 3 },
    '14':
     { name: 'Snapshots at Sea',
       slug: 'tedcheese/snapshots-at-sea',
       activity_count: 7,
       sort_order: 2 },
    '17':
     { name: 'Planet Four: Terrains',
       slug: 'mschwamb/planet-four-terrains',
       activity_count: 7,
       sort_order: 1 }
  }

  let totalClassifications = 19

  const tree = renderer.create(
    <CircleRibbon projects={projects} totalClassifications={totalClassifications} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with a majority project', () => {
  let projects = {
    '11':
     { name: 'Whales as Individuals',
       slug: 'tedcheese/whales-as-individuals',
       activity_count: 5,
       sort_order: 3 },
    '14':
     { name: 'Snapshots at Sea',
       slug: 'tedcheese/snapshots-at-sea',
       activity_count: 7,
       sort_order: 2 },
    '17':
     { name: 'Planet Four: Terrains',
       slug: 'mschwamb/planet-four-terrains',
       activity_count: 70,
       sort_order: 1 }
  }

  let totalClassifications = 82

  const tree = renderer.create(
    <CircleRibbon projects={projects} totalClassifications={totalClassifications} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with 1 project', () => {
  let projects = {
    '11':
     { name: 'Whales as Individuals',
       slug: 'tedcheese/whales-as-individuals',
       activity_count: 5,
       sort_order: 1 }
  }

  let totalClassifications = 5

  const tree = renderer.create(
    <CircleRibbon projects={projects} totalClassifications={totalClassifications} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with no projects', () => {
  let projects = {}
  let totalClassifications = null

  const tree = renderer.create(
    <CircleRibbon projects={projects} totalClassifications={totalClassifications} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})

it('renders correctly with 1 classification', () => {
  let projects = {
    '11':
     { name: 'Whales as Individuals',
       slug: 'tedcheese/whales-as-individuals',
       activity_count: 1,
       sort_order: 1 }
    }
  let totalClassifications = 1

  const tree = renderer.create(
    <CircleRibbon projects={projects} totalClassifications={totalClassifications} />
  ).toJSON()
  expect(tree).toMatchSnapshot()
})
