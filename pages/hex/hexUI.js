//var s = new SimpleGrid(121, 7, 30);
//var t = new s.element();
//t.update(1);
//console.log(t.getAngle());

var d_vector = [0, 1, 3, 1, 0, 0];
d_vector.push(d_vector[0]);
d_vector.shift();
d_vector.push(d_vector[0]);
d_vector.shift();
console.log(d_vector)
