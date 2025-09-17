import R from 'ramda'

const convertShapesToAnnotationArray = (shapes) => {
    return R.values(R.mapObjIndexed((shape) => {
        // If a shape has negative width and/or height we want convert
        // the coordinates so that they are positive
        const {height, width, x, y} = shape
        const fixedX = width < 0 ? x + width : x
        const fixedY = height < 0 ? y + height : y
        const fixedWidth = width < 0 ? -width : width
        const fixedHeight = height < 0 ? -height : height

        return {
            details: 0,
            frame: 0,
            tool: 0,
            height: fixedHeight,
            width: fixedWidth,
            x: fixedX,
            y: fixedY
        }
    }, shapes))
}

export const constructDrawingAnnotations = (shapes, tools, task) => {
    return tools.map(() => {
        return {
            task,
            value: convertShapesToAnnotationArray(shapes)
        }
    })
}