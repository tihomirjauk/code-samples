import { iteratee } from "lodash";
import {
  areEqualPoints,
  cleanPointArray,
  isPathClockwise,
  perpendicularDistanceFromLine,
  Point,
  sanitizeShape,
  sanitizeShapeCollection,
  simplifyPolylineRamerDouglasPeucker,
} from "./shapeUtils.js";

import * as shapeUtils from "./shapeUtils.js";

const sampleEmptyShape = {
  isPolygon: true,
  labelPoint: { x: 0, y: 0 },
  coordinates: [],
  holes: null,
};

const sampleZoneShape = {
  isPolygon: true,
  labelPoint: {
    x: 3429.5912,
    y: 1925.9742,
  },
  coordinates: [
    {
      x: 6541.4771,
      y: 3366.7522,
    },
    {
      x: 5009.0098,
      y: 3366.7522,
    },
    {
      x: 5009.0098,
      y: 3306.2151,
    },
    {
      x: 4676.4658,
      y: 3306.2151,
    },
    {
      x: 4676.4658,
      y: 3724.477,
    },
    {
      x: 4661.6958,
      y: 3724.477,
    },
    {
      x: 4661.6958,
      y: 3743.0342,
    },
    {
      x: 4401.8271,
      y: 3743.2251,
    },
    {
      x: 4401.8271,
      y: 3722.9011,
    },
    {
      x: 4340.8672,
      y: 3722.9011,
    },
    {
      x: 4340.8672,
      y: 3743.2241,
    },
    {
      x: 3951.0879,
      y: 3743.2451,
    },
    {
      x: 3951.0879,
      y: 3722.9011,
    },
    {
      x: 3879.1519,
      y: 3722.9011,
    },
    {
      x: 3879.1519,
      y: 3743.2451,
    },
    {
      x: 3869.8379,
      y: 3743.2451,
    },
    {
      x: 3869.8379,
      y: 3767.01,
    },
    {
      x: 3394.7949,
      y: 3766.8931,
    },
    {
      x: 3394.7949,
      y: 3743.2212,
    },
    {
      x: 3310.1279,
      y: 3722.9011,
    },
    {
      x: 3310.1279,
      y: 3743.2622,
    },
    {
      x: 3300.842,
      y: 3743.2622,
    },
    {
      x: 3300.842,
      y: 3766.969,
    },
    {
      x: 3209.4019,
      y: 3767.1172,
    },
    {
      x: 3209.3809,
      y: 3743.2622,
    },
    {
      x: 3045.1489,
      y: 3743.2622,
    },
    {
      x: 3045.1489,
      y: 3766.969,
    },
    {
      x: 2953.731,
      y: 3767.1172,
    },
    {
      x: 2953.731,
      y: 3743.2622,
    },
    {
      x: 2933.4109,
      y: 3743.2622,
    },
    {
      x: 2933.4109,
      y: 3718.709,
    },
    {
      x: 2930.8708,
      y: 3718.709,
    },
    {
      x: 2930.8708,
      y: 3389.7642,
    },
    {
      x: 2872.146,
      y: 3387.0911,
    },
    {
      x: 2811.7329,
      y: 3387.0911,
    },
    {
      x: 2808.3459,
      y: 3387.0911,
    },
    {
      x: 2808.3459,
      y: 3484.8811,
    },
    {
      x: 29.21,
      y: 3484.8811,
    },
    {
      x: 29.21,
      y: 716.2808,
    },
    {
      x: 2804.2659,
      y: 716.2808,
    },
    {
      x: 2804.2659,
      y: 800.7358,
    },
    {
      x: 2808.9709,
      y: 800.7358,
    },
    {
      x: 2872.0259,
      y: 800.7358,
    },
    {
      x: 2872.0281,
      y: 962.2373,
    },
    {
      x: 2926.21,
      y: 962.2373,
    },
    {
      x: 2926.21,
      y: 866.352,
    },
    {
      x: 2918.167,
      y: 866.352,
    },
    {
      x: 2918.167,
      y: 455.2954,
    },
    {
      x: 2911.8169,
      y: 455.2954,
    },
    {
      x: 2911.8169,
      y: 309.1758,
    },
    {
      x: 2932.3489,
      y: 308.9019,
    },
    {
      x: 2932.3489,
      y: 56.0918,
    },
    {
      x: 2932.3489,
      y: 43.1807,
    },
    {
      x: 3037.335,
      y: 43.1807,
    },
    {
      x: 3037.335,
      y: 18.2041,
    },
    {
      x: 3255.1399,
      y: 18.2041,
    },
    {
      x: 3255.095,
      y: 47.8369,
    },
    {
      x: 3261.9141,
      y: 47.8369,
    },
    {
      x: 3274.4019,
      y: 47.8369,
    },
    {
      x: 3346.157,
      y: 47.8369,
    },
    {
      x: 3346.157,
      y: 43.1807,
    },
    {
      x: 3367.5359,
      y: 43.1807,
    },
    {
      x: 3367.5359,
      y: 18.2041,
    },
    {
      x: 3581.9539,
      y: 18.2041,
    },
    {
      x: 3581.9539,
      y: 43.1807,
    },
    {
      x: 3600.792,
      y: 43.1807,
    },
    {
      x: 3600.792,
      y: 47.8369,
    },
    {
      x: 3673.1819,
      y: 47.8369,
    },
    {
      x: 3673.1819,
      y: 43.1807,
    },
    {
      x: 3692.2319,
      y: 43.1807,
    },
    {
      x: 3692.2319,
      y: 18.2041,
    },
    {
      x: 3905.803,
      y: 18.2041,
    },
    {
      x: 3905.803,
      y: 33.8672,
    },
    {
      x: 3924.0071,
      y: 33.8672,
    },
    {
      x: 3924.0071,
      y: 47.8369,
    },
    {
      x: 3997.668,
      y: 47.8369,
    },
    {
      x: 3997.668,
      y: 33.8672,
    },
    {
      x: 4017.3521,
      y: 33.8672,
    },
    {
      x: 4017.3521,
      y: 18.2041,
    },
    {
      x: 4231.2407,
      y: 18.2041,
    },
    {
      x: 4231.2407,
      y: 33.8672,
    },
    {
      x: 4249.021,
      y: 33.8672,
    },
    {
      x: 4249.021,
      y: 47.8369,
    },
    {
      x: 4322.6812,
      y: 47.8369,
    },
    {
      x: 4322.6812,
      y: 33.8672,
    },
    {
      x: 4341.3081,
      y: 33.8672,
    },
    {
      x: 4341.3081,
      y: 18.2041,
    },
    {
      x: 4537.7349,
      y: 18.2041,
    },
    {
      x: 4537.7349,
      y: 33.8672,
    },
    {
      x: 4654.8921,
      y: 33.8672,
    },
    {
      x: 4654.8921,
      y: 56.0918,
    },
    {
      x: 4689.8169,
      y: 56.0918,
    },
    {
      x: 4689.8169,
      y: 306.0522,
    },
    {
      x: 4715.2168,
      y: 306.0522,
    },
    {
      x: 4715.2168,
      y: 227.3125,
    },
    {
      x: 4991.23,
      y: 227.3125,
    },
    {
      x: 4991.23,
      y: 91.877,
    },
    {
      x: 6541.4771,
      y: 91.877,
    },
  ],
  holes: null,
};

