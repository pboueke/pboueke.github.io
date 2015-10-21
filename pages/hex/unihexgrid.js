/*global oCanvas, console */

/*
* Unidimensional Hexagonal Grid
* Author: Pedro H. Boueke <p h b o u e k e "at" p o l i . u f r j . b r>
* Version: 1.0.19.10.15 (by mistake, higher than 1.0.30.10.15)
*
* This is how the hexagonal grid is represented:
*
*            _d5 ________________ d0_
*           / \  \            /x/  / \            * It's formed by 6 regions
*          /   \  \   N(5)   /x/  /   \             and 6 diagonals which will
*         /     \  \        /x/  /     \            be constantly referred to
*        /       \  \      /x/  /       \           in the algorithms below.
*       /         \  \    /x/../         \
*      /   Nw(4)   \  \  /x/19/   Ne(0)   \       * Note the marked region
*     /             \  \/x/ 7/             \        between the N region and the
*    /_______________\/6  1\/_8_____________\       diagonal d0. It is
*  d4________________|5 0  2|_9_____________d1      characterized by an abrupt
*    \              / \4__3/\ 10           /        change in the indexes due to
*     \   Sw(3)    /   /..\11\    Se(1)   /         the counting system used.
*      \          /   /    \  \          /          Any element at d0 is the
*       \        /   /      \  \        /           first element of it's own
*        \      /   /        \  \      /            ring and also is a neighbor
*         \    /   /          \  \    /             of the last element of it's
*          \  /   /    S(2)    \  \  /              ring. This fact requires
*           \/   /______________\  \/               some extra attention.
*             d3                  d2
*/

function Hex(id) {
  //The base element of the grid
    "use strict";
    this.grid_index = id;
}

Hex.prototype.setIndex = function (id) {
    "use strict";
    this.grid_index = id;
};

Hex.prototype.getIndex = function () {
    "use strict";
    return this.grid_index;
};

Hex.prototype.getNumberOfRings = function (k) {
  /* Returns the number of rings required for k elements around the center one.
  *  This function resolves the equation 'n = (-3 + sqrt(9+12n))/6' */
    "use strict";
    var answer = 9 + 12 * k;
    answer = Math.sqrt(answer);
    answer = (answer - 3) / 6;
    return Math.ceil(answer);
};

Hex.prototype.getDiagonalElement = function (id, radius) {
  /* Returns the index from the element within the given diagonal and radius
  *  where id is the id of the diagonal (id = 0 -> NEd,..., i = 5 -> NWd) and
  *  radius is the radius of the wanted ring*/
    "use strict";
    //simplified sum expression + position in ring
    return (3 * Math.floor(Math.pow((radius - 1), 2) + (radius - 1)) + 1 + id * radius);
};

