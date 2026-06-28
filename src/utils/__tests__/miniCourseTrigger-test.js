import 'react-native'
import {
  DEFAULT_FREQUENCY,
  shouldShowMiniCourse,
} from '../miniCourseTrigger'

describe('shouldShowMiniCourse', () => {
  describe('multi-value frequency (exact match)', () => {
    const frequency = [3, 7, 15]

    it('returns true at the exact listed counts', () => {
      expect(shouldShowMiniCourse(3, frequency)).toBe(true)
      expect(shouldShowMiniCourse(7, frequency)).toBe(true)
      expect(shouldShowMiniCourse(15, frequency)).toBe(true)
    })

    it('returns false at counts not in the list', () => {
      expect(shouldShowMiniCourse(1, frequency)).toBe(false)
      expect(shouldShowMiniCourse(2, frequency)).toBe(false)
      expect(shouldShowMiniCourse(5, frequency)).toBe(false)
      expect(shouldShowMiniCourse(8, frequency)).toBe(false)
      expect(shouldShowMiniCourse(14, frequency)).toBe(false)
    })

    it('returns false past the last listed count even at multiples', () => {
      // Multi-value lists are exact-match only — they do NOT modulo.
      expect(shouldShowMiniCourse(30, frequency)).toBe(false)
      expect(shouldShowMiniCourse(45, frequency)).toBe(false)
    })
  })

  describe('single-value frequency (modulo)', () => {
    it('returns true at every Nth count', () => {
      expect(shouldShowMiniCourse(5, [5])).toBe(true)
      expect(shouldShowMiniCourse(10, [5])).toBe(true)
      expect(shouldShowMiniCourse(15, [5])).toBe(true)
      expect(shouldShowMiniCourse(100, [5])).toBe(true)
    })

    it('returns false between intervals', () => {
      expect(shouldShowMiniCourse(1, [5])).toBe(false)
      expect(shouldShowMiniCourse(4, [5])).toBe(false)
      expect(shouldShowMiniCourse(6, [5])).toBe(false)
      expect(shouldShowMiniCourse(11, [5])).toBe(false)
    })

    it('handles a frequency of 1 (every classification)', () => {
      expect(shouldShowMiniCourse(1, [1])).toBe(true)
      expect(shouldShowMiniCourse(2, [1])).toBe(true)
      expect(shouldShowMiniCourse(99, [1])).toBe(true)
    })
  })

  describe('missing or empty frequency (default 5)', () => {
    it('uses DEFAULT_FREQUENCY when frequency is undefined', () => {
      expect(shouldShowMiniCourse(5, undefined)).toBe(true)
      expect(shouldShowMiniCourse(10, undefined)).toBe(true)
      expect(shouldShowMiniCourse(4, undefined)).toBe(false)
    })

    it('uses DEFAULT_FREQUENCY when frequency is null', () => {
      expect(shouldShowMiniCourse(5, null)).toBe(true)
      expect(shouldShowMiniCourse(7, null)).toBe(false)
    })

    it('uses DEFAULT_FREQUENCY when frequency is an empty array', () => {
      expect(shouldShowMiniCourse(5, [])).toBe(true)
      expect(shouldShowMiniCourse(15, [])).toBe(true)
      expect(shouldShowMiniCourse(3, [])).toBe(false)
    })

    it('exposes DEFAULT_FREQUENCY as 5', () => {
      expect(DEFAULT_FREQUENCY).toBe(5)
    })
  })

  describe('boundary and defensive cases', () => {
    it('returns false at count zero (initial state)', () => {
      expect(shouldShowMiniCourse(0, [5])).toBe(false)
      expect(shouldShowMiniCourse(0, undefined)).toBe(false)
      expect(shouldShowMiniCourse(0, [3, 7, 15])).toBe(false)
    })

    it('returns false for negative counts', () => {
      expect(shouldShowMiniCourse(-1, [5])).toBe(false)
      expect(shouldShowMiniCourse(-5, [5])).toBe(false)
    })

    it('returns false for non-finite counts', () => {
      expect(shouldShowMiniCourse(NaN, [5])).toBe(false)
      expect(shouldShowMiniCourse(Infinity, [5])).toBe(false)
      expect(shouldShowMiniCourse('5', [5])).toBe(false)
    })

    it('returns false when single-value interval is 0 or negative', () => {
      expect(shouldShowMiniCourse(5, [0])).toBe(false)
      expect(shouldShowMiniCourse(5, [-3])).toBe(false)
    })
  })
})
