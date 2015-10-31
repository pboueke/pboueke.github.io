/*global Lines, camera, console, THREE, controls, document, scene*/
var projector = new THREE.Projector(),
    mouse = {x: 0, y: 0},
    INTERSECTED;

// find intersections
function mouseIntersect() {
// create a Ray with origin at the mouse position
//   and direction into the scene (camera direction)
var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
projector.unprojectVector(vector, camera);
var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

// create an array containing all objects in the scene with which the ray intersects
var intersects = ray.intersectObjects(scene.children);

// INTERSECTED = the object in the scene currently closest to the camera
// and intersected by the Ray projected from the mouse position

// if there is one (or more) intersections
if (intersects.length > 0) {
  // if the closest object intersected is not the currently stored intersection object
  if (intersects[0].object != INTERSECTED) {
	    // restore previous intersection object (if it exists) to its original color
		if (INTERSECTED)
			INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
		// store reference to closest object as current intersection object
		INTERSECTED = intersects[0].object;
		// store color of closest object (for later restoration)
		INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
		// set a new color for closest object
		INTERSECTED.material.color.setHex(0xffff00);
	}
}
else // there are no intersections
{
	// restore previous intersection object (if it exists) to its original color
	if (INTERSECTED)
		INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
	// remove previous intersection object reference
	//     by setting current intersection object to "nothing"
	INTERSECTED = null;
}
}
