/*global THREE, scene, window, document, requestAnimationFrame, console*/
/*jslint continue:true*/
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
    this.lines = [];
    this.spheres = [];
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

Lines.prototype.parseLineText = function (string) {
    //string format: "(line1), ..., (lineN)" = "[(x11, y11), (x12, y12)], ..., [(xN1, yN1), (xN2, yN2)]"
    "use strict";
    var iterator,
        points = ["", "", "", ""], //x1, y1, x2, y2
        next,
        counter = 0;
    this.points = [];
    for (iterator = 0; iterator < string.length; iterator += 1) {
        if (string[iterator] === " ") {
            continue;
        }
        if (string[iterator] === ",") {
            next = true;
            counter += 1;
            continue;
        }
        if (string[iterator] === "(") {
            next = true;
            continue;
        }
        if (string[iterator] === ")") {
            next = false;
            continue;
        }
        if (string[iterator] === ";") {
            this.addLine([[parseInt(points[0], 10), parseInt(points[1], 10)], [parseInt(points[2], 10), parseInt(points[3], 10)]]);
            points = ["", "", "", ""];
            counter = 0;
            continue;
        }
        if (next) {
            points[counter] = points[counter].concat(String(string[iterator]));
        }
    }
};

Lines.prototype.drawLines = function () {
    "use strict";
    var material = [],
        geometry = [],
        iterator;
    for (iterator = 0; iterator < this.lines.length; iterator += 1) {
        scene.remove(this.lines[iterator]);
    }
    this.lines = [];
    for (iterator = 0; iterator < this.points.length; iterator += 1) {
        material[iterator] = new THREE.LineBasicMaterial({
            color: random_color()
        });
        geometry[iterator] = new THREE.Geometry();
        geometry[iterator].vertices.push(
            new THREE.Vector3(this.points[iterator][0][0], this.points[iterator][0][1], 0),
            new THREE.Vector3(this.points[iterator][1][0], this.points[iterator][1][1], 0)
        );
        this.lines[iterator] = new THREE.Line(geometry[iterator], material[iterator]);
        scene.add(this.lines[iterator]);
    }
};

Lines.prototype.drawIntersections = function () {
    "use strict";
    var material = [],
        geometry = [],
        position = [],
        intersec,
        maxx,
        minx,
        maxy,
        miny,
        radius = 5,
        segments = 16,
        rings = 16,
        iterator = 0, //parses columns
        jterator = 0, //parses rows
        kterator = 2, //reset iterator to new value
        current = 0;
    for (iterator = 0; iterator < this.spheres.length; iterator += 1) {
        scene.remove(this.spheres[iterator]);
    }
    this.spheres = [];
    iterator = 1;
    while (jterator < this.points.length - 1) {
        intersec = this.intersection([this.points[jterator], this.points[iterator]]);
        maxx = Math.max(this.points[jterator][0][0], this.points[iterator][1][0]);
        minx = Math.min(this.points[jterator][0][0], this.points[iterator][1][0]);
        maxy = Math.max(this.points[jterator][0][1], this.points[iterator][1][1]);
        miny = Math.min(this.points[jterator][0][1], this.points[iterator][1][1]);
        if ((intersec[0] < maxx && intersec[0] > minx) || (intersec[1] < maxy && intersec[1] > miny)) {
            geometry[current] = new THREE.SphereGeometry(radius, segments, rings);
            material[current] = new THREE.MeshBasicMaterial({
                color: random_color(),
                transparent: true,
                opacity: 0.5
            });
            this.spheres[current] = new THREE.Mesh(geometry[current], material[current]);
            position[current] = intersec;
            this.intersections[current] = position[current];
            this.spheres[current].position.x = position[current][0];
            this.spheres[current].position.y = position[current][1];
            this.spheres[current].position.z = 0;
            scene.add(this.spheres[current]);
        }
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

Lines.prototype.update = function (z) {
    "use strict";
    this.drawLines();
    this.drawIntersections();
    var cpos = this.centerPosition();
    camera.position.z = z;
    controls.target = new THREE.Vector3(cpos[0], cpos[1], 0);
};

var render = function () {
    "use strict";
    requestAnimationFrame(render);
    renderer.render(scene, camera);
};

render();
