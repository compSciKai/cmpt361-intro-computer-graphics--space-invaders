// class for player bullets
class bullet_p {
  constructor(vertices, height) {
    this.vertices = vertices;
    this.height = height;
  }
}

// global vars
var canvas;
var off = 0;
var message = 0;
var gl;
var height = 0.95
var pressed = 0;
var playerLeft = 0;
var playerRight = 0;
var direction = 2;
var offset = 0;
var pOffset = 0;
var stop = 0;
var width = 0.1;
var bullet_w = width/3;
var spacing = 0.15;
var both = spacing + width;
var stagger = 0;

var initBullet = 0;
var initBullet_player = 0;
var showBullet = 0;
var bullet_h = 0;
var bullets = [];

var shootInput = 0;
var bullets_player = [];

// delete array (wont draw these)
var delete_arr = [];
//console.log(delete_arr);
//console.log(skip_alien(0,0));

var num_aliens = 10;
var harder = 0;
var alien_movement = 0.007;
var alien_movement_init = alien_movement;
var harderHeight = 0.33;

// timer variables
var pbull_wtime = 550; 
var invade_wtime = 3000;
var e_shoot_wtime = 1500;

  // start misc event listeners
  var dir_timer = window.setInterval(changeDirection, 500);
  var invade_timer = window.setInterval(invade, invade_wtime);
  var shoot_timer = window.setInterval(shootOn, e_shoot_wtime);
  var shoot_timer_player = window.setInterval(shootOn_player, pbull_wtime);

window.onload = function init() {

  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  vBuffer = gl.createBuffer();

  //  Load shaders and initialize attribute buffers
  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  // Binding the vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

  // Associate out shader variables with our data buffer
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);
  

  render();
};

// RENDER FUNCTION ------------------------------------------------------------
function render() {
  // keyboard listener
  window.addEventListener("keydown", keyPressed, false);
  window.addEventListener("keyup", keyReleased, false);
  window.addEventListener("click", function(event) {
    shootInput = 1;
  }); 
 
  //window.addEventListener("keyup", getKey, false);

  // Changing the height value for moving the square
  /*
  if (pressed == 1)
    height = height - 0.005;
  */
  if (pressed == 2) {
    reset();
  }
  if (pressed == 3) {
    quit();
  }

  if (playerLeft == 1)
    pOffset -= 0.01
  if (playerRight == 1)
    pOffset += 0.01
  // choose which way to move
  //changeDirection();
  // move left if 1


  switch(direction) {
    case 1:
      offset -= alien_movement;
      break;
    case 2:
      offset += alien_movement;
      break;
    case 0:
      offset = offset;
      break;
  }
  //window.setInterval(changeDirection(), 5000);
  // Binding the vertex buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // check for win condition
  if (delete_arr.length == num_aliens) {
    alert("You win my dude!");
    reset();
  }


  if (off == 0) {
    // add enemies
    var enemies = drawEnemy(5, 2, offset-0.06);
    if(getMaxVertex(enemies, "left", "e") < -1)
      direction = 2;
    else if (getMaxVertex(enemies, "right", "e") > 1)
      direction = 1;
    if (getMaxVertex(enemies, "down", "e") < -0.85) {
        alert("you lose dude!");
        reset();
    }
         
    // test to see if difficulty should increase
    if (getMaxVertex(enemies, "down", "e") < harderHeight && harder == 0) {
      console.log("its getting harder now");
      makeHarder();
      harder = 1;
    }

    // shoot 
    if (showBullet == 1) {
      bullet_h += 0.00125;
      bullets = shoot_move(bullets, "e");
      if (getMaxVertex(bullets, "down", "b") < -1) {
        showBullet = 0;
        bullet_h = 0;
        //bullets = [];
      }
    }
  
    if (initBullet == 1 && showBullet != 1) {
      bullets = shoot_init(enemies, "e"); 
      initBullet = 0;
      showBullet = 1;
    }
  
  
    // add player
    var player = drawPlayer();
    // add movement boundaries
    if(getMaxVertex(player, "left", "p") < -1) {
      playerLeft = 0;
      pOffset = -0.95;
    }
    else if(getMaxVertex(player, "right", "p") > 1) {
      playerRight = 0;
      pOffset = 0.95;
    }
  
  //  console.log(bullets_player.length);
    // logic for player shoot_move 
    if (bullets_player.length != 0) {
      var highest_bullet = getMaxVertex(bullets_player, "up", "bp");
      if (highest_bullet > 1)
        remove(highest_bullet, bullets_player, "vpb");
        for (var i = 0; i < bullets_player.length; i++) {
          bullets_player[i].height += 0.025;
      }
      shoot_move(bullets_player, "p");
      // updated up to here
      /*
      if (getMaxVertex(bullets, "up", "bp") > 1) {
        showBullet = 0;
        bullet_h = 0;
        //bullets = [];
      }
      */
    }
  
   //console.log(bullets_player);
   // see if player bullet hits 
   if (bullets_player != []) 
     hit(bullets_player, enemies, "p");
  
    // see if player shoots
    if (shootInput == 1 && initBullet_player == 1) {
      bullets_player.push(shoot_init(player, "p"));
      shootInput = 0;
      initBullet_player = 0;
    }
  
    // see if bullets hit
    if (hit(bullets, player, "e") == 1) {
      alert("Ouch... You lose!");
      reset();
    }
  }
  if (off == 1 && message == 0) {
    alert("Thanks for playing!\nPress R to restart");
    message = 1;
  }
    
  // re-render
  window.requestAnimFrame(render);
}

