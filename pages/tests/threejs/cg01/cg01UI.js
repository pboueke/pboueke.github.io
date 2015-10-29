/*global Lines, camera, console, THREE, controls, document*/
var L = new Lines();
var zdistance = 100;
L.parseLineText(document.getElementById("intxt").value);
L.update(zdistance);

document.getElementById("gotxt").addEventListener("click", function () {
    L.parseLineText(document.getElementById("intxt").value);
    L.update(zdistance);
});