Hex.prototype.getNeighbors = function (id) {
    /* Returns an array with the indexes from the six neighbors around the hex
    *  with the specidfied id(n). */
    "use strict";
    var c1, c2, c3, c4,
        n = parseFloat(id),
        iterator = 0,
        position = -1,
        radius = this.getNumberOfRings(n),
        neighbors = [-1, -1, -1, -1, -1, -1],
        is_diagonal = false;
    if (n === 0) {
        neighbors = [1, 2, 3, 4, 5, 6];
        return neighbors;
    }
    if (n === 6) {
        neighbors = [0, 1, 5, 16, 17, 18];
        return neighbors;
    }
    for (iterator = 0; iterator < 6; iterator += 1) {
        if (this.getDiagonalElement(iterator, radius) === n) {
            is_diagonal = true;
            position = iterator;
            break;
        }
    }
    if (!is_diagonal) {
        for (iterator = 0; iterator < 6; iterator += 1) {
            if (iterator === 5) {
                if (this.getDiagonalElement(iterator, radius) < n) {
                    position = iterator;
                    break;
                }
            }
            // Will look for n in each region. The iterator corresponds
            // to the id of the region (i = 0 -> NEr ..., i = 5 -> Nr).
            if ((this.getDiagonalElement(iterator, radius) < n) && (n < this.getDiagonalElement(iterator + 1, radius))) {
                position = iterator;
                break;
            }
        }
    }
    if (is_diagonal) {
        c1 = position;
        c2 = 7 - position; //(6 - position + 1)
        c3 = 6 - position;
        c4 = 5 - position; //(6 - position - 1)
        if (position === 0) { // Caused by NEd's abrupt change
            c2 -= 6 + 6 * (radius - 1);
            neighbors[1] = this.getDiagonalElement(5, radius) + (radius - 1);
            neighbors[3] = this.getDiagonalElement(5, radius + 1) + radius;
        } else {
            neighbors[1] = n - 1;
            neighbors[3] = n + 6 * (radius + 1) - c2;
        } // Caused by the first ring's abrupt change
        if (radius === 1) {
            neighbors[0] = 0;
        } else {
            neighbors[0] = n - 6 * (radius - 1) - c1;
        }
        neighbors[2] = n + 1;
        neighbors[4] = n + 6 * (radius + 1) - c3;
        neighbors[5] = n + 6 * (radius + 1) - c4;
        return neighbors;
        //neighbors[x], x={0:inf.neighbor; 1:ant.neighbor; 2:next.neighbor; 3,4,5:sup.n.}  (ordered with ascending index)
    }
    c1 = position + 1;
    c2 = position;
    c3 = 6 - position;
    c4 = 6 - position - 1;
    if ((position === 5) && (n === this.getDiagonalElement(5, radius) + (radius - 1))) {
        c2 += n + 6 * (radius - 1);
        neighbors[3] = this.getDiagonalElement(0, radius);
        neighbors[1] = this.getDiagonalElement(0, radius - 1);
    } else {
        neighbors[3] = n + 1;
        neighbors[1] = n - 6 * (radius - 1) - c2;
    }
    neighbors[2] = n - 1;
    neighbors[0] = n - 6 * (radius - 1) - c1;
    neighbors[4] = n + 6 * (radius + 1) - c3;
    neighbors[5] = n + 6 * (radius + 1) - c4;
    //neighbors[x], x={0,1:inf.neighbor; 2:ant.neighbor; 3:next.neighbor; 4,5:sup.n.}  (ordered with ascending index)
    return neighbors;
};

/* The following code is used for the creation of the grid, with its visual representation.
*  The function MasterHex is used as the one that will create it's graphic representation.
*  In this version we are using oCanvas (not ideal).
*/

var canvas = oCanvas.create({
    canvas: "#canvas"
});