// MISC FUNCTIONS -----------------------------------------------------------------

function reset() {
  bullets = [];
  height = 0.95;
  offset = 0;
  pressed = 0;
  bullet_h = 0;
  initBullet = 0;
  showBullet = 0;
  playerLeft = 0;
  playerRight = 0;
  bullets_player = [];
  shootInput = 0;
  delete_arr = [];
  // reset timers
  clearInterval(dir_timer); 
  clearInterval(invade_timer); 
  clearInterval(shoot_timer); 
  clearInterval(shoot_timer_player); 
  dir_timer = setInterval(changeDirection, 500);
  invade_timer = setInterval(invade, invade_wtime);
  shoot_timer = setInterval(shootOn, e_shoot_wtime);
  shoot_timer_player = setInterval(shootOn_player, pbull_wtime);
  off = 0;
  message = 0;
  both = spacing + width;
  alien_movement = alien_movement_init;
  harder = 0;
  //invade_timer = setInterval(invade, invade_wtime);
}

function quit() {
  reset();
  off = 1;
}

function makeHarder() {
  both *= 1.3;  
  alien_movement*=2.3;
  //invade_timer = setInterval(invade, 2000);
}

// key checking
function keyPressed(key) {
  if (key.key == "ArrowDown") {
      pressed = 1;
      console.log("down key pressed")
  }
  else if (key.keyCode == 82) {
      pressed = 2;
      console.log("reset")
  }
  else if (key.keyCode == 81) {
      pressed = 3;
      console.log("quit")
  }
  else if (key.key == "ArrowLeft") {
      playerLeft = 1;
  }
  else if (key.key == "ArrowRight") {
      playerRight = 1;
  }
  else if (key.keyCode == 32)  {
    shootInput = 1;
  }
  else if (key.key == "click")  {
    shootInput = 1;
  }
}

function keyReleased(key) {
  if (key.key == "ArrowLeft") {
      playerLeft = 0;
  }
  else if (key.key == "ArrowRight") {
      playerRight = 0;
  }
}
 
      //remove(highest_bullet, bullets_player, "vpb");
function remove(index, array, type) {
  var inx_r = -1;
  if (type == "vpb") {
    for (var i = 0; i < array.length; i++) {
      if (array[i].vertices[2][1]+array[i].height == index) {
        inx_r = i;
      }
    }
    if (inx_r != -1) {
      array.splice(inx_r, 1);
      console.log("bullet off screen deleted");
    }
    else 
      console.log("item not found!");
  }
}

