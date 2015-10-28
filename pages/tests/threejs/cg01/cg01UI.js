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

scene.add(rect1);

var x1 = Math.PI/2
var y1 = Math.PI
var z1 = Math.PI/2

rect1.rotation.x += x1;
rect1.rotation.y -= y1;
rect1.rotation.z += z1;


camera.position.z = 5;
camera.rotation.z = 0.7;

var render = function () {
  requestAnimationFrame (render);
  rect1.rotation.x += 0.01;
  renderer.render(scene, camera);
};

render();
