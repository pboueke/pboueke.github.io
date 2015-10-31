/*global Lines, camera, console, THREE, controls, document, window*/
var L = new Lines();
var zdistance = 100;

var start = function () {
    'use strict';
    L.parseLineText(document.getElementById("intxt").value);
    L.update(zdistance);

    document.getElementById("gotxt").addEventListener("click", function () {
        L.parseLineText(document.getElementById("intxt").value);
        L.update(zdistance);
    });

    document.getElementById("intxt").addEventListener("change", function () {
        L.parseLineText(document.getElementById("intxt").value);
        L.update(zdistance);
    });

};