function hit(bullets, target, type) {
  if (type == "e") {
    //console.log(bullets);
    for (var i = 0; i < bullets.length; i++) {
      var b_len = bullets[i].length;
      for (var j = 0; j < b_len; j++) {
        var bx = bullets[i][j][0];
        var by = bullets[i][j][1];
        var txmax = getMaxVertex(target, "right", "p");
        var txmin = getMaxVertex(target, "left", "p");
        var tymax = getMaxVertex(target, "up", "p");
        var tymin = getMaxVertex(target, "down", "p");
        if (bx > txmin && bx < txmax && by > tymin && by < tymax)
          return 1;
      }
    }
  }
   //hit(bullets_player, enemies, "p");
  else if (type == "p") {
    var j_val = -1;
    var k_val = -1;
    // each bullet_p
    for (var i = 0; i < bullets.length; i++) {
      //console.log("good");
      var bx = bullets[i].vertices[2][0];
      var by = bullets[i].vertices[2][1] + bullets[i].height;
      // each alien row
      for (var j = 0; j < target.length; j++) {
        // each alien in row
        for (var k = 0; k < target[j].length; k++) {
          if (skip_alien(j,k) == 1)
            continue;
          var txmax = target[j][k][1][0];
          var txmin = target[j][k][0][0];
          var tymax = target[j][k][1][1];
          var tymin = target[j][k][2][1];
//          console.log("bx: " + bx + " by: " + by + " txmax: " + txmax + " txmin: " + txmin + " tymax: " + tymax + " tymin: " + tymin); 
          if (bx > txmin && bx < txmax && by > tymin && by < tymax) {
            console.log("hit!");
            //j_val = j;
            //k_val = k;
            delete_arr.push([j, k]);
            bullets.splice(i, 1);
            console.log(delete_arr);
            //return 1;
          }
        }
      }
    }
    /*
    if (j_val != -1 && k_val !=-1) {
      console.log(target[j_val][k_val]); 
      for (var i = 0; i < 6; i++) {
      target[j_val][k_val][i].splice(0,2);
      }
      console.log(target[j_val][k_val]); 
    }
    */
  }
  return 0;
}

// shoot
function shootOn() {
  initBullet = 1;
}

function shootOn_player() {
  initBullet_player = 1;
}

function bot_row_dead() {
  var count = 0;
  for (var i = 0; i < delete_arr.length; i++) {
    if (delete_arr[i][0] == 1)
      count += 1;
  }
  if (count == num_aliens/2)
    return 1;
  else
    return 0;
}

function shoot_init(array, type) {
  var bullets = [];
  var botRow = 0;
  if (type == "e") {
    if (array[1].length > 0) {
      botRow = 1;  
    }
    if (bot_row_dead() == 1) {
      botRow = 0; 
    }
    for (var i = 0; i < array[botRow].length; i++) {
      var corner_x = array[botRow][i][2][0];
      var corner_y = array[botRow][i][2][1];
      var mid = corner_x - width/2; 
      var bullet = [
        vec2(mid - bullet_w/2, corner_y - 0.01),
        vec2(mid + bullet_w/2, corner_y - 0.01),
        vec2(mid, corner_y - bullet_w)
      ]; 
      bullets.push(bullet);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(bullet), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }   
    return bullets;
  }
  if (type == "p") {
      var corner_x = array[1][0];
      var corner_y = array[1][1];
      var mid = corner_x - width/2; 
      var bullet = [
        vec2(mid - bullet_w/2, corner_y + 0.01),
        vec2(mid + bullet_w/2, corner_y + 0.01),
        vec2(mid, corner_y + bullet_w)
      ]; 
      var x = new bullet_p(bullet, 0);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(bullet), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    return x;
  }
}

