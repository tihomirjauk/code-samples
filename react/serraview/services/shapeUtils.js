import { isArray } from "lodash";

/**
 * Point is considered to be simple data object with x and y keys
 */
export class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

/**
 * Shape from VBS blocking data
 */
export class Shape {
  constructor(points = []) {
    this.isPolygon = true;
    this.labelPoint = new Point();
    this.coordinates = points; // array of Points
    this.holes = null;
  }
}

/**
 * Removes duplicate points, parallel lines and tiny fragments
 *
 * @param {object} Shape
 */
export const sanitizeShape = (shape = {}) => {
  let newShape = { ...shape };

  if (shape.coordinates.length > 0) {
    newShape.coordinates = cleanPointArray(shape.coordinates);
  }

  let newHoles = [];
  if (shape.holes) {
    for (let hi in shape.holes) {
      const holePoints = shape.holes[hi];
      const newPoints = cleanPointArray(holePoints);
      if (newPoints.length > 0) {
        newHoles = [...newHoles, ...newPoints];
      }
    }
  }

  if (newHoles.length > 0) {
    newShape.holes = newHoles;
  }

  return newShape;
};

export const sanitizeShapeCollection = (shapes = []) => {
  const newShapeCollection = [];
  for (let index in shapes) {
    newShapeCollection.push(sanitizeShape(shapes[index]));
  }
  return newShapeCollection.length > 0 ? newShapeCollection : null;
};

/**
 * Removes duplicate points and parallel lines and tiny fragments
 *
 * @param {array} points
 * @param {int} startIndex
 * @param {float} distanceThreshold
 */
export const cleanPointArray = (
  points = [],
  startIndex = 0,
  distanceThreshold = 3
) => {
  let simplifiedPoints = simplifyPolylineRamerDouglasPeucker(
    points,
    distanceThreshold
  );

  if (simplifiedPoints.length < 3) {
    return simplifiedPoints;
  }

  const newPoints = [];
  const len = simplifiedPoints.length;
  for (let i = startIndex; i < len + startIndex; i++) {
    const index = i % len;
    const currentPoint = simplifiedPoints[index];

    // skip duplicate
    const nextPoint = simplifiedPoints[(index + 1) % len];
    if (!areEqualPoints(currentPoint, nextPoint)) {
      newPoints.push({ x: currentPoint.x, y: currentPoint.y });
    }
  }

  return newPoints;
};

/**
 * Ramer–Douglas–Peucker algorithm to simplify a polyline.
 *
 * The algorithm recursively picks two points on the curve to create a reference line,
 * and removes any points that are less than distance threshold away (by perpendicular distance) from
 * reference line.
 *
 * @param {array} points
 * @param {float} distanceThreshold
 */
export const simplifyPolylineRamerDouglasPeucker = (
  points = [],
  distanceThreshold = 3.0
) => {
  if (points.length < 3) {
    return points;
  }

  let maxIndex = -1;
  let distance = 0;

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  let len = points.length;
  for (let i = 1; i < len - 1; i++) {
    let perpendicularDistance = perpendicularDistanceFromLine(
      points[i],
      firstPoint,
      lastPoint
    );
    if (perpendicularDistance > distance) {
      distance = perpendicularDistance;
      maxIndex = i;
    }
  }

  // if distance is greater than threshold, recursively simplify
  if (distance > distanceThreshold) {
    let left1 = points.filter((e, i) => i <= maxIndex);
    let left2 = points.filter((e, i) => i >= maxIndex);
    let right1 = simplifyPolylineRamerDouglasPeucker(left1);
    let right2 = simplifyPolylineRamerDouglasPeucker(left2);
    return [...right1, ...right2];
  }

  return [firstPoint, lastPoint];
};

/**
 * Calculate distance between subject point and line
 *
 * @param {Point} subjectPoint
 * @param {Point} linePoint11
 * @param {Point} linePoint12
 */
export const perpendicularDistanceFromLine = (
  subjectPoint,
  linePoint1,
  linePoint2
) => {
  let result;
  if (linePoint1.x == linePoint2.x) {
    result = Math.abs(subjectPoint.x - linePoint1.x);
  } else {
    const slope = (linePoint2.y - linePoint1.y) / (linePoint2.x - linePoint1.x);
    const intercept = linePoint1.y - slope * linePoint1.x;
    result =
      Math.abs(slope * subjectPoint.x - subjectPoint.y + intercept) /
      Math.sqrt(Math.pow(slope, 2) + 1);
  }
  return result;
};