/*
{:isPolygon=>true, :labelPoint=>{:x=>1555.4929, :y=>588.6742}, :coordinates=>[{:x=>1593.45, :y=>1016.65}, {:x=>1488.9, :y=>953.55}, {:x=>1487.39, :y=>950.15}, {:x=>1548.4, :y=>850.8}, {:x=>1438.45, :y=>789.55}, {:x=>1426.0, :y=>812.44}, {:x=>1296.05, :y=>520.95}, {:x=>1353.75, :y=>373.1}, {:x=>1651.75, :y=>251.15}, {:x=>1675.75, :y=>251.15}, {:x=>1740.65, :y=>263.75}, {:x=>1740.65, :y=>363.5}, {:x=>1726.85, :y=>825.6}], :holes=>[[{:x=>1415.66, :y=>681.79}, {:x=>1389.94, :y=>681.79}, {:x=>1389.94, :y=>707.51}, {:x=>1415.66, :y=>707.51}], [{:x=>1548.4, :y=>457.85}, {:x=>1454.7, :y=>412.75}, {:x=>1391.6, :y=>558.8}, {:x=>1479.9, :y=>602.05}]]}
*/
const sampleShapeWithHoles = {
  isPolygon: true,
  labelPoint: { x: 1555.4929, y: 588.6742 },
  coordinates: [
    { x: 1593.45, y: 1016.65 },
    { x: 1488.9, y: 953.55 },
    { x: 1487.39, y: 950.15 },
    { x: 1548.4, y: 850.8 },
    { x: 1438.45, y: 789.55 },
    { x: 1426.0, y: 812.44 },
    { x: 1296.05, y: 520.95 },
    { x: 1353.75, y: 373.1 },
    { x: 1651.75, y: 251.15 },
    { x: 1675.75, y: 251.15 },
    { x: 1740.65, y: 263.75 },
    { x: 1740.65, y: 363.5 },
    { x: 1726.85, y: 825.6 },
  ],
  holes: [
    [
      { x: 1415.66, y: 681.79 },
      { x: 1389.94, y: 681.79 },
      { x: 1389.94, y: 707.51 },
      { x: 1415.66, y: 707.51 },
    ],
    [
      { x: 1548.4, y: 457.85 },
      { x: 1454.7, y: 412.75 },
      { x: 1391.6, y: 558.8 },
      { x: 1479.9, y: 602.05 },
    ],
  ],
};

// Space 10C-606
const sampleSpaceShape = {
  isPolygon: true,
  labelPoint: {
    x: 3069.321,
    y: 3264.4531,
  },
  coordinates: [
    {
      x: 3217.1704,
      y: 3360.5598,
    },
    {
      x: 2933.4106,
      y: 3360.5598,
    },
    {
      x: 2933.4106,
      y: 3306.7903,
    },
    {
      x: 2917.019,
      y: 3306.7903,
    },
    {
      x: 2917.019,
      y: 3170.4851,
    },
    {
      x: 3217.1704,
      y: 3170.4851,
    },
  ],
  holes: null,
};

