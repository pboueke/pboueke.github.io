/*
* Unidimensional Hexagonal Grid
* Author: Pedro H. Boueke <p h b o u e k e "at" p o l i . u f r j . b r>
* Version: 1.0.30.10.15
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
