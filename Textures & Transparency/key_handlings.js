function initialize_plane(){ ptx=0; pty=0; ptz=0; pxRot=0; pyRot=0; pzRot=0; }

function initialize_objects(){
tri_trans_x = vec4.fromValues(0,0,0,0); tri_trans_y = vec4.fromValues(0,0,0,0); tri_trans_z = vec4.fromValues(0,0,0,0);
tri_rot_x = vec4.fromValues(0,0,0,0); tri_rot_y = vec4.fromValues(0,0,0,0); tri_rot_z = vec4.fromValues(0,0,0,0);
sph_trans_x = [0,0,0,0,0]; sph_trans_y = [0,0,0,0,0]; sph_trans_z = [0,0,0,0,0];
sph_rot_x = [0,0,0,0,0]; sph_rot_y = [0,0,0,0,0]; sph_rot_z = [0,0,0,0,0];}


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}



function handleKeyDown(event) {
  currentlyPressedKeys[event.keyCode] = true;
  if (String.fromCharCode(event.keyCode) == "F") {
    filter += 1;
    if (filter == 3) {
      filter = 0;
    }
  }
}
function handleKeyUp(event) {
  currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
    // rotation
    if (currentlyPressedKeys[16]) {
        /* Q cursor key */
        if (currentlyPressedKeys[81]) {
            pzRot += 2;
        }
        /* E cursor key */
        if (currentlyPressedKeys[69]) {
            pzRot -= 2;
        }
        /* W cursor key */
        if (currentlyPressedKeys[87]) {
            pxRot += 2;
        }
        /* S cursor key */
        if (currentlyPressedKeys[83]) {
            pxRot -= 2;
        }
        /* A cursor key */
        if (currentlyPressedKeys[65]) {
            pyRot += 2;
        }
        /* D cursor key */
        if (currentlyPressedKeys[68]) {
            pyRot -= 2;
        }
    } else {
        /* q cursor key */
        if (currentlyPressedKeys[81]) {
            pty += 0.05;
        }
        /* e cursor key */
        if (currentlyPressedKeys[69]) {
            pty -= 0.05;
        }
        /* w cursor key */
        if (currentlyPressedKeys[87]) {
            ptz += 0.05;
        }
        /* s cursor key */
        if (currentlyPressedKeys[83]) {
            ptz -= 0.05;
        }
        /* a cursor key */
        if (currentlyPressedKeys[65]) {
            ptx += 0.05;
        }
        /* d cursor key */
        if (currentlyPressedKeys[68]) {
            ptx -= 0.05;
        }
    }

    if (currentlyPressedKeys[37]) {
        sleep(10);
        current_sphere = 5;
        current_set = 0;
        if (current_triangle >= 3) {
            current_triangle = 0;
        } else current_triangle += 1;
    } else if (currentlyPressedKeys[39]) {
        sleep(10);
        current_sphere = 5;
        current_set = 0;
        if (current_triangle == 0) {
            current_triangle = 3;
        } else current_triangle -= 1;
    } else if (currentlyPressedKeys[38]) {
        sleep(10);
        current_triangle = 4;
        current_set = 1;
        if (current_sphere >= 4) {
            current_sphere = 0;
        } else current_sphere += 1;
    } else if (currentlyPressedKeys[40]) {
        sleep(10);
        current_triangle = 4;
        current_set = 1;
        if (current_sphere == 0) {
            current_sphere = 4;
        } else current_sphere -= 1;
    }


    // rotation
    if (currentlyPressedKeys[16]) {
        if (currentlyPressedKeys[80]) {
            // I cursor key
            if (current_set == 0)
                tri_rot_z[current_triangle] -= 5;
            sph_rot_z[current_sphere] -= 5;
        }
        if (currentlyPressedKeys[73]) {
            // P cursor key
            if (current_set == 0)
                tri_rot_z[current_triangle] += 5;
            sph_rot_z[current_sphere] += 5;
        }
        if (currentlyPressedKeys[76]) {
            // O cursor key
            if (current_set == 0)
                tri_rot_x[current_triangle] -= 5;
            sph_rot_x[current_sphere] -= 5;
        }
        if (currentlyPressedKeys[79]) {
            // L cursor key
            if (current_set == 0)
                tri_rot_x[current_triangle] += 5;
            sph_rot_x[current_sphere] += 5;
        }
        if (currentlyPressedKeys[186]) {
            // K cursor key
            if (current_set == 0)
                tri_rot_y[current_triangle] -= 5;
            sph_rot_y[current_sphere] -= 5;
        }
        if (currentlyPressedKeys[75]) {
            // ; cursor key
            if (current_set == 0)
                tri_rot_y[current_triangle] += 5;
            sph_rot_y[current_sphere] += 5;
        }
    } else {
        // translation
        if (currentlyPressedKeys[79]) {
            // o cursor key
            if (current_set == 0)
                tri_trans_z[current_triangle] -= 0.1;
            sph_trans_z[current_sphere] -= 0.1;
        }
        if (currentlyPressedKeys[76]) {
            // l cursor key
            if (current_set == 0)
                tri_trans_z[current_triangle] += 0.1;
            sph_trans_z[current_sphere] += 0.1;
        }
        if (currentlyPressedKeys[75]) {
            // k cursor key
            if (current_set == 0)
                tri_trans_x[current_triangle] -= 0.1;
            sph_trans_x[current_sphere] -= 0.1;
        }
        if (currentlyPressedKeys[186]) {
            // ; cursor key
            if (current_set == 0)
                tri_trans_x[current_triangle] += 0.1;
            sph_trans_x[current_sphere] += 0.1;
        }
        if (currentlyPressedKeys[73]) {
            // i cursor key
            if (current_set == 0)
                tri_trans_y[current_triangle] -= 0.1;
            sph_trans_y[current_sphere] -= 0.1;
        }
        if (currentlyPressedKeys[80]) {
            // p cursor key
            if (current_set == 0)
                tri_trans_y[current_triangle] += 0.1;
            sph_trans_y[current_sphere] += 0.1;
        }
    }

    if (currentlyPressedKeys[27]) {
        initialize_plane();
    }

    if (currentlyPressedKeys[8]) {
        initialize_objects();
    }

    if (currentlyPressedKeys[32]) {
        current_triangle = 4;
        current_sphere = 5;
    }

}