// occupant point
const sampleOccupantShape = {
  isPolygon: false,
  labelPoint: {
    x: 3070.2789,
    y: 1022.5043,
  },
  coordinates: [
    {
      x: 3070.2789,
      y: 1022.5043,
    },
  ],
  holes: null,
};

//  unoptimized triangle
const sampleTriangleShape = {
  isPolygon: true,
  labelPoint: { x: 0, y: 0 },
  coordinates: [
    { x: 0, y: 0 },
    { x: 2, y: 2 },
    { x: 4, y: 4 },
    { x: 6, y: 6 },
    { x: 6, y: 6 },
    { x: 6, y: 0 },
  ],
  holes: null,
};

describe("sanitizeShape", () => {
  test("it does not break on empty shape", () => {
    const optimizedShape = sanitizeShape(sampleEmptyShape);
    expect(optimizedShape.coordinates.length).toBe(0);
  });

  test("it optimizes and removes points from zone shape", () => {
    let extraPointShape = { ...sampleZoneShape };
    extraPointShape.coordinates.push({ x: 6541.47, y: 91.87 });
    const optimizedShape = sanitizeShape(extraPointShape);
    expect(optimizedShape.coordinates.length).toBe(91);
  });

  test("it adds point and then removes that point by optimizing line points", () => {
    let extraPointShape = { ...sampleSpaceShape };
    extraPointShape.coordinates.push({ x: 3217.17, y: 3170.485 });
    const optimizedShape = sanitizeShape(extraPointShape);
    expect(optimizedShape.coordinates.length).toBe(6);
  });

  test("sanitize shape with holes", () => {
    const optimizedShape = sanitizeShape(sampleShapeWithHoles);
    expect(optimizedShape.coordinates.length).toBe(12);
  });

  test("sanitize single point shape", () => {
    const optimizedShape = sanitizeShape(sampleOccupantShape);
    expect(optimizedShape.coordinates.length).toBe(1);
  });

  test("sanitize unoptimized triangle", () => {
    expect(sampleTriangleShape.coordinates.length).toBe(6);
    const optimizedShape = sanitizeShape(sampleTriangleShape);
    expect(optimizedShape.coordinates.length).toBe(3);
  });
});

describe("sanitizeShapeCollection", () => {
  test("it should optimize all shapes", () => {
    const shapes = [sampleOccupantShape, sampleTriangleShape];
    const result = JSON.stringify(sanitizeShapeCollection(shapes));
    const optimized = JSON.stringify([
      {
        isPolygon: false,
        labelPoint: {
          x: 3070.2789,
          y: 1022.5043,
        },
        coordinates: [
          {
            x: 3070.2789,
            y: 1022.5043,
          },
        ],
        holes: null,
      },
      {
        isPolygon: true,
        labelPoint: { x: 0, y: 0 },
        coordinates: [{ x: 0, y: 0 }, { x: 6, y: 6 }, { x: 6, y: 0 }],
        holes: null,
      },
    ]);
    expect(result).toBe(optimized);
  });
});

describe("cleanPointArray", () => {
  test("it should optimize", () => {
    const result = JSON.stringify(
      cleanPointArray(sampleTriangleShape.coordinates)
    );
    const optimized = JSON.stringify([
      { x: 0, y: 0 },
      { x: 6, y: 6 },
      { x: 6, y: 0 },
    ]);
    expect(result).toBe(optimized);
  });

  test("it should be the same", () => {
    const result = JSON.stringify(
      cleanPointArray(sampleOccupantShape.coordinates)
    );
    const theSame = JSON.stringify(sampleOccupantShape.coordinates);
    expect(result).toBe(theSame);
  });
});

describe("simplifyPolylineRamerDouglasPeucker", () => {
  test("it should optimize but leave duplicates", () => {
    const result = JSON.stringify(
      simplifyPolylineRamerDouglasPeucker(sampleTriangleShape.coordinates)
    );
    const optimized = JSON.stringify([
      { x: 0, y: 0 },
      { x: 6, y: 6 },
      { x: 6, y: 6 },
      { x: 6, y: 0 },
    ]);
    expect(result).toBe(optimized);
  });

  test("it should be the same", () => {
    const result = JSON.stringify(
      simplifyPolylineRamerDouglasPeucker(sampleOccupantShape.coordinates)
    );
    const theSame = JSON.stringify(sampleOccupantShape.coordinates);
    expect(result).toBe(theSame);
  });

  test("it should overoptimize", () => {
    const threshold = 999;
    const result = JSON.stringify(
      simplifyPolylineRamerDouglasPeucker(
        sampleTriangleShape.coordinates,
        threshold
      )
    );
    const overoptimized = JSON.stringify([{ x: 0, y: 0 }, { x: 6, y: 0 }]);
    expect(result).toBe(overoptimized);
  });
});