function SimpleGrid(number_elements, spacing, element_size) {
    "use strict";
    var grid = [],
        current_neighbor = [],
        iterator,
        jterator,
        radius,
        position = -1,
        size = number_elements,
        x_dist = 1.75 * element_size + spacing * 0.5,
        y_dist = 2 * element_size * 0.75 + spacing * 0.5,
        is_diagonal = false,
        current_position = [canvas.width / 2, canvas.height / 2];
    function MasterHex(id, x_pos, y_pos, radius) {
        var index = id,
            kterator;
        this.grid_index = new Hex(id);
        this.hexagon = canvas.display.polygon({
            x: x_pos,
            y: y_pos,
            sides: 6,
            radius: radius,
            fill: "rgb(0,0,255)",
            rotation: 90
        }).bind("mouseenter touchenter", function () {
            current_neighbor = grid[0].grid_index.getNeighbors(index);
            this.radius = radius * 1.1;
            this.fill = "rgb(255,0,0)";
            for (kterator = 0; kterator < 6; kterator += 1) {
                try {
                    grid[current_neighbor[kterator]].hexagon.fill = "rgb(255, 102, 0)";
                } catch (ignore) {
                }
            }
            canvas.redraw();
        }).bind("mouseleave touchleave", function () {
            this.radius = radius;
            this.fill = "rgb(0,0,255)";
            for (kterator = 0; kterator < 6; kterator += 1) {
                try {
                    grid[current_neighbor[kterator]].hexagon.fill = "rgb(0,0,255)";
                } catch (ignore) {
                }
            }
            canvas.redraw();
        });
        canvas.addChild(this.hexagon);
    }
    grid[0] = new MasterHex(0, current_position[0], current_position[1], element_size);
    current_position[0] += x_dist * 0.5;
    current_position[1] -= y_dist;
    grid[1] = new MasterHex(1, current_position[0], current_position[1], element_size);
    current_position[0] += x_dist * 0.5;
    current_position[1] += y_dist;
    grid[2] = new MasterHex(2, current_position[0], current_position[1], element_size);
    current_position[0] -= x_dist * 0.5;
    current_position[1] += y_dist;
    grid[3] = new MasterHex(3, current_position[0], current_position[1], element_size);
    current_position[0] -= x_dist;
    grid[4] = new MasterHex(4, current_position[0], current_position[1], element_size);
    current_position[0] -= x_dist * 0.5;
    current_position[1] -= y_dist;
    grid[5] = new MasterHex(5, current_position[0], current_position[1], element_size);
    current_position[0] += x_dist * 0.5;
    current_position[1] -= y_dist;
    grid[6] = new MasterHex(6, current_position[0], current_position[1], element_size);
    //first ring must be initialized
    for (iterator = 7; iterator < size; iterator += 1) {
        is_diagonal = false;
        position = -1;
        radius = grid[0].grid_index.getNumberOfRings(iterator);
        for (jterator = 0; jterator < 6; jterator += 1) {
            if (grid[0].grid_index.getDiagonalElement(jterator, radius) === iterator) {
                is_diagonal = true;
                position = jterator;
                break;
            }
        }
        if (!is_diagonal) {
            for (jterator = 0; jterator < 6; jterator += 1) {
                if (iterator === 5) {
                    if (grid[0].grid_index.getDiagonalElement(jterator, radius) < iterator) {
                        position = jterator;
                        break;
                    }
                } else {
                    if ((grid[0].grid_index.getDiagonalElement(jterator, radius) < iterator)
                            && (iterator < grid[0].grid_index.getDiagonalElement(jterator + 1, radius))) {
                        position = jterator;
                        break;
                    }
                }
            }
        }
        if (position === -1) {
            console.log("ERROR: position not found");
        }
        if (is_diagonal && position === 0) {
            current_position[0] += x_dist * 1.5;
            current_position[1] -= y_dist;
        } else if (!is_diagonal && position === 5) {
            current_position[0] += x_dist;
        } else if ((!is_diagonal && position === 0) || (is_diagonal && position === 1)) {
            current_position[0] += x_dist * 0.5;
            current_position[1] += y_dist;
        } else if ((!is_diagonal && position === 1) || (is_diagonal && position === 2)) {
            current_position[0] -= x_dist * 0.5;
            current_position[1] += y_dist;
        } else if ((!is_diagonal && position === 2) || (is_diagonal && position === 3)) {
            current_position[0] -= x_dist;
        } else if ((!is_diagonal && position === 3) || (is_diagonal && position === 4)) {
            current_position[0] -= x_dist * 0.5;
            current_position[1] -= y_dist;
        } else if ((!is_diagonal && position === 4) || (is_diagonal && position === 5)) {
            current_position[0] += x_dist * 0.5;
            current_position[1] -= y_dist;
        }
        grid[iterator] = new MasterHex(iterator, current_position[0], current_position[1], element_size);
    }
}

