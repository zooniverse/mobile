/**
 * This function calculates how far away a value is from a given range.
 * If the valus is within the range the funtion returns 0
 */
export const distanceFromRange = (value, minValue, maxValue) => {
    if (value < minValue) {
        return  value - minValue
    } 

    if (value > maxValue) { 
        return value - maxValue
    }

    return 0
}

/**
 * Similar to distanceFromRange except this function requires a range of values to compare with another range
 */
export const distanceFromRangeToRange = (minRangeValue, maxRangeValue, minValue, maxValue) => {
    if (minRangeValue < minValue) {
        return minRangeValue - minValue
    }

    if (maxRangeValue > maxValue) {
        return maxRangeValue - maxValue
    }

    return 0
}