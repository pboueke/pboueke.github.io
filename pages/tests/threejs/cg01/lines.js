/*global THREE, scene, window, document, requestAnimationFrame, console*/
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ alpha: true });
var controls = new THREE.OrbitControls(camera, document, renderer.domElement);
//var controls = new THREE.TrackballControls( camera, document, renderer.domElement );

renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var random_color = function () {
    "use strict";
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

var factorial = function (a) {
    "use strict";
    var x = 1,
        f = 1;
    while (x <= a) {
        f *= x;
        x += 1;
    }
    return f;
};

var combination = function (a, n) {
    "use strict";
    return factorial(a) / (factorial(n) * factorial(a - n));
};

function Lines() {
    "use strict";
    this.points = [];
    this.intersections = [];
}

Lines.prototype.getLineParameters = function (arr) {
    // arr = [[x1, y1], [x2, y2]]
    // y = a * x + b
    "use strict";
    var ans = [];
    ans[0] = (arr[0][1] - arr[1][1]) / (arr[0][0] - arr[1][0]); //a
    ans[1] = arr[0][1] - arr[0][0] * ans[0]; //b
    return ans;
};

Lines.prototype.intersection = function (arr) {
    //arr = [[[x1, y1], [x2, y2]], [[x1, y1], [x2, y2]]]
    //       [      line1       ], [       line2      ]
    "use strict";
    var l1 = [],
        l2 = [],
        ans = [];
    l1 = this.getLineParameters(arr[0]);
    l2 = this.getLineParameters(arr[1]);
    ans[0] = (l2[1] - l1[1]) / (l1[0] - l2[0]); //x
    ans[1] = ans[0] * l1[0] + l1[1];
    return ans;
};

Lines.prototype.addLine = function (arr) {
    // Uses arr [[x1, y1], [x2, y2]] to add the line formed by this points to Lines
    "use strict";
    this.points.push(arr);
};

Lines.prototype.drawLines = function () {
    "use strict";
    var material = [],
        geometry = [],
        line = [],
        iterator;
    for (iterator = 0; iterator < this.points.length; iterator += 1) {
        material[iterator] = new THREE.LineBasicMaterial({
            color: random_color()
        });
        geometry[iterator] = new THREE.Geometry();
        geometry[iterator].vertices.push(
            new THREE.Vector3(this.points[iterator][0][0], this.points[iterator][0][1], 0),
            new THREE.Vector3(this.points[iterator][1][0], this.points[iterator][1][1], 0)
        );
        line[iterator] = new THREE.Line(geometry[iterator], material[iterator]);
        scene.add(line[iterator]);
    }
};

Lines.prototype.drawIntersections = function () {
    "use strict";
    var material = [],
        geometry = [],
        sphere = [],
        position = [],
        radius = 5,
        segments = 16,
        rings = 16,
        iterator = 1, //parses columns
        jterator = 0, //parses rows
        kterator = 2, //reset iterator to new value
        current = 0;
    while (jterator < this.points.length - 1) {
        geometry[current] = new THREE.SphereGeometry(radius, segments, rings);
        material[current] = new THREE.MeshBasicMaterial({
            color: random_color()
        });
        sphere[current] = new THREE.Mesh(geometry[current], material[current]);
        position[current] = this.intersection([this.points[jterator], this.points[iterator]]);
        this.intersections[current] = position[current];
        sphere[current].position.x = position[current][0];
        sphere[current].position.y = position[current][1];
        sphere[current].position.z = 0;
        scene.add(sphere[current]);
        if (iterator === this.points.length - 1) {
            iterator = kterator;
            jterator += 1;
            kterator += 1;
        } else {
            iterator += 1;
        }
        current += 1;
    }
};


Lines.prototype.centerPosition = function () {
    'use strict';
    var xm = 0,
        ym = 0,
        ans = [],
        iterator;
    for (iterator = 0; iterator < this.intersections.length; iterator += 1) {
        xm += this.intersections[iterator][0];
        ym += this.intersections[iterator][1];
    }
    ans[0] = xm / iterator;
    ans[1] = ym / iterator;
    return ans;

};


var L = new Lines();
L.addLine([[100, 100], [200, 200]]);
L.addLine([[100, 200], [200, 100]]);
L.addLine([[50, 150], [400, 50]]);
L.drawLines();
L.drawIntersections();
var cpos = L.centerPosition();
camera.position.x = cpos[0];
camera.position.y = cpos[1];
camera.position.z = 100;
console.log(new THREE.Vector3(cpos[0], cpos[1], 0));
controls.target = new THREE.Vector3(cpos[0], cpos[1], 0);

camera.rotation.order = 'YXZ';


var render = function () {
    "use strict";
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

render();
