function setMatrixUniforms() {
  gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
  gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
  gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, nMatrix);
}

// create normal matrix
function createNMatrix(){
  mat3.normalFromMat4(nMatrix,mvMatrix);
}

// create perspective matrix
function createPerspectiveMatrix() {
  mat4.perspective(pMatrix,Math.PI/2,1, 0.001,50);
}

// create look at and model view matrix
function createModelViewMatrix(center,figure,Translation, Rotation) {
  var eye = vec3.fromValues(Eye[0],Eye[1],Eye[2]);
  var up = vec3.fromValues(0,1,0);
  var center1 = vec3.fromValues(0.5,0.5,0);
  mat4.lookAt(lookAt, [eye[0] + ptx + Translation[0] , eye[1] + pty + Translation[1], eye[2] + ptz + Translation[2]] ,
              [center1[0] + ptx + Translation[0], center1[1] + pty + Translation[1], center1[2] + ptz], up);
  if(figure) { // only if sphere
    mat4.rotate(lookAt, lookAt, degToRad(pxRot + Rotation[0]), [1, 0, 0]);
    mat4.rotate(lookAt, lookAt, degToRad(pyRot + Rotation[1]), [0, 1, 0]);
    mat4.rotate(lookAt, lookAt, degToRad(pzRot + Rotation[2]), [0, 0, 1]);
  }

  mat4.identity(mvMatrix);
  mat4.translate(mvMatrix,mvMatrix, [center[0], center[1], center[2]]); // model
  mat4.rotate(mvMatrix, mvMatrix, degToRad(pxRot + Rotation[0]), [1, 0, 0]);
  mat4.rotate(mvMatrix, mvMatrix, degToRad(pyRot + Rotation[1]), [0, 1, 0]);
  mat4.rotate(mvMatrix, mvMatrix, degToRad(pzRot + Rotation[2]), [0, 0, 1]);

  mat4.mul(mvMatrix, lookAt, mvMatrix);
}

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

/*function getDepth(cameraPosition, cameraRotation, objectPosition) {
  var p0 = cameraPosition[0], p1 = cameraPosition[1], p2 = cameraPosition[2],
  q0 = cameraRotation[0], q1 = cameraRotation[1], q2 = cameraRotation[2], q3 = cameraRotation[3],
  l0 = objectPosition[0], l1 = objectPosition[1], l2 = objectPosition[2];
  return 2*(q1*q3 + q0*q2)*(l0 - p0) + 2*(q2*q3 - q0*q1)*(l1 - p1) + (1 - 2*q1*q1 - 2*q2*q2)*(l2 - p2);
}*/