describe("perpendicularDistanceFromLine", () => {
  test("point should match distance from line", () => {
    expect(
      perpendicularDistanceFromLine(
        { x: 1, y: 1 },
        { x: 0, y: 0 },
        { x: 10, y: 0 }
      )
    ).toBe(1);
    expect(
      perpendicularDistanceFromLine(
        { x: 2, y: 2 },
        { x: 0, y: 0 },
        { x: 0, y: 10 }
      )
    ).toBe(2);
  });
});

describe("areEqualPoints", () => {
  test("it should be valid", () => {
    const p1 = new Point(1, 1);
    const p1bellow = new Point(1.005, 1.005);
    const p1same = new Point(1, 1);
    const p2 = new Point(2, 2);
    const p2obj = { x: 2, y: 2 };
    expect(areEqualPoints(p1, p1)).toBe(true);
    expect(areEqualPoints(p1, p1same)).toBe(true);
    expect(areEqualPoints(p2, p2)).toBe(true);
    expect(areEqualPoints(p2, p2obj)).toBe(true);
    expect(areEqualPoints(p2obj, p2obj)).toBe(true);
    // threshold
    expect(areEqualPoints(p1, p1bellow)).toBe(true);
  });

  test("it should not be valid", () => {
    const p1 = new Point(1, 1);
    const p1above = new Point(1.5, 1.5);
    const p2 = new Point(2, 2);
    const p2obj = { x: 2, y: 2 };
    const badtype = [1, 1];
    const badvalue = { x: 2, y: "BAD" };
    expect(areEqualPoints(p1, p2)).toBe(false);
    expect(areEqualPoints(p1, p2obj)).toBe(false);
    expect(areEqualPoints(p2obj, badtype)).toBe(false);
    expect(areEqualPoints(p2obj, badvalue)).toBe(false);
    // threshold
    expect(areEqualPoints(p1, p1above)).toBe(false);
  });
});

describe("isPathClockwise", () => {
  let clockwiseContourOne;
  let clockwiseContourTwo;
  beforeEach(() => {
    clockwiseContourOne = [
      { x: 1, y: 1 },
      { x: 10, y: 1 },
      { x: 10, y: 10 },
      { x: 1, y: 10 },
    ];

    clockwiseContourTwo = [
      { x: 5, y: 0 },
      { x: 6, y: 4 },
      { x: 4, y: 5 },
      { x: 1, y: 5 },
      { x: 1, y: 0 },
    ];
  });

  it("should return false with null", () => {
    expect(isPathClockwise(null)).toEqual(false);
  });

  it("should return false with 1 point", () => {
    expect(isPathClockwise([{ x: 1, y: 1 }])).toEqual(false);
  });

  it("should return false with 2 points", () => {
    expect(isPathClockwise([{ x: 1, y: 1 }, { x: 10, y: 10 }])).toEqual(false);
  });

  it("should return false with a counter clockwise contour", () => {
    let contour = clockwiseContourOne.reverse();
    expect(isPathClockwise(contour)).toEqual(false);
    contour = clockwiseContourTwo.reverse();
    expect(isPathClockwise(contour)).toEqual(false);
  });

  it("should return true with a clockwise contour", () => {
    expect(isPathClockwise(clockwiseContourOne)).toEqual(true);
    expect(isPathClockwise(clockwiseContourTwo)).toEqual(true);
  });
});

describe("calculatePolygonalAreaFromPoints", () => {
  it("should return 0 for null", () => {
    const result = shapeUtils.calculatePolygonalAreaFromPoints(null);
    expect(result).toEqual(0);
  });

  it("should return 0 for a point", () => {
    const result = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 25.5, y: 39.2 },
    ]);
    expect(result).toEqual(0);
  });

  it("should return 0 for a line", () => {
    const result = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 25.5, y: 39.2 },
      { x: 20, y: 30 },
    ]);
    expect(result).toEqual(0);
  });

  it("should calculate the area of a rectangle", () => {
    const result = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 0 },
    ]);
    expect(result).toEqual(200);
  });

  it("should calculate the area of a closed rectangle the same as an open rectangle", () => {
    const open = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 0 },
    ]);

    // A closed contour is one where the final point is the same as the first.
    const closed = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 0, y: 0 },
      { x: 0, y: 10 },
      { x: 20, y: 10 },
      { x: 20, y: 0 },
      { x: 0, y: 0 },
    ]);

    expect(open).toEqual(200);
    expect(closed).toEqual(open);
  });

  it("should calculate the area of a triangle", () => {
    const result = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 100.5, y: 100.5 },
      { x: 100.5, y: 150.5 },
      { x: 150.5, y: 150.5 },
    ]);
    expect(result).toEqual(1250);
  });

  it("should calculate the area of a irregular polygon", () => {
    /*
      A ______ D
       /      \
      /        \
    B ---------- C
    
    */

    const result = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 10, y: 0 }, // A
      { x: 0, y: 10 }, // B
      { x: 30, y: 10 }, // C
      { x: 20, y: 0 }, // D
    ]);
    expect(result).toEqual(200);
  });

  it("should calculate the area of a concave polygon", () => {
    /*
      A _    _ D
       /|    |\
      / |    | \
     /  F----E  \
    B ---------- C
    
    */

    const result = shapeUtils.calculatePolygonalAreaFromPoints([
      { x: 10, y: 0 }, // A
      { x: 0, y: 10 }, // B
      { x: 30, y: 10 }, // C
      { x: 20, y: 0 }, // D
      { x: 20, y: 5 }, // E
      { x: 10, y: 5 }, // F
    ]);
    expect(result).toEqual(150);
  });
});

