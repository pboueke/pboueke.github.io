var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer({ alpha: true });
var controls = new THREE.OrbitControls(camera, document, renderer.domElement);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var l = 2.5;
var h = 1.5;
var w = 0.5;

var geometry1 = new THREE.BoxGeometry(l, h, w);
var material1 = new THREE.MeshBasicMaterial( {color: 0xF7A823 } );
var rect1 = new THREE.Mesh(geometry1, material1);

var geometry2 = new THREE.BoxGeometry(l+0.01, h-0.01, w-0.01);
var material2 = new THREE.MeshBasicMaterial( {color: 0xF39325 } );
var rect2 = new THREE.Mesh(geometry2, material2);

var geometry3 = new THREE.BoxGeometry(l, h+0.01,w-0.01);
var material3 = new THREE.MeshBasicMaterial( {color: 0xEE7326 } );
var rect3 = new THREE.Mesh(geometry3, material3);

var geometry4 = new THREE.BoxGeometry(l, h, w);
var material4 = new THREE.MeshBasicMaterial( {color: 0xF39325 } );
var rect4 = new THREE.Mesh(geometry4, material4);

var geometry5 = new THREE.BoxGeometry(l+0.01, h-0.01, w-0.01);
var material5 = new THREE.MeshBasicMaterial( {color: 0xFFCD1C } );
var rect5 = new THREE.Mesh(geometry5, material5);

var geometry6 = new THREE.BoxGeometry(l, h+0.01,w-0.01);
var material6 = new THREE.MeshBasicMaterial( {color: 0xEE7326 } );
var rect6 = new THREE.Mesh(geometry6, material6);

var geometry7 = new THREE.BoxGeometry(l, h, w);
var material7 = new THREE.MeshBasicMaterial( {color: 0xFFCD1C } );
var rect7 = new THREE.Mesh(geometry7, material7);

var geometry8 = new THREE.BoxGeometry(l+0.01, h-0.01, w-0.01);
var material8 = new THREE.MeshBasicMaterial( {color: 0xEE7326 } );
var rect8 = new THREE.Mesh(geometry8, material8);

var geometry9 = new THREE.BoxGeometry(l, h+0.01,w-0.01);
var material9 = new THREE.MeshBasicMaterial( {color: 0xF7A823 } );
var rect9 = new THREE.Mesh(geometry9, material9);

scene.add(rect1);
scene.add(rect2);
scene.add(rect3);
scene.add(rect4);
scene.add(rect5);
scene.add(rect6);
scene.add(rect7);
scene.add(rect8);
scene.add(rect9);

var x1 = Math.PI/2
var y1 = Math.PI
var z1 = Math.PI/2

rect1.rotation.x += x1;
rect1.rotation.y -= y1;
rect1.rotation.z += z1;
rect2.rotation.x += x1;
rect2.rotation.y -= y1;
rect2.rotation.z += z1;
rect3.rotation.x += x1;
rect3.rotation.y -= y1;
rect3.rotation.z += z1;

var x2 = 0
var y2 = 0
var z2 = 0

rect4.rotation.x += x2;
rect4.rotation.y -= y2;
rect4.rotation.z += z2;
rect5.rotation.x += x2;
rect5.rotation.y -= y2;
rect5.rotation.z += z2;
rect6.rotation.x += x2;
rect6.rotation.y -= y2;
rect6.rotation.z += z2;

var x3 = Math.PI/2
var y3 = Math.PI/2
var z3 = Math.PI

rect4.rotation.x += x3;
rect4.rotation.y -= y3;
rect4.rotation.z += z3;
rect5.rotation.x += x3;
rect5.rotation.y -= y3;
rect5.rotation.z += z3;
rect6.rotation.x += x3;
rect6.rotation.y -= y3;
rect6.rotation.z += z3;

camera.position.z = 5;
camera.rotation.z = 0.7;


var render = function () {
  requestAnimationFrame (render);
  rect1.rotation.x += 0.01;
  rect2.rotation.x += 0.01;
  rect3.rotation.x += 0.01;
  rect4.rotation.x += 0.01;
  rect5.rotation.x += 0.01;
  rect6.rotation.x += 0.01;
  rect7.rotation.x += 0.01;
  rect8.rotation.x += 0.01;
  rect9.rotation.x += 0.01;

  renderer.render(scene, camera);
};

render();
