var square_width = 1;
var num_riskers = 50;
var speed_mod = 20;

var riskers_arr = [];

//resizes the canvas
window.onresize = function(event){
  document.getElementById("main").style.width = window.innerWidth -20;
}

var Risker = function () {
  console.log("risker created");

  var starting_side;
  var x;
  var y;
  var color;

  var colors = ["rgba(225, 159, 159, 0.5)","rgba(72, 241, 153, 0.5)","rgba(155, 72, 241, 0.5)",
                "rgba(241, 72, 199, 0.5)", "rgba(241, 143, 72, 0.5)","rgba(241, 143, 72, 0.5)"]

  this.new_point = function () {
    //1-top, 2-right, 3-botton, 4-left
    starting_side = Math.ceil(Math.random()*4);
    color = Math.ceil(Math.random()*6)-1;
    x = Math.floor(Math.random()*(window.innerWidth -20))+1
    y = Math.floor(Math.random()*(800))+1 //800 is the fixed horizontal resolution
    switch (starting_side){
      case 1:
        y = -square_width;
        break;
      case 2:
        x = window.innerWidth -20;
        break;
      case 3:
        y = 800;
        break;
      case 4:
        x = -square_width;
        break;
    }
  }

  this.new_point();

  this.next_point = function () {
    var ctx = document.getCSSCanvasContext("2d", "squares", window.innerWidth -20, 800);
    ctx.fillStyle = colors[color];
    ctx.fillRect (x, y, square_width, square_width);

    switch (starting_side){
      case 1: //going down
        y += (Math.floor(Math.random()*1)+1)*square_width; //0 or 1
        x += (Math.floor(Math.random()*3)-1)*square_width; //-1, 0 or 1
        break;
      case 2: //going right
        y += (Math.floor(Math.random()*3)-1)*square_width; //-1, 0 or 1
        x += (Math.floor(Math.random()*2)-1)*square_width; //0 or -1
        break;
      case 3: // going up
        y += (Math.floor(Math.random()*2)-1)*square_width; //0 or -1
        x += (Math.floor(Math.random()*3)-1)*square_width; //-1, 0 or 1
        break;
      case 4: //going left
        y += (Math.floor(Math.random()*3)-1)*square_width; //-1, 0 or 1
        x += (Math.floor(Math.random()*1)+1)*square_width; //0 or 1

        break;
    }

    if (x>window.innerWidth+2*square_width || x<-2*square_width ||
        y>800+2*square_width || y<-2*square_width){
          //ugly repetition
          starting_side = Math.ceil(Math.random()*4);
          color = Math.ceil(Math.random()*6)-1;
          x = Math.floor(Math.random()*(window.innerWidth -20))+1
          y = Math.floor(Math.random()*(800))+1 //800 is the fixed horizontal resolution
          switch (starting_side){
            case 1:
              y = -square_width;
              break;
            case 2:
              x = window.innerWidth -20;
              break;
            case 3:
              y = 800;
              break;
            case 4:
              x = -square_width;
              break;
          }
    }
  }
}

  // we need to wait DOM load, not sure why
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("riders").addEventListener("change",function(){
      num_riskers = document.getElementById("riders").value;
      start();
    });
    document.getElementById("speed").addEventListener("change",function(){
      speed_mod = document.getElementById("speed").value;
    });
    document.getElementById("size").addEventListener("change",function(){
      square_width = document.getElementById("size").value;
    });
  });

var start = function () {

  console.log(num_riskers);
  console.log(speed_mod);
  console.log(square_width);

  document.getElementById("startbt").disabled = true;
  for (i=0; i<num_riskers; i++){
    riskers_arr[i] = new Risker();
  }
  for (i=0; i<num_riskers; i++){
    window.setInterval(riskers_arr[i].next_point,Math.random()*50+speed_mod);
  }
}

var reload = function () {
  location.reload();
}