SimpleGrid.prototype.element = function () {
    "use strict";
    this.hex_op = new Hex(1);
    var is_diagonal = false,
        position = -1,
        radius = -1,
        angle = -1;
    this.getDiagonal = function () {
        return is_diagonal;
    };
    this.getRadius = function () {
        return radius;
    };
    this.getPosition = function () {
        return position;
    };
    this.getAngle = function () {
        return angle;
    };
    this.update = function (id) {
        var iterator;
        this.hex_op.grid_index = id;
        radius = this.hex_op.getNumberOfRings(id);
        //converts id to angle, where d0 = 0, d4 = 240, and so on.
        angle = id - this.hex_op.getDiagonalElement(0, this.hex_op.getNumberOfRings(id));
        angle = angle * (60.0 / this.hex_op.getNumberOfRings(id));
        for (iterator = 0; iterator < 6; iterator += 1) {
            if (this.hex_op.getDiagonalElement(iterator, radius) === id) {
                is_diagonal = true;
                position = iterator;
                break;
            }
        }
        if (!is_diagonal) {
            for (iterator = 0; iterator < 6; iterator += 1) {
                if (iterator === 5) {
                    if (this.hex_op.getDiagonalElement(iterator, radius) < id) {
                        position = iterator;
                        break;
                    }
                }
                if ((this.hex_op.getDiagonalElement(iterator, radius) < id) && (id < this.hex_op.getDiagonalElement(iterator + 1, radius))) {
                    position = iterator;
                    break;
                }
            }
        }
    };
};

SimpleGrid.prototype.ringDistance = function (a, b) {
  /* Returns the in ring distance between the two elements.
  *  Parameters a and b must be on the same ring.
  */
    "use strict";
    var hex_op = new Hex(1),
        radius = hex_op.getNumberOfRings(a);
    return Math.min(Math.abs(a - b),  Math.abs((6 * radius - (a - b))));
};

SimpleGrid.prototype.angleDelta = function (a, b) {
  /* Returns the in ring distance between the two elements.
  *  Parameters a and b must be on the same ring.
  */
    "use strict";
    var r1 = a - b,
        r2 = b - a;
        if (r1 < 0) {
            r1 += 360;
        }
        if (r2 < 0) {
            r2 += 360;
        }
        return Math.min (r1, r2);
};

SimpleGrid.prototype.regionDistance = function (a, b, a_d, b_d) {
  /* Returns the region distance between the two elements.
  *  Parameters ad and bd are booleans that indicates whether or not or not a and b are diagonals.
  */
    "use strict";
    var rd,                       //distance between regions
        d_vector,                 //distances between regions  (see: http://imgur.com/05bwTRL)
        aux_pos1,
        aux_pos2,
        iterator,
        jterator,
        aux_i,
        aux_j;
    if (a_d && b_d) {  //a and b are diagonals
        console.log("BOTH ELEMENTS", a, b, "ARE DIAGONALS");
        aux_pos1 = Math.max(a, b);
        aux_pos2 = Math.min(a, b);
        d_vector = [0, 0, 1, 3, 1, 0];  //diagonal vs diagonal distance vector
        for (iterator = 0; iterator < 6; iterator += 1) {
            jterator = 0;
            while (jterator <= iterator) {
                if (aux_pos1 === iterator && aux_pos2 === jterator) {
                    console.log("RD ASSIGNED");
                    rd = d_vector[jterator];
                    iterator = 6; //breaks nested loop
                    break;
                }
                if (iterator === jterator) {
                    break;
                }
                jterator += 1;
            }
            //shifts d_vector so that at each iteration of the main loop we parse another row of the matrix
            d_vector.unshift(d_vector[5]);
            d_vector.pop();
        }
    } else if ((a_d && !b_d) || (!a_d && b_d)) {  //only one of them is a diagonal
        if (!a_d) {
            console.log(b, "IS DIAGONAL", a, "ISN'T");
            aux_pos1 = Math.max(a, b);
            aux_pos2 = Math.min(a, b);
        } else {
            console.log(a, "IS DIAGONAL", b, "ISN'T");
            aux_pos1 = Math.max(a, b);
            aux_pos2 = Math.min(a, b);
        }
        d_vector = [0, 0, 1, 2, 2, 1];  //region vs diagonal distance vector
        for (iterator = 0; iterator < 6; iterator += 1) {
            jterator = 0;
            while (jterator <= iterator) {
                if (!a_d) {
                    aux_i = jterator;
                    aux_j = iterator;
                } else {
                    aux_i = iterator;
                    aux_j = jterator;
                }
                //console.log(aux_pos1, aux_i, aux_pos2, aux_j)
                if (aux_pos1 === aux_i && aux_pos2 === aux_j) {
                    if (!a_d) {
                        rd = d_vector[jterator];
                        iterator = 6; //breaks nested loop
                        break;
                    } else {
                        if (jterator + 1 === 6) {
                            console.log(d_vector[0]);
                            rd = d_vector[0];
                        } else {
                            console.log(d_vector[jterator + 1]);
                            rd = d_vector[jterator + 1];
                        }
                        iterator = 6; //breaks nested loop
                        break;
                    }
                }
                if (iterator === (5 - jterator)) {
                    break;
                }
                jterator += 1;
            }
            d_vector.unshift(d_vector[5]);
            d_vector.pop();
        }
    } else {  //none of them is a diagonal
        console.log("BOTH ELEMENTS", a, b, "ARE NOT DIAGONALS");
        aux_pos1 = Math.max(a, b);
        aux_pos2 = Math.min(a, b);
        d_vector = [0, 1, 2, 3, 2, 1];  //region vs region distance vector
        for (iterator = 0; iterator < 6; iterator += 1) {
            jterator = 0;
            while (jterator <= iterator) {
                if (aux_pos1 === iterator && aux_pos2 === jterator) {
                    rd = d_vector[jterator];
                    iterator = 6; //breaks nested loop
                    break;
                }
                if (iterator === jterator) {
                    break;
                }
                jterator += 1;
            }
            d_vector.unshift(d_vector[5]);
            d_vector.pop();
        }
    }
    return rd;
};

