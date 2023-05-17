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

function addVector(p1, p2) {
    return {x: p1.x + p2.x, y: p1.y + p2.y, z: p1.z + p2.z};
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

function draw(pointToLook, cameraPosition) {
    let imagePos = 0;
    const hMiddle = Math.floor(height / 2);
    const wMiddle = Math.floor(width / 2);

    // calculate camera direction vector
    let directionVector = subVector(pointToLook, cameraPosition);

    // parametrize camera direction vector
    const directionVectorDist = distance(directionVector);
    const distanceToLook = 20;
    directionVector = mulScalarVector(distanceToLook / directionVectorDist, directionVector);

    // calculate translation vectors
    const upVector = {x: 0, y: 1, z: 0};
    let translationX = crossProductVector(upVector, directionVector);
    let translationY = crossProductVector(translationX, directionVector);

    // parametrize the translation vectors
    translationX = mulScalarVector(0.7, translationX)
    const ratio = distance(translationY) / distance(translationX)
    translationY = mulScalarVector(1 / ratio, translationY);

    for (let i = 0; i < height; i++) {
        // pixel movement from the center of vision in the Y
        const sh = i - hMiddle;
        for (let j = 0; j < width; j++) {
            // pixel movement from the center of vision in the X
            const sw = j - wMiddle;

            // default background color
            let pixelColor = {r: 242, g: 241, b: 241, a: 255};
            let minDistance = 9999999;
            // iterate over the faces to check if they are visible in the current pixel
            for (let i1 = 0; i1 < faces.length; i1++) {
                // get face points list
                let face = faces[i1].points;
                // calculate point in the camera to look at the point to look
                const rayPosition = addVector(addVector(pointToLook, mulScalarVector(sw / wMiddle, translationX)), mulScalarVector(sh / hMiddle, translationY));
                // calculate the projection point of the ray over the current object
                const projection = projectionInPlane(face, cameraPosition, subVector(rayPosition, cameraPosition));
                // if ray collide with face and is the closer face
                if (projection.collide && minDistance > projection.distance) {
                    minDistance = projection.distance;
                    pixelColor = faces[i1].color;
                    if (projection.isBorder) {
                        pixelColor = faces[i1].borderColor;
                    }
                }
            }

            // paint pixel
            image.data[imagePos] = pixelColor.r;
            image.data[imagePos + 1] = pixelColor.g;
            image.data[imagePos + 2] = pixelColor.b;
            image.data[imagePos + 3] = pixelColor.a;
            imagePos += 4;
        }
    }
    ctx.putImageData(image, 0, 0);
}

// camera position and point to look with the camera
let cameraPosition = {x: 15, y: 15, z: 15};
const pointToLook = {x: 0, y: 5, z: 0};

function rotateCameraOverYAxis() {
    // angle to rotate
    const angle = Math.PI / 30;
    // calculate new camera position after rotation
    cameraPosition = {
        x: cameraPosition.x * Math.cos(angle) + cameraPosition.z * Math.sin(angle),
        y: cameraPosition.y,
        z: -cameraPosition.x * Math.sin(angle) + cameraPosition.z * Math.cos(angle)
    };
}

let lastTime = 0;
// force to render no more than 30 frame per second
const intervalPerSecond = 1000 / 30;
// defining loop to render
function loop(currentTime) {
    if (intervalPerSecond <= currentTime - lastTime) {
        lastTime = currentTime;
        rotateCameraOverYAxis();
        draw(pointToLook, cameraPosition);
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
