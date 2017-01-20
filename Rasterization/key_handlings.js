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
            pzRot += 1;
        }
        /* E cursor key */
        if (currentlyPressedKeys[69]) {
            pzRot -= 1;
        }
        /* W cursor key */
        if (currentlyPressedKeys[87]) {
            pxRot += 1;
        }
        /* S cursor key */
        if (currentlyPressedKeys[83]) {
            pxRot -= 1;
        }
        /* A cursor key */
        if (currentlyPressedKeys[65]) {
            pyRot += 1;
        }
        /* D cursor key */
        if (currentlyPressedKeys[68]) {
            pyRot -= 1;
        }
    } else {
        /* q cursor key */
        if (currentlyPressedKeys[81]) {
            pty += 0.01;
        }
        /* e cursor key */
        if (currentlyPressedKeys[69]) {
            pty -= 0.01;
        }
        /* w cursor key */
        if (currentlyPressedKeys[87]) {
            ptz += 0.01;
        }
        /* s cursor key */
        if (currentlyPressedKeys[83]) {
            ptz -= 0.01;
        }
        /* a cursor key */
        if (currentlyPressedKeys[65]) {
            ptx += 0.01;
        }
        /* d cursor key */
        if (currentlyPressedKeys[68]) {
            ptx -= 0.01;
        }
    }

    if (currentlyPressedKeys[37]) {
        sleep(100);
        current_sphere = 5;
        current_set = 0;
        if (current_triangle >= 3) {
            current_triangle = 0;
        } else current_triangle += 1;
    } else if (currentlyPressedKeys[39]) {
        sleep(100);
        current_sphere = 5;
        current_set = 0;
        if (current_triangle == 0) {
            current_triangle = 3;
        } else current_triangle -= 1;
    } else if (currentlyPressedKeys[38]) {
        sleep(100);
        current_triangle = 4;
        current_set = 1;
        if (current_sphere >= 4) {
            current_sphere = 0;
        } else current_sphere += 1;
    } else if (currentlyPressedKeys[40]) {
        sleep(100);
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
                tri_rot_z[current_triangle] -= 1;
            sph_rot_z[current_sphere] -= 1;
        }
        if (currentlyPressedKeys[73]) {
            // P cursor key
            if (current_set == 0)
                tri_rot_z[current_triangle] += 1;
            sph_rot_z[current_sphere] += 1;
        }
        if (currentlyPressedKeys[76]) {
            // O cursor key
            if (current_set == 0)
                tri_rot_x[current_triangle] -= 1;
            sph_rot_x[current_sphere] -= 1;
        }
        if (currentlyPressedKeys[79]) {
            // L cursor key
            if (current_set == 0)
                tri_rot_x[current_triangle] += 1;
            sph_rot_x[current_sphere] += 1;
        }
        if (currentlyPressedKeys[186]) {
            // K cursor key
            if (current_set == 0)
                tri_rot_y[current_triangle] -= 1;
            sph_rot_y[current_sphere] -= 1;
        }
        if (currentlyPressedKeys[75]) {
            // ; cursor key
            if (current_set == 0)
                tri_rot_y[current_triangle] += 1;
            sph_rot_y[current_sphere] += 1;
        }
    } else {
        // translation
        if (currentlyPressedKeys[79]) {
            // o cursor key
            if (current_set == 0)
                tri_trans_z[current_triangle] -= 0.01;
            sph_trans_z[current_sphere] -= 0.01;
        }
        if (currentlyPressedKeys[76]) {
            // l cursor key
            if (current_set == 0)
                tri_trans_z[current_triangle] += 0.01;
            sph_trans_z[current_sphere] += 0.01;
        }
        if (currentlyPressedKeys[75]) {
            // k cursor key
            if (current_set == 0)
                tri_trans_x[current_triangle] -= 0.01;
            sph_trans_x[current_sphere] -= 0.01;
        }
        if (currentlyPressedKeys[186]) {
            // ; cursor key
            if (current_set == 0)
                tri_trans_x[current_triangle] += 0.01;
            sph_trans_x[current_sphere] += 0.01;
        }
        if (currentlyPressedKeys[73]) {
            // i cursor key
            if (current_set == 0)
                tri_trans_y[current_triangle] -= 0.01;
            sph_trans_y[current_sphere] -= 0.01;
        }
        if (currentlyPressedKeys[80]) {
            // p cursor key
            if (current_set == 0)
                tri_trans_y[current_triangle] += 0.01;
            sph_trans_y[current_sphere] += 0.01;
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
