/*global Hex,oCanvas, console */

var canvas = oCanvas.create({
    canvas: "#canvas"
});

function SimpleGrid(number_elements, spacing, element_size) {
    "use strict";
    var grid = [],
        current_neighbor = [];
    function MasterHex(id, x_pos, y_pos, radius) {
        var index = id,
            iterator;
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
            console.log(index);
            for (iterator = 0; iterator < 6; iterator += 1) {
                try{
                    grid[current_neighbor[iterator]].hexagon.fill = "rgb(255, 102, 0)";
                } catch (err) {
                    //ignore
                }
            }
            canvas.redraw();
        }).bind("mouseleave touchleave", function () {
            this.radius = radius;
            this.fill = "rgb(0,0,255)";
            for (iterator = 0; iterator < 6; iterator += 1) {
                try{
                    grid[current_neighbor[iterator]].hexagon.fill = "rgb(0,0,255)";
                } catch(err) {
                    //ignore
                }
            }
            canvas.redraw();
        });
        canvas.addChild(this.hexagon);
    }
    var iterator, jterator,
        radius,
        position = -1,
        size = number_elements,
        x_dist = 1.75 * element_size + spacing * 0.5,
        y_dist = 2 * element_size * 0.75 + spacing * 0.5,
        is_diagonal = false,
        current_position = [canvas.width / 2, canvas.height / 2];
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
var s = new SimpleGrid(121, 7, 30);