/**
 * Check if two points are equal
 * Consider them equal if distance is bellow threshold
 *
 * @param {Point} point1
 * @param {Point} point2
 * @param {float} threshold
 */
export const areEqualPoints = (point1, point2, threshold = 0.0101) => {
  if (Math.abs(point2.x - point1.x) <= threshold) {
    return Math.abs(point2.y - point1.y) <= threshold;
  }

  return false;
};

/**
 *
 * Checks if an array of points is clockwise
 *
 * @param {Point[]} points an array of points
 * It always returns false if fewer than 3 points are
 * supplied.
 */
export const isPathClockwise = (points) => {
  if (!points || points.length < 3) {
    return false;
  }

  const length = points.length;
  let curve = 0;
  for (let i = 0; i < length; i++) {
    const nextI = (i + 1) % length;
    curve += points[i].x * points[nextI].y - points[nextI].x * points[i].y;
  }

  return curve > 0;
};

/**
 *
 * Calculates the polygonal area from an array of points.
 * If there are fewer than 3 points an area of 0 will be
 * returned.
 *
 * Note this does not handle self intersecting contours
 *
 * @param {Point[]} points an array of points
 */
export const calculatePolygonalAreaFromPoints = (points) => {
  if (!points || points.length < 3) {
    return 0;
  }

  const { length } = points;
  let area = 0;
  const { x, y } = points[0];
  points.forEach((point, index) => {
    const nextI = (index + 1) % length;
    const x1 = point.x - x;
    const y1 = point.y - y;
    const x2 = points[nextI].x - x;
    const y2 = points[nextI].y - y;
    const cross = x1 * y2 - x2 * y1;
    area += cross;
  });
  return Math.abs(area) / 2;
};

/**
 * Calculates the polygonal area of a shape an array of shapes.
 * @param {*} shape
 */
export const calculatePolygonalAreaOfShape = (shape) => {
  if (!shape) {
    return 0;
  }
  if (isArray(shape)) {
    if (shape.length === 0) {
      return 0;
    }
    let totalArea = calculatePolygonalAreaOfShape(shape[0]);
    for (let i = 1; i < shape.length; i++) {
      totalArea += calculatePolygonalAreaOfShape(shape[i]);
    }
    return totalArea;
  }

  let area = calculatePolygonalAreaFromPoints(shape.coordinates);
  if (shape.holes) {
    shape.holes.forEach((hole) => {
      area -= calculatePolygonalAreaFromPoints(hole);
    });
  }
  if (area < 0) {
    // Something is invalid with the holes.
    return 0;
  }
  return area;
};

/**
 *
 * Converts a Serraview shape to a coordinate array that conforms to the GeoJson RFC.
 * If provided with null or a shape without coordinates it will return null.
 *
 * @param {*} shape a Serraview shape
 *
 */
export const shapeToGeoContour = (shape) => {
  if (!shape || !shape.coordinates || shape.coordinates.length === 0) {
    return null;
  }
  const { coordinates, holes } = shape;
  let newCoords = coordinates.map((point) => [point.x, point.y]);
  if (newCoords.length > 2) {
    newCoords.push([...newCoords[0]]); // Close back at the start
    if (isPathClockwise(coordinates)) {
      // A outer ring must be counter-clockwise
      newCoords.reverse();
    }
    newCoords = [newCoords];
    if (holes) {
      holes.forEach((holeContour) => {
        // Check it's a complete contour
        if (holeContour && holeContour.length > 2) {
          const isClockwise = isPathClockwise(holeContour);
          const newHoleContour = holeContour.map((point) => [point.x, point.y]);
          newHoleContour.push([...newHoleContour[0]]); // Close back at the start
          if (!isClockwise) {
            // Holes must be clockwise per the GeoJson spec
            // https://tools.ietf.org/html/rfc7946
            newHoleContour.reverse();
          }
          newCoords.push(newHoleContour);
        }
      });
    }
  }
  return newCoords;
};

/**
 * Converts shapes to polybool regions for clipping
 * @param {*} shapeCollection
 */
export const shapesToPolyBoolRegions = (shapeCollection) => {
  if (!shapeCollection) {
    return null;
  }

  if (Array.isArray(shapeCollection)) {
    const geoContour = [];
    shapeCollection.forEach((shape) => {
      const contours = shapeToGeoContour(shape);
      if (contours) {
        contours.forEach((contour) => {
          geoContour.push(contour);
        });
      }
    });
    if (geoContour.length === 0) {
      return null;
    }
    return geoContour;
  } else {
    return shapeToGeoContour(shapeCollection);
  }
};