SimpleGrid.prototype.distanceEstimation = function (a, b) {
 /* The heuristic used in A* for estimating the distance between two elements of the grid.
  * It uses a complete and unblocked hexagonal grid as reference. Parameters 'a' and 'b'
  * are indexes from Hex elements in  a SimpleGrid.
  */
    "use strict";
    var he = new this.element(),  //higher element
        le = new this.element(),  //lower element
        d = 0,                    //distance between a and b
        rd,                       //distance between regions
        aux_he_neighbors = [-1, -1, -1, -1, -1, -1],
        aux_le_neighbors = [-1, -1, -1, -1, -1, -1],
        aux_he_angle,
        aux_le_angle,
        aux_he,
        aux_le,
        aux_angle,
        iterator;
    //exceptions
    if (a === 0) {
        return he.hex_op.getNumberOfRings(b);
    }
    if (b === 0) {
        return he.hex_op.getNumberOfRings(a);
    }
    //ordering
    if (he.hex_op.getNumberOfRings(a) < he.hex_op.getNumberOfRings(b)) {
        he.update(b);
        le.update(a);
    } else {
        he.update(a);
        le.update(b);
    }
    rd = this.regionDistance(he.getPosition(), le.getPosition(), he.getDiagonal(), le.getDiagonal());
    if (rd === 3) {
        console.log("RD = 3");
        console.log("d = ", d);
        return he.getRadius() + le.getRadius();
    }
    if (rd <= 1) {
        console.log("RD <= 1");
        console.log("d = ", d);
        return d + this.ringDistance(he.hex_op.grid_index, le.hex_op.grid_index);
    }
    //equalizes radius
    aux_he_angle = he.getAngle();
    while (he.getRadius() !== le.getRadius()) {
        aux_he_neighbors = he.hex_op.getNeighbors(he.hex_op.grid_index);
        for (iterator = 0; iterator < 6; iterator += 1) {
            if (he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]) < he.getRadius()) {
                aux_angle = aux_he_neighbors[iterator] - he.hex_op.getDiagonalElement(0, he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                aux_angle = aux_angle * (60.0 / he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                console.log(aux_he_neighbors[iterator]);
                console.log(le.getAngle(), "-", aux_angle, "<=", le.getAngle(), "-", aux_he_angle  );
                if (this.angleDelta(le.getAngle(), aux_angle) <= this.angleDelta(le.getAngle(), aux_he_angle)) {
                    aux_he_angle = aux_angle;
                    aux_he = aux_he_neighbors[iterator];
                }
            }
        }
        he.update(aux_he);
        d += 1;
    }
    if (he.hex_op.grid_index ===  le.hex_op.grid_index) {
        return d;
    }
    console.log('RAIOS EQUALIZADOS');
    console.log('HE: ', he.hex_op.grid_index);
    console.log('LE: ', le.hex_op.grid_index);
    //finds the region distance ('rd')' between 'he' and 'le'
    rd = this.regionDistance(he.getPosition(), le.getPosition(), he.getDiagonal(), le.getDiagonal());
    console.log("RD CALCULATED", rd);
    if (rd === 3) {
        console.log("RD = 3");
        console.log("d = ", d);
        return d + le.getRadius() + he.getRadius();
    }
    if (rd <= 1) {
        console.log("RD <= 1");
        console.log("d = ", d);
        return d + this.ringDistance(he.hex_op.grid_index, le.hex_op.grid_index);
    }
    if (rd === 2) {
        console.log("STARTING RD=2 PROCESS");
        var debug = 0;
        aux_he_angle = he.getAngle();
        aux_le_angle = le.getAngle();
        while (rd > 1) {
            aux_he_neighbors = he.hex_op.getNeighbors(he.hex_op.grid_index);
            for (iterator = 0; iterator < 6; iterator += 1) {
                if (he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]) < he.getRadius()) {
                    aux_angle = aux_he_neighbors[iterator] - he.hex_op.getDiagonalElement(0, he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                    aux_angle = aux_angle * (60.0 / he.hex_op.getNumberOfRings(aux_he_neighbors[iterator]));
                    if (this.angleDelta(le.getAngle(), aux_angle) <= this.angleDelta(le.getAngle(), aux_he_angle)) {
                        aux_he_angle = aux_angle;
                        aux_he = aux_he_neighbors[iterator];
                        console.log("NEW HE ", aux_he);
                    }
                }
            }
            he.update(aux_he);
            aux_le_neighbors = le.hex_op.getNeighbors(le.hex_op.grid_index);
            for (iterator = 0; iterator < 6; iterator += 1) {
                console.log(aux_le_neighbors[iterator]);
                if (le.hex_op.getNumberOfRings(aux_le_neighbors[iterator]) < le.getRadius()) {
                    aux_angle = aux_le_neighbors[iterator] - le.hex_op.getDiagonalElement(0, le.hex_op.getNumberOfRings(aux_le_neighbors[iterator]));
                    aux_angle = aux_angle * (60.0 / le.hex_op.getNumberOfRings(aux_le_neighbors[iterator]));
                    if (this.angleDelta(he.getAngle(), aux_angle) <= this.angleDelta(he.getAngle(), aux_le_angle)) {
                        aux_le_angle = aux_angle;
                        aux_le = aux_le_neighbors[iterator];
                        console.log("NEW LE ", aux_le);  //((target - origin) + 180)%360 - 180 aux_le_angle  (a % n + n) % n  //a - floor(a/n) * n    a = (a + 180) % 360 - 180

                    }
                }
            }
            le.update(aux_le);
            d += 2;
            rd = this.regionDistance(he.getPosition(), le.getPosition(), he.getDiagonal(), le.getDiagonal());
            console.log("NEW RD ", rd);
            console.log("NEW HE ", he.hex_op.grid_index, "NEW LE ", le.hex_op.grid_index)
            if (debug === 1){
                break;
            }
            debug += 1;
        }
        console.log("d", d, "+", this.ringDistance(he.hex_op.grid_index, le.hex_op.grid_index), he.hex_op.grid_index, le.hex_op.grid_index);
        return d + this.ringDistance(he.hex_op.grid_index, le.hex_op.grid_index);
    }
};