describe("shapeToGeoContour", () => {
  it("should convert a simple polygon", () => {
    /*
      A _    _ D
       /|    |\
      / |    | \
     /  F----E  \
    B ---------- C
    
    */

    const shape = {
      isPolygon: true,
      labelPoint: { x: 20, y: 7.5 },
      coordinates: [
        { x: 10, y: 0 }, // A
        { x: 0, y: 10 }, // B
        { x: 30, y: 10 }, // C
        { x: 20, y: 0 }, // D
        { x: 20, y: 5 }, // E
        { x: 10, y: 5 }, // F
      ],
      holes: null,
    };
    const result = shapeUtils.shapeToGeoContour(shape);
    expect(result).toEqual([
      [[10, 0], [0, 10], [30, 10], [20, 0], [20, 5], [10, 5], [10, 0]],
    ]);
  });

  it("should convert a shape with holes", () => {
    const shape = {
      isPolygon: true,
      labelPoint: { x: 20, y: 7.5 },
      coordinates: [
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 30, y: 10 },
        { x: 20, y: 0 },
      ],
      holes: [
        [{ x: 10, y: 2.5 }, { x: 5, y: 7.5 }, { x: 10, y: 7.5 }],
        [
          { x: 11, y: 2.5 },
          { x: 11, y: 7.5 },
          { x: 19, y: 7.5 },
          { x: 19, y: 2.5 },
        ],
      ],
    };
    const result = shapeUtils.shapeToGeoContour(shape);
    expect(result.length).toEqual(3);
    // The outside contour
    expect(result[0]).toEqual([[10, 0], [0, 10], [30, 10], [20, 0], [10, 0]]);

    // First hole
    expect(result[1]).toEqual([[10, 2.5], [10, 7.5], [5, 7.5], [10, 2.5]]);

    // Second hole
    expect(result[2]).toEqual([
      [11, 2.5],
      [19, 2.5],
      [19, 7.5],
      [11, 7.5],
      [11, 2.5],
    ]);
  });
});

describe("shapesToPolyBoolRegions", () => {
  it("should return null with null", () => {
    const result = shapeUtils.shapesToPolyBoolRegions(null);
    expect(result).toEqual(null);
  });

  it("should convert multiple shapes", () => {
    const shapeOne = {
      isPolygon: true,
      labelPoint: { x: 20, y: 7.5 },
      coordinates: [
        { x: 10, y: 0 },
        { x: 0, y: 10 },
        { x: 30, y: 10 },
        { x: 20, y: 0 },
      ],
      holes: [
        [{ x: 10, y: 2.5 }, { x: 5, y: 7.5 }, { x: 10, y: 7.5 }],
        [
          { x: 11, y: 2.5 },
          { x: 11, y: 7.5 },
          { x: 19, y: 7.5 },
          { x: 19, y: 2.5 },
        ],
      ],
    };

    const shapeTwo = {
      isPolygon: true,
      labelPoint: { x: 20, y: 7.5 },
      coordinates: [
        { x: 55, y: 0 },
        { x: 45, y: 10 },
        { x: 95, y: 10 },
        { x: 65, y: 0 },
      ],
      holes: null,
    };
    const result = shapeUtils.shapesToPolyBoolRegions([shapeOne, shapeTwo]);
    expect(result).toEqual([
      [[10, 0], [0, 10], [30, 10], [20, 0], [10, 0]],
      [[10, 2.5], [10, 7.5], [5, 7.5], [10, 2.5]],
      [[11, 2.5], [19, 2.5], [19, 7.5], [11, 7.5], [11, 2.5]],
      [[55, 0], [45, 10], [95, 10], [65, 0], [55, 0]],
    ]);
  });
});