export const simplifyPoint = (point) => {
  return {
    x: Math.round(point.x * 1000) / 1000,
    y: Math.round(point.y * 1000) / 1000,
  };
};

/**
 * Converts GeoJson contours to an array of shapes.
 * It does not handle full GeoJson objects.
 *
 * @param {*} geoContour
 */
export const geoContourToShapes = (geoContour) => {
  if (!geoContour || geoContour.length === 0) {
    return null;
  }

  const shapes = [];

  if (
    Array.isArray(geoContour[0]) &&
    Array.isArray(geoContour[0][0]) &&
    Array.isArray(geoContour[0][0][0])
  ) {
    // This is a GeoJson MultiPolygon
    geoContour.forEach((poly) => {
      const shape = geoContourToShapes(poly);
      if (shape && shape.length > 0) {
        shapes.push(shape[0]);
      }
    });
  } else {
    // This is a GeoJson Polygon
    const holes = [];
    let coordinates = geoContour[0].map((xyArray) => ({
      x: xyArray[0],
      y: xyArray[1],
    }));
    removeClosingVertex(coordinates);
    if (isPathClockwise(coordinates)) {
      coordinates.reverse();
    }

    for (let i = 1; i < geoContour.length; i++) {
      let pointArray = geoContour[i].map((xyArray) => ({
        x: xyArray[0],
        y: xyArray[1],
      }));
      removeClosingVertex(pointArray);
      if (!isPathClockwise(pointArray)) {
        pointArray.reverse();
      }
      holes.push(pointArray);
    }

    const labelPoint = findCentroid(coordinates); // TODO find the real label point
    shapes.push({
      isPolygon: coordinates.length > 1,
      labelPoint: simplifyPoint(labelPoint),
      coordinates,
      holes: holes.length > 0 ? holes : null,
    });
  }

  return shapes.length === 0 ? null : shapes;
};

/**
 *
 * Finds the center point of a contour.
 *
 * @param {*} points
 */
export const findCentroid = (points) => {
  if (!points || points.length === 0) {
    return null;
  }

  if (points.length === 1) {
    return { ...points[0] };
  }

  if (points.length === 2) {
    return {
      x: (points[0].x + points[1].x) / 2,
      y: (points[0].y + points[1].y) / 2,
    };
  }

  let x = 0;
  let y = 0;
  points.forEach((vertex) => {
    x += vertex.x;
    y += vertex.y;
  });

  const length = points.length;
  x = x / length;
  y = y / length;
  return { x, y };
};

const removeClosingVertex = (points) => {
  if (!points) {
    return;
  }
  const length = points.length;
  if (
    length > 3 &&
    points[0].x === points[length - 1].x &&
    points[0].y === points[length - 1].y
  ) {
    points.pop();
  }
};

/**
 * Parses the contour string of a core shape string, applying the offset.
 *
 * @param {*} contourString
 * @param {*} offsetX
 * @param {*} offsetY
 */
const parseCoreContourString = (contourString, offsetX = 0, offsetY = 0) => {
  let contour = contourString.split("|");
  if (contour.length !== 2) {
    throw {
      message:
        "Error parsing core shape string: A core shape string must have xs & ys.",
    };
  }

  let xs = contour[0].split(",");
  let ys = contour[1].split(",");
  if (xs.length < 3) {
    throw {
      message:
        "Error parsing core contour string: The number of vertices must be greater than 2.",
    };
  }
  if (xs.length !== ys.length) {
    throw {
      message:
        "Error parsing core contour string: xs & ys array length must match.",
    };
  }

  const coordinates = [];
  let length = xs.length;
  for (let i = 0; i < length; i++) {
    coordinates.push({
      x: Number(xs[i].trim()) + offsetX,
      y: Number(ys[i].trim()) + offsetY,
    });
  }

  return coordinates;
};

/**
 * Parses a core shape collection string.
 *
 * @param {*} shapeString
 */
