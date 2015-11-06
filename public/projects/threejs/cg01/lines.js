/*
Copyright (c) 2015 Pedro Holllanda Boueke {p h b o u e k e 'at' p o l i . u f r j . b r}

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE
*/

//jslint config
/*global THREE, scene, window, document, requestAnimationFrame, console*/
/*jslint continue:true white:true, sloppy:true, browser:true*/

//global
var zdistance = 100;  //distance between camera and XY plane
var viewSize = 300;   //orthogonal camera view size
var aspectRatio = window.innerWidth / window.innerHeight;
var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-aspectRatio * viewSize / 2, aspectRatio * viewSize / 2, 0, viewSize);
//var camera = new THREE.PerspectiveCamera(120, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ alpha: true });
var raycaster = new THREE.Raycaster();
//var controls = new THREE.OrbitControls(camera, document, renderer.domElement);
//var controls = new THREE.TrackballControls( camera, document, renderer.domElement );
var mouse = new THREE.Vector2(), INTERSECTED, INTERSECTED_COLOR, PRESSING, PRESSABLE;

//init
INTERSECTED = "";
PRESSING = false;
PRESSABLE = false;
renderer.setClearColor(0xffffff, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = false;
document.body.appendChild(renderer.domElement);

var random_color = function () {
    //returns random color in hex code
    "use strict";
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
};

function Lines() {
    //main class that store and operate the lines
    "use strict";
    this.points = [];           //two points per line    [[[x1,y1],[x2,y2]]]
    this.intersections = [];    //intersection positions [[x,y]]
    this.lines = [];            //threejs line objects   [line]
    this.handles = [];          //threejs line objects   [[handle0, handle1]]
    this.spheres = [];          //threejs line objects   [sphere]
    this.line_colors = [];                           //  [hex]
    this.intersection_colors = [];                   //  [hex]
}

Lines.prototype.getLineParameters = function (arr) {
    // arr = [[x1, y1], [x2, y2]]
    // y = a * x + b
    //Note: javascript allows us not to worry about parallel lines an other exceptions
    //thanks to the way it handles infinity.
    "use strict";
    var ans = [];
    ans[0] = (arr[0][1] - arr[1][1]) / (arr[0][0] - arr[1][0]); //a
    ans[1] = arr[0][1] - arr[0][0] * ans[0]; //b
    return ans;
};

Lines.prototype.intersection = function (arr) {
    //arr = [[[x1, y1], [x2, y2]], [[x1, y1], [x2, y2]]]
    //       [      line1       ], [       line2      ]
    //Returns the point where both lines meet (including infinity).
    "use strict";
    var l1 = [],
        l2 = [],
        ans = [];
    l1 = this.getLineParameters(arr[0]);
    l2 = this.getLineParameters(arr[1]);
    ans[0] = (l2[1] - l1[1]) / (l1[0] - l2[0]); //x
    ans[1] = ans[0] * l1[0] + l1[1];  //y
    return ans;
};

Lines.prototype.addLine = function (arr) {
    // Uses arr [[x1, y1], [x2, y2]] to add the line formed by this points to Lines
    "use strict";
    this.points.push(arr);
};

Lines.prototype.parseLineText = function (string) {
    //string format: "(line1), ..., (lineN)" = "[(x11, y11), (x12, y12)], ..., [(xN1, yN1), (xN2, yN2)]"
    //Read string and add points to Lines object
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

Lines.prototype.getLineText = function () {
    //return a string that represents the points array
    "use strict";
    var iterator,
        string = "";
    for (iterator = 0; iterator < this.points.length; iterator += 1) {
        string = string.concat("[(");
        string = string.concat(Math.floor(this.points[iterator][0][0]));
        string = string.concat(", ");
        string = string.concat(Math.floor(this.points[iterator][0][1]));
        string = string.concat("), (");
        string = string.concat(Math.floor(this.points[iterator][1][0]));
        string = string.concat(", ");
        string = string.concat(Math.floor(this.points[iterator][1][1]));
        string = string.concat(")]; ");
    }
    return string;
};

Lines.prototype.drawLines = function () {
    //add line elements to scene
    "use strict";
    var material = [],
        geometry = [],
        handle_material = [],
        handle_geometry = [],
        handle_radius = 7,
        handle_segments = 1,
        handle_rings = 1,
        iterator;
    //only generate colors once
    if (this.line_colors.length === 0) {
        for (iterator = 0; iterator < this.points.length; iterator += 1) {
            this.line_colors[iterator] = random_color();
        }
    }
    //clean scene
    for (iterator = 0; iterator < this.lines.length; iterator += 1) {
        scene.remove(this.lines[iterator]);
    }
    if (this.handles.length !== 0) {
        for (iterator = 0; iterator < this.lines.length; iterator += 1) {
            scene.remove(this.handles[iterator][0]);
            scene.remove(this.handles[iterator][1]);
            delete this.handles[iterator];
        }
    }
    this.lines = [];
    this.handles = [];
    //two handles per line
    for (iterator = 0; iterator < this.points.length; iterator += 1) {
        this.handles.push([]);
    }
    //add lines to scene
    for (iterator = 0; iterator < this.points.length; iterator += 1) {
        //creating line
        material[iterator] = new THREE.LineBasicMaterial({
            color: this.line_colors[iterator]
        });
        geometry[iterator] = new THREE.Geometry();
        geometry[iterator].vertices.push(
            new THREE.Vector3(this.points[iterator][0][0], this.points[iterator][0][1], 0),
            new THREE.Vector3(this.points[iterator][1][0], this.points[iterator][1][1], 0)
        );
        this.lines[iterator] = new THREE.Line(geometry[iterator], material[iterator]);
        this.lines[iterator].name = "line".concat(iterator.toString());
        //creating handles
        handle_geometry[iterator] = new THREE.SphereGeometry(handle_radius, handle_segments, handle_rings);
        handle_material[iterator] = new THREE.MeshBasicMaterial({
            color: this.line_colors[iterator]
        });
        this.handles[iterator][0] = new THREE.Mesh(handle_geometry[iterator], handle_material[iterator]);
        this.handles[iterator][0].position.x = this.points[iterator][0][0];
        this.handles[iterator][0].position.y = this.points[iterator][0][1];
        this.handles[iterator][0].position.z = 5;
        this.handles[iterator][0].rotation.z += Math.PI;
        this.handles[iterator][0].name = "handle0line".concat(iterator.toString());
        this.handles[iterator][1] = new THREE.Mesh(handle_geometry[iterator], handle_material[iterator]);
        this.handles[iterator][1].position.x = this.points[iterator][1][0];
        this.handles[iterator][1].position.y = this.points[iterator][1][1];
        this.handles[iterator][1].position.z = 5;
        this.handles[iterator][1].name = "handle1line".concat(iterator.toString());
        //adding
        scene.add(this.lines[iterator]);
        scene.add(this.handles[iterator][0]);
        scene.add(this.handles[iterator][1]);
    }
};

Lines.prototype.drawIntersections = function () {
    //add intersections as spheres to scene
    "use strict";
    var material = [],
        geometry = [],
        position = [],
        intersec,
        //max and min variables store the limits of each line
        //e: maxx1 stores the maximum x value between the points that form the line 1
        /*ignore:true */
        maxx1, minx1, maxy1, miny1, maxx2, minx2, maxy2, miny2,
        /*ignore:false */
        radius = 5,
        segments = 16,
        rings = 16,
        iterator,
        jterator = 0, //parses rows
        kterator = 2, //reset iterator to new value
        current = 0;
    for (iterator = 0; iterator < this.spheres.length; iterator += 1) {
        scene.remove(this.spheres[iterator]);
    }
    this.spheres = [];
    iterator = 1; //parses columns
    //iterator, jterator and kterator are used to create a combination that iterates
    //the current index trought every existing intersection
    while (jterator < this.points.length - 1) {
        //generate colors only once
        if (this.intersection_colors[jterator] in window) {
            this.intersection_colors[jterator] = random_color();
        }
        intersec = this.intersection([this.points[jterator], this.points[iterator]]);
        maxx1 = Math.max(this.points[jterator][0][0], this.points[jterator][1][0]);
        minx1 = Math.min(this.points[jterator][0][0], this.points[jterator][1][0]);
        maxy1 = Math.max(this.points[jterator][0][1], this.points[jterator][1][1]);
        miny1 = Math.min(this.points[jterator][0][1], this.points[jterator][1][1]);
        maxx2 = Math.max(this.points[iterator][0][0], this.points[iterator][1][0]);
        minx2 = Math.min(this.points[iterator][0][0], this.points[iterator][1][0]);
        maxy2 = Math.max(this.points[iterator][0][1], this.points[iterator][1][1]);
        miny2 = Math.min(this.points[iterator][0][1], this.points[iterator][1][1]);
        //if the current intersect belong to both lines segments and line equations
        if (((intersec[0] < maxx1 && intersec[0] > minx1) || (intersec[1] < maxy1 && intersec[1] > miny1)) &&
                ((intersec[0] < maxx2 && intersec[0] > minx2) || (intersec[1] < maxy2 && intersec[1] > miny2))) {
            //creating intersection sphere
            geometry[current] = new THREE.SphereGeometry(radius, segments, rings);
            material[current] = new THREE.MeshBasicMaterial({
                color: this.intersection_colors[jterator],
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
            current += 1;
        }
        if (iterator === this.points.length - 1) {
            iterator = kterator;
            jterator += 1;
            kterator += 1;
        } else {
            iterator += 1;
        }
    }
};


Lines.prototype.centerPosition = function () {
    //return the medium value of the intersection points
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
    //update scene with new parameters
    "use strict";
    var cpos,
        iterator;
    //reset colors
    for (iterator = 0; iterator < this.points.length; iterator += 1) {
        this.line_colors[iterator] = random_color();
    }
    for (iterator = 0; iterator < this.intersections.length; iterator += 1) {
        this.intersection_colors[iterator] = random_color();
    }
    //redraw
    this.drawLines();
    this.drawIntersections();
    //centers camera
    cpos = this.centerPosition();
    camera.position.x = cpos[0];
    camera.position.y = cpos[1] - viewSize / 2;
    camera.position.z = z;
};

Lines.prototype.simpleUpdate = function () {
    //update scene with new parameters while handles are being manipulated
    "use strict";
    this.drawLines();
    this.drawIntersections();
};

//mouse and window interaction
var start = function (lines) {
    //adds event listeners and update document values
    'use strict';
    lines.parseLineText(document.getElementById("intxt").value);
    lines.update(zdistance);

    document.getElementById("gotxt").addEventListener("click", function () {
        //when button Set is clicked
        lines.parseLineText(document.getElementById("intxt").value);
        lines.update(zdistance);
    });

    document.getElementById("gettxt").addEventListener("click", function () {
        //when button set Get is clicked
        document.getElementById("intxt").value = lines.getLineText();
    });

    document.getElementById("intxt").addEventListener("change", function () {
        //when text is changed
        lines.parseLineText(document.getElementById("intxt").value);
        lines.update(zdistance);
    });

    document.addEventListener('mousedown', function () {
        //change global variables for object selection
        PRESSING = true;
        INTERSECTED = "";
    });

    document.addEventListener('mouseup', function () {
        //change global variables for object selection
        PRESSING = false;
        PRESSABLE = false;
    });

    document.addEventListener('mousemove', function (event) {
        //updates global mouse variable and, if needed, updates the selected handle position
        var aux_line,
            aux_handle,
            vector = new THREE.Vector3();
        event.preventDefault();
        mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
        mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;
        vector.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            -(event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        //unprojecting the mouse position on the camera like this will only work with orthogonal cameras
        vector.unproject(camera);
        if (PRESSABLE && PRESSING) {
            //the object name store in specific positions it's indexes
            aux_line = parseInt(INTERSECTED.substring(11, 12), 10);
            aux_handle = parseInt(INTERSECTED.substring(6, 7), 10);
            try{
                lines.points[aux_line][aux_handle][0] = vector.x;
                lines.points[aux_line][aux_handle][1] = vector.y;
                lines.simpleUpdate();
            } catch (ignore) {
            }
        }
    });

    window.addEventListener('resize', function() {
        //TODOO: fix aspect radio on resize
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

var render = function () {
    //render scene with specified changes
    "use strict";
    var intersects,
        aux_object,
        aux_name = "";
    requestAnimationFrame(render);
    //intersect/selected objects are those intersected by the ray between the mouse projection and the camera
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children);
    if (INTERSECTED.substring(0, 6) === 'handle') {
        aux_object = scene.getObjectByName(INTERSECTED);
        aux_object.material.color.setHex(INTERSECTED_COLOR);
    }
    if (intersects.length > 0) {
        aux_name = intersects[0].object.name;
        if (aux_name.substring(0, 6) === 'handle') {
            //if it's a handle, update global values
            PRESSABLE = true;
            INTERSECTED = aux_name;
            INTERSECTED_COLOR = intersects[0].object.material.color.getHex();
            intersects[0].object.material.color.setHex(0xff0000);
        }
    }
    renderer.render(scene, camera);
};

render();