describe("geoContourToShapes", () => {
  it("returns null with null", () => {
    const result = shapeUtils.geoContourToShapes(null);
    expect(result).toEqual(null);
  });

  it("converts a polygon", () => {
    const coordinates = [
      [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
    ];

    const result = shapeUtils.geoContourToShapes(coordinates);
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 100.5, y: 0.5 },
        coordinates: [
          { x: 100, y: 1 },
          { x: 101, y: 1 },
          { x: 101, y: 0 },
          { x: 100, y: 0 },
        ],
        holes: null,
      },
    ]);
  });

  it("converts a polygon with a hole", () => {
    const coordinates = [
      [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
      [[100.8, 0.8], [100.8, 0.2], [100.2, 0.2], [100.2, 0.8], [100.8, 0.8]],
    ];

    const result = shapeUtils.geoContourToShapes(coordinates);
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 100.5, y: 0.5 },
        coordinates: [
          { x: 100, y: 1 },
          { x: 101, y: 1 },
          { x: 101, y: 0 },
          { x: 100, y: 0 },
        ],
        holes: [
          [
            { x: 100.2, y: 0.8 },
            { x: 100.2, y: 0.2 },
            { x: 100.8, y: 0.2 },
            { x: 100.8, y: 0.8 },
          ],
        ],
      },
    ]);
  });

  it("converts a multi-polygon", () => {
    const coordinates = [
      // Shape 1
      [[[102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0]]],

      // Shape 2
      [
        [[100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0]],
        // Holes
        [[100.2, 0.2], [100.2, 0.8], [100.8, 0.8], [100.8, 0.2], [100.2, 0.2]],
      ],
    ];

    const result = shapeUtils.geoContourToShapes(coordinates);
    // expect(result.length).toEqual(2);
    expect(result[0]).toEqual({
      isPolygon: true,
      labelPoint: { x: 102.5, y: 2.5 },
      coordinates: [
        { x: 102, y: 3 },
        { x: 103, y: 3 },
        { x: 103, y: 2 },
        { x: 102, y: 2 },
      ],
      holes: null,
    });
    expect(result[1]).toEqual({
      isPolygon: true,
      labelPoint: { x: 100.5, y: 0.5 },
      coordinates: [
        { x: 100, y: 1 },
        { x: 101, y: 1 },
        { x: 101, y: 0 },
        { x: 100, y: 0 },
      ],
      holes: [
        [
          { x: 100.8, y: 0.2 },
          { x: 100.8, y: 0.8 },
          { x: 100.2, y: 0.8 },
          { x: 100.2, y: 0.2 },
        ],
      ],
    });
  });
});

describe("findCentroid", () => {
  it("returns null with null", () => {
    const result = shapeUtils.findCentroid(null);
    expect(result).toEqual(null);
  });

  it("returns the center point", () => {
    const result = shapeUtils.findCentroid([
      { x: 100, y: 1 },
      { x: 101, y: 1 },
      { x: 101, y: 0 },
      { x: 100, y: 0 },
    ]);
    expect(result).toEqual({ x: 100.5, y: 0.5 });
  });
});

describe("parseCoreShapeCollectionString", () => {
  it("returns null with null", () => {
    const result = shapeUtils.parseCoreShapeCollectionString(null);
    expect(result).toEqual(null);
  });

  it("returns null with an empty string", () => {
    const result = shapeUtils.parseCoreShapeCollectionString("");
    expect(result).toEqual(null);
  });

  it("returns null with a whitespace string", () => {
    const result = shapeUtils.parseCoreShapeCollectionString("   ");
    expect(result).toEqual(null);
  });

  it("parses a point", () => {
    const result = shapeUtils.parseCoreShapeCollectionString("25.48, 91.0");
    expect(result).toEqual([
      {
        isPolygon: false,
        labelPoint: { x: 25.48, y: 91 },
        coordinates: [{ x: 25.48, y: 91 }],
        holes: null,
        hideLabel: false,
      },
    ]);
  });

  it("parses a simple polygon", () => {
    const result = shapeUtils.parseCoreShapeCollectionString(
      "25,25^0,0,25,25|0,25,25,0"
    );
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 37.5, y: 37.5 },
        coordinates: [
          { x: 25, y: 25 },
          { x: 25, y: 50 },
          { x: 50, y: 50 },
          { x: 50, y: 25 },
        ],
        holes: null,
        hideLabel: false,
      },
    ]);
  });

  it("parses a multiple polygons", () => {
    const result = shapeUtils.parseCoreShapeCollectionString(
      "25,25^0,0,25,25|0,25,25,0#0,0^10,10,20,20|10,20,20,10"
    );
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 37.5, y: 37.5 },
        coordinates: [
          { x: 25, y: 25 },
          { x: 25, y: 50 },
          { x: 50, y: 50 },
          { x: 50, y: 25 },
        ],
        holes: null,
        hideLabel: false,
      },
      {
        isPolygon: true,
        labelPoint: { x: 15, y: 15 },
        coordinates: [
          { x: 10, y: 10 },
          { x: 10, y: 20 },
          { x: 20, y: 20 },
          { x: 20, y: 10 },
        ],
        holes: null,
        hideLabel: false,
      },
    ]);
  });

  it("parses a multiple polygons with holes", () => {
    const result = shapeUtils.parseCoreShapeCollectionString(
      "25,25^0,0,25,25|0,25,25,0#0,0^10,10,20,20|10,20,20,10h14,14,16|14,16,16"
    );
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 37.5, y: 37.5 },
        coordinates: [
          { x: 25, y: 25 },
          { x: 25, y: 50 },
          { x: 50, y: 50 },
          { x: 50, y: 25 },
        ],
        holes: null,
        hideLabel: false,
      },
      {
        isPolygon: true,
        labelPoint: { x: 15, y: 15 },
        coordinates: [
          { x: 10, y: 10 },
          { x: 10, y: 20 },
          { x: 20, y: 20 },
          { x: 20, y: 10 },
        ],
        holes: [[{ x: 14, y: 14 }, { x: 14, y: 16 }, { x: 16, y: 16 }]],
        hideLabel: false,
      },
    ]);
  });

  it("parses a polygons with a label point", () => {
    const result = shapeUtils.parseCoreShapeCollectionString(
      "25,25^0,0,25,25|0,25,25,0$30,40"
    );
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 30, y: 40 },
        coordinates: [
          { x: 25, y: 25 },
          { x: 25, y: 50 },
          { x: 50, y: 50 },
          { x: 50, y: 25 },
        ],
        holes: null,
        hideLabel: false,
      },
    ]);
  });

  it("parses a polygons with the hide label flag", () => {
    const result = shapeUtils.parseCoreShapeCollectionString(
      "25,25^0,0,25,25|0,25,25,0x"
    );
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 37.5, y: 37.5 },
        coordinates: [
          { x: 25, y: 25 },
          { x: 25, y: 50 },
          { x: 50, y: 50 },
          { x: 50, y: 25 },
        ],
        holes: null,
        hideLabel: true,
      },
    ]);
  });

  it("throws an error without an origin", () => {
    let error = null;
    try {
      shapeUtils.parseCoreShapeCollectionString("^0,0,1|0,1,0");
    } catch (err) {
      error = err;
    }
    expect(error).toEqual({
      message: "Error parsing core shape string: A shape must have an origin.",
    });

    error = null;
    try {
      shapeUtils.parseCoreShapeCollectionString("sdfsdf");
    } catch (err) {
      error = err;
    }
    expect(error).toEqual({
      message: "Error parsing core shape string: A shape must have an origin.",
    });
  });
});

