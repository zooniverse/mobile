import * as R from 'ramda'

const convertShapesToAnnotationArray = (shapes, toolIndex = 0) => {
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
            tool: toolIndex,
            height: fixedHeight,
            width: fixedWidth,
            x: fixedX,
            y: fixedY
        }
    }, R.filter((shape) => (shape.toolIndex || 0) === toolIndex, shapes)))
}

export const constructDrawingAnnotations = (shapes, tools, task) => {
    return [{
        task,
        value: tools.flatMap((_tool, toolIndex) =>
            convertShapesToAnnotationArray(shapes, toolIndex))
    }]
}
