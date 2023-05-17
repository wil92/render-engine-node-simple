// image dimension
const width = 500, height = 250;

// get canvas object from object tree
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// set the canvas dimension
canvas.width = width;
canvas.height = height;

// utils funcitons
function mulVector(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y + p1.z * p2.z;
}
function subVector(p1, p2) {
    return {x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z};
}
function mulScalarVector(scalar, p) {
    return {x: scalar * p.x, y: scalar * p.y, z: scalar * p.z};
}
function crossProductVector(v1, v2) {
    return {
        x: v1.y * v2.z - v1.z * v2.y,
        y: v1.z * v2.x - v1.x * v2.z,
        z: v1.x * v2.y - v1.y * v2.x
    }
}
function distance(v) {
    return Math.sqrt((v.x * v.x) + (v.y * v.y) + (v.z * v.z));
}
function compareWithError(v1, v2, error = 0.005) {
    return Math.abs(v1 - v2) <= error;
}
function projectionInPlane(plane, point, direction) {
    const p_01 = subVector(plane[1], plane[0]);
    const p_02 = subVector(plane[2], plane[0]);
    const k_ab = mulScalarVector(5000, direction);

    const crossProd = crossProductVector(p_01, p_02);
    const n = mulVector(crossProd, subVector(point, plane[0]));
    const d = mulVector(crossProd, mulScalarVector(-1, k_ab));

    const result = {collide: false, distance: null, isBorder: false};
    if (d !== 0) {
        const t = n / d;
        const distanceVector = mulScalarVector(t, k_ab);
        const u = mulVector(crossProductVector(p_02, mulScalarVector(-1, k_ab)), subVector(point, plane[0])) / d;
        const v = mulVector(crossProductVector(mulScalarVector(-1, k_ab), p_01), subVector(point, plane[0])) / d;

        result.collide = t >= 0 && t <= 1 && u + v <= 1 && v >= 0 && v <= 1 && u >= 0 && u <= 1;
        result.distance = distance(distanceVector);

        if (result.collide && (compareWithError(u, 0) || compareWithError(v, 0) || compareWithError(u + v, 1))) {
            result.isBorder = true;
        }
    }

    return result;
}

let a = 0;
function print(msg) {
    if (a < 100) {
        console.log(msg);
    }
    a++;
}

// this function prepare the object face that will be used by the render
function createFace(points, color, borderColor = {r: 0, g: 0, b: 0, a: 255}) {
    return {points, color, borderColor};
}

// represent the object that will be rendered
const faces = [
    // figure
    createFace([{x: 5, y: 5, z: 0}, {x: 0, y: 10, z: 0}, {x: 0, y: 5, z: 5}], {r: 255, g: 0, b: 0, a: 255}),
    createFace([{x: -5, y: 5, z: 0}, {x: 0, y: 10, z: 0}, {x: 0, y: 5, z: 5}], {r: 255, g: 0, b: 0, a: 255}),
    createFace([{x: -5, y: 5, z: 0}, {x: 0, y: 10, z: 0}, {x: 0, y: 5, z: -5}], {r: 255, g: 0, b: 0, a: 255}),
    createFace([{x: 5, y: 5, z: 0}, {x: 0, y: 10, z: 0}, {x: 0, y: 5, z: -5}], {r: 255, g: 0, b: 0, a: 255}),
    createFace([{x: 5, y: 5, z: 0}, {x: 0, y: 0, z: 0}, {x: 0, y: 5, z: 5}], {r: 255, g: 0, b: 0, a: 255}),
    createFace([{x: -5, y: 5, z: 0}, {x: 0, y: 0, z: 0}, {x: 0, y: 5, z: 5}], {r: 255, g: 0, b: 0, a: 255}),
    createFace([{x: -5, y: 5, z: 0}, {x: 0, y: 0, z: 0}, {x: 0, y: 5, z: -5}], {r: 255, g: 0, b: 0, a: 255}),
    createFace([{x: 5, y: 5, z: 0}, {x: 0, y: 0, z: 0}, {x: 0, y: 5, z: -5}], {r: 255, g: 0, b: 0, a: 255}),

    // terrain
    createFace([{x: 10, y: 0, z: 0}, {x: 0, y: 0, z: 10}, {x: 0, y: 0, z: -10}], {r: 0, g: 255, b: 255, a: 255}),
    createFace([{x: -10, y: 0, z: 0}, {x: 0, y: 0, z: 10}, {x: 0, y: 0, z: -10}], {r: 0, g: 255, b: 255, a: 255}),
];

// image to paint the render result
const image = ctx.getImageData(0, 0, width, height);

function draw() {
    let imagePos = 0;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            image.data[imagePos] = 255;
            image.data[imagePos + 1] = 0;
            image.data[imagePos + 2] = 0;
            image.data[imagePos + 3] = 255;
            imagePos += 4;
        }
    }
    ctx.putImageData(image, 0, 0);
}

// defining loop to render
let lastTime = 0;
const intervalPerSecond = 1000 / 30; // force to render no more than 30 frame per second
function loop(currentTime) {
    if (intervalPerSecond <= currentTime - lastTime) {
        lastTime = currentTime;
        draw();
    }
    print('asdfasdf')
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