describe("parseShapeCollectionString", () => {
  it("returns null with null", () => {
    const result = shapeUtils.parseShapeCollectionString(null);
    expect(result).toEqual(null);
  });

  it("returns null with an empty string", () => {
    const result = shapeUtils.parseShapeCollectionString("");
    expect(result).toEqual(null);
  });

  it("parses a core string", () => {
    const result = shapeUtils.parseCoreShapeCollectionString(
      "25,25^0,0,25,25|0,25,25,0"
    );
    expect(result).toEqual([
      {
        isPolygon: true,
        labelPoint: { x: 37.5, y: 37.5 },
        coordinates: [
          { x: 25, y: 25 },
          { x: 25, y: 50 },
          { x: 50, y: 50 },
          { x: 50, y: 25 },
        ],
        holes: null,
        hideLabel: false,
      },
    ]);
  });

  describe("parses json", () => {
    it("throws an error without coordinates", () => {
      let error = null;
      try {
        shapeUtils.parseShapeCollectionString("{}");
      } catch (err) {
        error = err;
      }
      expect(error).toEqual({ message: "A shape must have coordinates." });
    });

    it("throws an error with a line", () => {
      let error = null;
      try {
        shapeUtils.parseShapeCollectionString(
          '{ "coordinates": [{ "x": 1, "y": 1 }, { "x": 2, "y": 2 }] }'
        );
      } catch (err) {
        error = err;
      }
      expect(error).toEqual({
        message:
          "A shape must have 1 or greater than 2 coordinates (i.e. no lines).",
      });
    });

    it("parses a point with just coordinates", () => {
      const result = shapeUtils.parseShapeCollectionString(`
      {
        "coordinates": [{"x": 1, "y": 2}]
      }
      `);
      expect(result).toEqual([
        {
          isPolygon: false,
          labelPoint: { x: 1, y: 2 },
          coordinates: [{ x: 1, y: 2 }],
          holes: null,
          hideLabel: false,
        },
      ]);
    });

    it("parses a polygon with a hole", () => {
      const result = shapeUtils.parseShapeCollectionString(`
      {
        "coordinates": [{"x": 0, "y": 0}, {"x": 0, "y": 10}, {"x": 10, "y": 10}, {"x": 10, "y": 0}],
        "holes": [[{"x": 1, "y": 1}, {"x": 1, "y": 9}, {"x": 9, "y": 9}, {"x": 9, "y": 1}]]
      }
      `);
      expect(result).toEqual([
        {
          isPolygon: true,
          labelPoint: { x: 5, y: 5 },
          coordinates: [
            { x: 0, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 10 },
            { x: 10, y: 0 },
          ],
          holes: [
            [{ x: 1, y: 1 }, { x: 1, y: 9 }, { x: 9, y: 9 }, { x: 9, y: 1 }],
          ],
          hideLabel: false,
        },
      ]);
    });

    it("parses a non-quote keyed string", () => {
      const result = shapeUtils.parseShapeCollectionString(`
      {
        labelPoint: { x: 0.5, y: 0.75 },
        coordinates: [{x: 0, y: 0}, {x: 0, y: 10}, {x: 10, y: 10}, {x: 10, y: 0}],
        holes: [[{x: 1, y: 1}, {x: 1, y: 9}, {x: 9, y: 9}, {x: 9, y: 1}]]
      }
      `);
      expect(result).toEqual([
        {
          isPolygon: true,
          labelPoint: { x: 0.5, y: 0.75 },
          coordinates: [
            { x: 0, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 10 },
            { x: 10, y: 0 },
          ],
          holes: [
            [{ x: 1, y: 1 }, { x: 1, y: 9 }, { x: 9, y: 9 }, { x: 9, y: 1 }],
          ],
          hideLabel: false,
        },
      ]);
    });
  });
});