export const parseCoreShapeCollectionString = (shapeString) => {
  let cleanedShapeString = shapeString
    ? shapeString.trim().toLocaleLowerCase()
    : "";
  if (cleanedShapeString === "") {
    return null;
  }

  let shapes = [];

  const shapeStrings = shapeString.split("#");
  shapeStrings.forEach((individualShapeString) => {
    let inputString = individualShapeString.trim();
    if (inputString && inputString !== "") {
      const labelPositionSplit = inputString.split("$");
      inputString = labelPositionSplit[0];
      const index = inputString.indexOf("x");
      let hideLabel = false;
      if (index !== -1) {
        hideLabel = true;
        inputString = inputString.substring(0, index).trim();
      }

      const shapeSplit = inputString.split("^");
      const originSplit = shapeSplit[0].split(",");
      if (!originSplit || originSplit.length !== 2) {
        throw {
          message:
            "Error parsing core shape string: A shape must have an origin.",
        };
      }
      const originX = Number(originSplit[0].trim());
      const originY = Number(originSplit[1].trim());
      let shape = {
        hideLabel,
        isPolygon: true,
        holes: null,
      };

      // If this is a point
      if (shapeSplit.length === 1) {
        shape.labelPoint = { x: originX, y: originY };
        shape.coordinates = [{ x: originX, y: originY }]; // We want a different oject ref.
        shape.isPolygon = false;
        shapes.push(shape);
        return;
      }

      if (labelPositionSplit.length > 1) {
        const labelPosSplit = labelPositionSplit[1].split(",");
        shape.labelPoint = {
          x: Number(labelPosSplit[0].trim()),
          y: Number(labelPosSplit[1].trim()),
        };
      }

      inputString = shapeSplit[1].trim();
      const inputParts = inputString.split("h");
      const inputPartsLength = inputParts.length;
      if (inputPartsLength === 0) {
        // We received some malformed string like x,y^h
        throw {
          message:
            "Error parsing core shape string: Cannot have holes without a contour.",
        };
      }

      shape.coordinates = parseCoreContourString(
        inputParts[0],
        originX,
        originY
      );
      if (!shape.labelPoint) {
        shape.labelPoint = findCentroid(shape.coordinates); // TODO find real label point
      }
      const holes = [];
      for (let i = 1; i < inputPartsLength; i++) {
        holes.push(parseCoreContourString(inputParts[i], originX, originY));
      }
      shape.holes = holes.length === 0 ? null : holes;
      shapes.push(shape);
    }
  });

  return shapes;
};

/**
 * Parses a JSON or Core representation of our shapes.
 * @param {*} shapeString
 */
export const parseShapeCollectionString = (shapeString) => {
  let cleanedShapeString = shapeString ? shapeString.trim() : "";
  if (cleanedShapeString === "") {
    return null;
  }

  const replaceQuoted = (text, value) => {
    const replacement = `"${value}"`;
    if (text.indexOf(replacement) === -1) {
      return text.replace(value, replacement);
    }
    return text;
  };

  let shapes = null;

  if (
    cleanedShapeString.indexOf("{") === -1 &&
    cleanedShapeString.indexOf("[") === -1
  ) {
    return parseCoreShapeCollectionString(shapeString);
  } else {
    cleanedShapeString = cleanedShapeString.toLocaleLowerCase();
    cleanedShapeString = replaceQuoted(cleanedShapeString, "coordinates");
    cleanedShapeString = replaceQuoted(cleanedShapeString, "holes");
    cleanedShapeString = replaceQuoted(cleanedShapeString, "ispolygon");
    cleanedShapeString = cleanedShapeString.replace("ispolygon", "isPolygon");
    cleanedShapeString = replaceQuoted(cleanedShapeString, "labelpoint");
    cleanedShapeString = cleanedShapeString.replace("labelpoint", "labelPoint");
    while (cleanedShapeString.indexOf("x:") >= 0) {
      // Assume if we're missing a '":' the quote is missing on both sides
      cleanedShapeString = cleanedShapeString.replace("x:", '"x":');
    }

    while (cleanedShapeString.indexOf("y:") >= 0) {
      // Assume if we're missing a '":' the quote is missing on both sides
      cleanedShapeString = cleanedShapeString.replace("y:", '"y":');
    }

    shapes = JSON.parse(cleanedShapeString);
  }

  if (!shapes) {
    return null;
  }

  if (!Array.isArray(shapes)) {
    // Put it in an array before validation
    shapes = [shapes];
  }

  shapes.forEach((shape) => {
    if (
      !shape.coordinates ||
      !Array.isArray(shape.coordinates) ||
      shape.coordinates.length == 0
    ) {
      throw { message: "A shape must have coordinates." };
    }

    if (shape.coordinates.length == 2) {
      throw {
        message:
          "A shape must have 1 or greater than 2 coordinates (i.e. no lines).",
      };
    }

    shape.isPolygon = shape.coordinates.length > 1;

    if (!shape.labelPoint) {
      shape.labelPoint = findCentroid(shape.coordinates); // TODO find real label point
    }
    if (shape.hideLabel === undefined) {
      shape.hideLabel = false;
    }
    if (shape.holes) {
      if (Array.isArray(shape.holes)) {
        if (shape.holes.length == 0) {
          shape.holes = null;
        }
      }
    } else {
      shape.holes = null;
    }
  });
  return shapes;
};