function shoot_move(array, type) {
  if (type == "e") {
    bullets = [];
    for (var i = 0; i < array.length; i++) {
      var bullet = [
        vec2(array[i][0][0], array[i][0][1] - bullet_h),
        vec2(array[i][1][0], array[i][1][1] - bullet_h),
        vec2(array[i][2][0], array[i][2][1] - bullet_h)
      ];
      bullets.push(bullet);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(bullet), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    return bullets;
  } 
  else if (type == "p") {
    for (var i = 0; i < array.length; i++) {
      var bullet = [
        vec2(array[i].vertices[0][0], array[i].vertices[0][1] + array[i].height),
        vec2(array[i].vertices[1][0], array[i].vertices[1][1] + array[i].height),
        vec2(array[i].vertices[2][0], array[i].vertices[2][1] + array[i].height),
      ];
      gl.bufferData(gl.ARRAY_BUFFER, flatten(bullet), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }
}

// change enemy direction
function changeDirection() {
  var random = Math.floor(Math.random()*4);
  //console.log(random);
  if (direction == 1 && random == 1)
    direction = 2;
  if (direction == 2 && random == 1)
    direction = 1;
}

// move aliens ArrowDown
function invade() {
  var test = height - both/2
  while (height > test) {
    height = height - 0.0025;
  }
}

// get max vertex direction
function getMaxVertex(array, side, type) {
  if (type == "e") {
    if (side == "left" || side == "down")
      var max = 1;
      else if (side == "right")
      var max = -1;
      for (var i = 0; i < array.length; i++) {
        for (var j = 0; j < array[i].length; j++) {
          if (skip_alien(i,j) == 1)
            continue;
          if (side == "left") {
            if (array[i][j][0][0] < max)
            max = array[i][j][0][0];
          }
          else if (side == "right") {
            if (array[i][j][1][0] > max)
            max = array[i][j][1][0];
          }
          else if (side == "down") {
            if (bot_row_dead() == 0) {
              if (array[1][j][2][1] < max)
              max = array[1][j][2][1];
            }
            else if (bot_row_dead() == 1) {
              if (array[0][j][2][1] < max)
              max = array[0][j][2][1];
            }
          }
        }
    }
  }
  else if (type == "p") {
    if (side == "left") {
      max = array[0][0];
    }
    else if (side == "right") {
      max = array[1][0];
    }
    if (side == "up") {
      max = array[0][1];
    }
    else if (side == "down") {
      max = array[2][1];
    }
  }
  else if (type == "b" && side == "down") {
    max = array[0][0][1];
  }

  else if (type == "bp" && side == "up") {
    var max = -1;
    for (var i = 0; i < array.length; i++) {
      if (array[i].vertices[2][1]+array[i].height > max) {
        max = array[i].vertices[2][1] + array[i].height;
      }
    }
  }
  return max;
}

// DRAW PLAYER -----------------------------------------------------------------------
function drawPlayer() {
  square = [
    vec2(-width/2 + pOffset, -0.85),
    vec2(width/2 + pOffset, -0.85),
    vec2(width/2 + pOffset, -0.95),
    vec2(-width/2 + pOffset, -0.85),
    vec2(width/2 + pOffset, -0.95),
    vec2(-width/2 + pOffset, -0.95),
  ];
  // Clearing the buffer and drawing the square
  
  gl.bufferData(gl.ARRAY_BUFFER, flatten(square), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  return square;
}

// DRAW ALIENS -----------------------------------------------------------------------

// function for scanning through delete_arr
function skip_alien(i, j) {
  for ( var k = 0; k < delete_arr.length; k++) {
      //console.log(delete_arr[k]);
    if ( delete_arr[k][0] == i && delete_arr[k][1] == j) {
      //console.log("alien in (" + i + ", " + j + ") is dead");
      return 1;
    }
  }
  return 0;
}

function drawEnemy(num_rows, num_cols, offset) {
  //// TODO: return an ARRAY, case for row = 0

  // need to use empty vertices array outside of function
  var col_enemies = [];
  //var offset = 0;
  //var enemies = drawEnemy(5, 2, offset-0.06);


  for(var i = 0; i < num_cols; i++) {
    if (i % 2 == 0)
      stagger = 0;
    else
      stagger = width - (width-spacing)/2;

    var spaceLeft = 0;
    var spaceRight = 0;
    var row_enemies = [];
    // if one -> just draw one
    if (num_rows == 1) {
      if (skip_alien(0, 0) == 1) {
        //console.log("skipping...");
        square = [
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2)
        ];
      }
      else {
        square = [
          vec2(-width/2+ offset +stagger, height-i*both),
          vec2(width/2+ offset +stagger, height-i*both),
          vec2(width/2+ offset +stagger, height - width-i*both),
          vec2(-width/2+ offset +stagger, height),
          vec2(width/2+ offset +stagger, height - width-i*both),
          vec2(-width/2+ offset +stagger, height - width-i*both)
        ];
      // Clearing the buffer and drawing the square
      gl.bufferData(gl.ARRAY_BUFFER, flatten(square), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      col_enemies.push(square)
    }
    // if more than one row
    else {
      if (skip_alien(i, 0) == 1) {
        //console.log("skipping...");
        square = [
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2),
          vec2(2, 2)
        ];
      }
      else {
        square = [
          vec2(-width/2 + offset +stagger, height-i*both),
          vec2(width/2 + offset +stagger, height-i*both),
          vec2(width/2 + offset +stagger, height - width-i*both),
          vec2(-width/2 + offset +stagger, height-i*both),
          vec2(width/2 + offset +stagger, height - width-i*both),
          vec2(-width/2 + offset +stagger, height - width-i*both)
        ];
        gl.bufferData(gl.ARRAY_BUFFER, flatten(square), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      row_enemies.push(square);
      //vertices[num_cols] = [];
      for (var j = 0; j < num_rows-1; j++) {
        // j = 0 is actually 1 in array
        if (j == 0) {
          newSquare = [
            vec2(-width/2 + offset-both +stagger, height-i*both),
            vec2(width/2 + offset-both +stagger, height-i*both),
            vec2(width/2 + offset-both +stagger, height - width-i*both),
            vec2(-width/2 + offset-both +stagger, height-i*both),
            vec2(width/2 + offset-both +stagger, height - width-i*both),
            vec2(-width/2 + offset-both +stagger, height - width-i*both)
          ];
        }
        //if even
        else if (j % 2 == 0) {
          if (j>=4)
            spaceLeft+=1;
          newSquare = [
            vec2(-width/2+ offset-both*(j-spaceLeft) +stagger, height-i*both),
            vec2(width/2+ offset-both*(j-spaceLeft) +stagger, height-i*both),
            vec2(width/2+ offset-both*(j-spaceLeft) +stagger, height - width-i*both),
            vec2(-width/2+ offset-both*(j-spaceLeft) +stagger, height-i*both),
            vec2(width/2+ offset-both*(j-spaceLeft) +stagger, height - width-i*both),
            vec2(-width/2+ offset-both*(j-spaceLeft) +stagger, height - width-i*both)
          ];
        }
        // if odd
        else {
          if (j>1)
            spaceRight+=1;
          newSquare = [
            vec2(-width/2+ offset+both*(j-spaceRight) +stagger, height-i*both),
            vec2(width/2+ offset+both*(j-spaceRight) +stagger, height-i*both),
            vec2(width/2+ offset+both*(j-spaceRight) +stagger, height - width-i*both),
            vec2(-width/2+ offset+both*(j-spaceRight) +stagger, height-i*both),
            vec2(width/2+ offset+both*(j-spaceRight) +stagger, height - width-i*both),
            vec2(-width/2+ offset+both*(j-spaceRight) +stagger, height - width-i*both)
          ];
        }
        if (skip_alien(i, j+1) == 1) {
          //console.log("skipping...");
          newSquare = [
            vec2(2, 2),
            vec2(2, 2),
            vec2(2, 2),
            vec2(2, 2),
            vec2(2, 2),
            vec2(2, 2)
          ];
        }
        else {
        gl.bufferData(gl.ARRAY_BUFFER, flatten(newSquare), gl.STATIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        row_enemies.push(newSquare);
      }
      col_enemies.push(row_enemies);
    }
  }
  return col_enemies;
}