describe("contourContainsPoint", () => {
  it("returns false with null", () => {
    const result = shapeUtils.contourContainsPoint(null, 25, 50);
    expect(result).toEqual(false);
  });

  it("returns false with an empty array", () => {
    const result = shapeUtils.contourContainsPoint([], 25, 50);
    expect(result).toEqual(false);
  });

  it("returns false with a point", () => {
    const result = shapeUtils.contourContainsPoint([{ x: 25, y: 50 }], 25, 50);
    expect(result).toEqual(false);
  });

  it("returns false with a line", () => {
    const result = shapeUtils.contourContainsPoint(
      [{ x: 25, y: 50 }, { x: 30, y: 50 }],
      25,
      50
    );
    expect(result).toEqual(false);
  });

  it("returns false with a point outside the contour", () => {
    const contour = [
      { x: 100, y: 300 },
      { x: 200, y: 300 },
      { x: 200, y: 200 },
      { x: 100, y: 200 },
    ];
    let result = shapeUtils.contourContainsPoint(contour, 25, 50);
    expect(result).toEqual(false);

    result = shapeUtils.contourContainsPoint(contour, 99, 25);
    expect(result).toEqual(false);
  });

  it("returns true with a point inside the contour", () => {
    const contour = [
      { x: 100, y: 300 },
      { x: 200, y: 300 },
      { x: 200, y: 200 },
      { x: 100, y: 200 },
    ];
    let result = shapeUtils.contourContainsPoint(contour, 150, 250);
    expect(result).toEqual(true);

    result = shapeUtils.contourContainsPoint(contour, 101, 299);
    expect(result).toEqual(true);
  });
});

describe("shapesContainsPoint", () => {
  it("returns false with null", () => {
    const result = shapeUtils.shapesContainsPoint(null, 25, 50);
    expect(result).toEqual(false);
  });

  it("returns false with an empty array", () => {
    const result = shapeUtils.shapesContainsPoint([], 25, 50);
    expect(result).toEqual(false);
  });

  it("returns false with a point", () => {
    const shape = {
      isPolygon: false,
      labelPoint: { x: 25, y: 50 },
      coordinates: [{ x: 25, y: 50 }],
      holes: null,
    };

    let result = shapeUtils.shapesContainsPoint(shape, 25, 50);
    expect(result).toEqual(false);

    result = shapeUtils.shapesContainsPoint([shape], 25, 50);
    expect(result).toEqual(false);
  });

  it("returns false with a point outside the shapes", () => {
    const shapeOne = {
      isPolygon: true,
      coordinates: [
        { x: 100, y: 300 },
        { x: 200, y: 300 },
        { x: 200, y: 200 },
        { x: 100, y: 200 },
      ],
      holes: null,
    };

    const shapeTwo = {
      isPolygon: true,
      coordinates: [
        { x: 300, y: 300 },
        { x: 400, y: 300 },
        { x: 400, y: 200 },
        { x: 300, y: 200 },
      ],
      holes: [
        [
          { x: 310, y: 290 },
          { x: 390, y: 290 },
          { x: 390, y: 210 },
          { x: 310, y: 210 },
        ],
      ],
    };

    let result = shapeUtils.shapesContainsPoint([shapeOne, shapeTwo], 25, 50);
    expect(result).toEqual(false);

    // In the hole of the 2nd shape
    result = shapeUtils.shapesContainsPoint([shapeOne, shapeTwo], 350, 250);
    expect(result).toEqual(false);
  });

  it("returns true with a point inside the contour", () => {
    const shapeOne = {
      isPolygon: true,
      coordinates: [
        { x: 100, y: 300 },
        { x: 200, y: 300 },
        { x: 200, y: 200 },
        { x: 100, y: 200 },
      ],
      holes: null,
    };

    const shapeTwo = {
      isPolygon: true,
      coordinates: [
        { x: 300, y: 300 },
        { x: 400, y: 300 },
        { x: 400, y: 200 },
        { x: 300, y: 200 },
      ],
      holes: [
        [
          { x: 310, y: 290 },
          { x: 390, y: 290 },
          { x: 390, y: 210 },
          { x: 310, y: 210 },
        ],
      ],
    };

    // In the 1st shape
    let result = shapeUtils.shapesContainsPoint([shapeOne, shapeTwo], 105, 205);
    expect(result).toEqual(true);

    // In the 2nd shape
    result = shapeUtils.shapesContainsPoint([shapeOne, shapeTwo], 305, 205);
    expect(result).toEqual(true);
  });
});