/**
 * Checks whether a point is in a contour.
 *
 * @param {*} contour an array of points
 * @param {*} x
 * @param {*} y
 */
export const contourContainsPoint = (contour, x, y) => {
  // If there is no contour or if it's a point or a line it cannot contain the point
  if (
    !contour ||
    contour.length < 3 ||
    x === null ||
    x === undefined ||
    y === null ||
    y === undefined
  ) {
    return false;
  }

  let xinters;
  const length = contour.length;
  let counter = 0;

  let x1 = contour[0].x;
  let y1 = contour[0].y;
  let x2, y2;

  for (let i = 1; i <= length; i++) {
    const index = i % length;
    x2 = contour[index].x;
    y2 = contour[index].y;

    if (y > Math.min(y1, y2)) {
      // yes, ignore it if it's on the edge (> not >=, see http://geomalgorithms.com/a03-_inclusion.html#Edge-Crossing-Rules)
      if (y <= Math.max(y1, y2)) {
        // Point's y value is between the line's y values
        if (x <= Math.max(x1, x2)) {
          // Draw a ray from the point to the right
          if (y1 != y2) {
            // Ignore horizontal lines
            xinters = ((y - y1) * (x2 - x1)) / (y2 - y1) + x1;
            if (x1 == x2 || x <= xinters) {
              // line is vertical or the point is to the left of the actual intercept
              counter++;
            }
          }
        }
      }
    }
    x1 = x2;
    y1 = y2;
  }

  return counter % 2 != 0;
};

/**
 * Checks if a point is in the supplied shapes
 * @param {*} shapes a shape or an array of shapes
 * @param {*} x
 * @param {*} y
 */
export const shapesContainsPoint = (shapes, x, y) => {
  const shapeCollection = Array.isArray(shapes) ? shapes : [shapes];
  const length = shapeCollection.length;
  for (let i = 0; i < length; i++) {
    const shape = shapeCollection[i];
    if (
      shape &&
      shape.coordinates &&
      contourContainsPoint(shape.coordinates, x, y)
    ) {
      // The contour contains the point. Check if it's in a hole.
      const { holes } = shape;
      if (holes && holes.length > 0) {
        const numHoles = holes.length;
        for (let h = 0; h < numHoles; h++) {
          if (contourContainsPoint(holes[h], x, y)) {
            return false;
          }
        }
      }
      return true;
    }
  }

  return false;
};

const arePointsArrayEqual = (pointsA, pointsB) => {
  if (!pointsA && !pointsB) {
    return true;
  }
  if (
    (pointsA && !pointsB) ||
    (!pointsA && pointsB) ||
    pointsA.length !== pointsB.length
  ) {
    return false;
  }

  for (let i = 0; i < pointsA.length; i++) {
    if (!areEqualPoints(pointsA[i], pointsB[i])) {
      return false;
    }
  }

  return true;
};

export const areShapesEqual = (shapeA, shapeB) => {
  if (
    (shapeA && !shapeB) ||
    (!shapeA && shapeB) ||
    (shapeA.holes && !shapeB.holes) ||
    (!shapeA.holes && shapeB.holes) ||
    (shapeA.holes &&
      shapeB.holes &&
      shapeA.holes.length !== shapeB.holes.length) ||
    !arePointsArrayEqual(shapeA.coordinates, shapeB.coordinates)
  ) {
    return false;
  }

  if (shapeA.holes) {
    for (let i = 0; i < shapeA.holes.length; i++) {
      if (!arePointsArrayEqual(shapeA.holes[i], shapeB.holes[i])) {
        return false;
      }
    }
  }

  return true;
};

export const areShapeCollectionsEqual = (
  shapeCollectionA,
  shapeCollectionB
) => {
  if (!shapeCollectionA && !shapeCollectionB) {
    return true;
  }

  if (
    (shapeCollectionA && !shapeCollectionB) ||
    (!shapeCollectionA && shapeCollectionB) ||
    shapeCollectionA.length !== shapeCollectionB.length
  ) {
    return false;
  }

  for (let i = 0; i < shapeCollectionA.length; i++) {
    if (!areShapesEqual(shapeCollectionA[i], shapeCollectionB[i])) {
      return false;
    }
  }

  return true;
};
