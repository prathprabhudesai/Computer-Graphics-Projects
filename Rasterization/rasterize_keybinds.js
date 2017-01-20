/* Program: Rendering spheres and triangles using rasterization
 * Author: Prathamesh Prabhudesai
 * Student Id: 200111145
 * Unity Id: ppprabhu
 *
 * References:
 * 1. Learning WebGl - http://learningwebgl.com/blog/?page_id=1217
 * (most of the code is referred from this)
 */
/* GLOBAL CONSTANTS AND VARIABLES */

/* declaration and assignment of globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog2/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog2/spheres.json"; // spheres file loc
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
var triBufferSize = 0; // the number of indices in the triangle buffer
var vertexPositionAttrib; // where to put position for vertex shader
var mvMatrix = mat4.create(); // model view matrix
var pMatrix = mat4.create(); // perspective matrix
var nMatrix = mat3.create(); // normal matrix
var lookAt = mat4.create(); // lookat matrix
var shaderProgram; // shader program
var normalBuffer; // normal buffer
var vertexColorAttribute; // color attribute for vertices
var vertexNormalAttribute; // normal attribute for vertices
var lightLocation = [2,4,-0.5]; //light location
var ambient = []; // ambient color
var diffuse = []; // diffuse color
var specular = []; // specular color
var factor = 0; // specular factor
var sphereVertexPositionBuffer; // sphere vertex position buffer
var sphereVertexNormalBuffer; // sphere vertex normal buffer
var sphereVertexIndexBuffer; // sphere index buffer

/* plane translation and rotation globals */
var ptx; var pty; var ptz; // translation
var pxRot; var pyRot; var pzRot; //rotation

/* triangle translation and rotation globals */
var tri_trans_x; var tri_trans_y; var tri_trans_z; //translation matrix - all triangles
var tri_rot_x; var tri_rot_y; var tri_rot_z; // rotation matrix - all triangles

/* sphere translation and rotation globals */
var sph_trans_x; var sph_trans_y; var sph_trans_z; //translation matrix - all spheres
var sph_rot_x; var sph_rot_y; var sph_rot_z; // rotation matrix - all spheres

/* Rotation and Translation for a particular object */
var Rotation; var Translation;

/* Current Figure */
var current_triangle = 4;
var current_sphere = 5;
var current_set = 0;


function initialize_plane(){ ptx=0; pty=0; ptz=0; pxRot=0; pyRot=0; pzRot=0; }

function initialize_objects(){
tri_trans_x = vec4.fromValues(0,0,0,0); tri_trans_y = vec4.fromValues(0,0,0,0); tri_trans_z = vec4.fromValues(0,0,0,0);
tri_rot_x = vec4.fromValues(0,0,0,0); tri_rot_y = vec4.fromValues(0,0,0,0); tri_rot_z = vec4.fromValues(0,0,0,0);
sph_trans_x = [0,0,0,0,0]; sph_trans_y = [0,0,0,0,0]; sph_trans_z = [0,0,0,0,0];
sph_rot_x = [0,0,0,0,0]; sph_rot_y = [0,0,0,0,0]; sph_rot_z = [0,0,0,0,0];}

var filter = 0;
var currentlyPressedKeys = {}; // array for current key pressings

/* Functions required for execution */

// Delay function - to create delay between keypresses - referred from https://www.sitepoint.com/delay-sleep-pause-wait/
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

// get the JSON file from the passed URL
function getJSONFile(url,descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string"))
            throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET",url,false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now()-startTime) > 3000)
                    break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE))
                throw "Unable to open "+descr+" file!";
            else
                return JSON.parse(httpReq.response);
        } // end if good params
    } // end try

    catch(e) {
        console.log(e);
        return(String.null);
    }
} // end get input spheres

// set up the webGL environment
function setupWebGL() {

   // Get the canvas and context
     var canvas = document.getElementById("glcanvas"); // create a js canvas
     gl = canvas.getContext("webgl"); // get a webgl object from it

    try {
      if (gl == null) {
        throw "unable to create gl context -- is your browser gl ready?";
      } else {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // use black when we clear the frame buffer
        gl.clearDepth(1.0); // use max when we clear the depth buffer
        gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
      }
    } // end try
    catch(e) {
      console.log(e);
    } // end catch

} // end setupWebGL

// read and render triangles
function loadTriangles() {
    var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles");

    if (inputTriangles != String.null) {
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set

        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
          triBufferSize = 0;
          var coordArray = []; // 1D array of vertex coords for WebGL
          var indexArray = []; // 1D array of vertex indices for WebGL
          var vtxBufferSize = 0; // the number of vertices in the vertex buffer
          var vtxToAdd = []; // vtx coords to add to the coord array
          var indexOffset = vec3.create(); // the index offset for the current set
          var triToAdd = vec3.create(); // tri indices to add to the index array
          var normalArray = []; //1D array of normals
          var normalToAdd = []; //1D array to add normal data
          vec3.set(indexOffset,vtxBufferSize,vtxBufferSize,vtxBufferSize); // update vertex offset

          // set up the vertex coord array
          for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
            vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
            coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
            // color components
            ambient = inputTriangles[whichSet].material.ambient;
            diffuse = inputTriangles[whichSet].material.diffuse;
            specular = inputTriangles[whichSet].material.specular;
            factor = inputTriangles[whichSet].material.n;
            // normals
            normalToAdd = inputTriangles[whichSet].normals[whichSetVert];
            normalArray.push(normalToAdd[0],normalToAdd[1],normalToAdd[2]);
          } // end for vertices in set

          // set up the triangle index array, adjusting indices across sets
          for (whichSetTri=0; whichSetTri<inputTriangles[whichSet].triangles.length; whichSetTri++) {
            vec3.add(triToAdd,indexOffset,inputTriangles[whichSet].triangles[whichSetTri]);
            indexArray.push(triToAdd[0],triToAdd[1],triToAdd[2]);
          } // end for triangles in set

          vtxBufferSize += inputTriangles[whichSet].vertices.length; // total number of vertices
          triBufferSize += inputTriangles[whichSet].triangles.length; // total number of tris

          // send the vertex coords to webGL
          vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
          gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate that buffer
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(coordArray),gl.STATIC_DRAW); // coords to that buffer

          // send the triangle indices to webGL
          triangleBuffer = gl.createBuffer(); // init empty triangle index buffer
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate that buffer
          gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexArray),gl.STATIC_DRAW); // indices to that buffer

          // send the normal data to webGL
          normalBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normalArray),gl.STATIC_DRAW);

          if(whichSet == current_triangle){ //checking if the current triangle
            // Change color
            ambient = [0.5,0.5,0];
            diffuse = [0.5,0.5,0];
            specular = [0,0,0];
          }

          // send the color components to webGL
          gl.uniform3fv(shaderProgram.uAmbientColor,ambient);
          gl.uniform3fv(shaderProgram.uDiffuseColor,diffuse);
          gl.uniform3fv(shaderProgram.uSpecularColor,specular);
          gl.uniform1f(shaderProgram.specular_exponent,factor);


          // calculate rotation and translation
          Rotation = [tri_rot_x[whichSet],tri_rot_y[whichSet],tri_rot_z[whichSet]];
          Translation = [tri_trans_x[whichSet],tri_trans_y[whichSet],tri_trans_z[whichSet]];
          triBufferSize *= 3;

          // create model view matrix and look at matrix
          createModelViewMatrix([0,0,0],0,Translation,Rotation);
          createNMatrix();
          setMatrixUniforms();

          // render triangles
          renderTriangles();
        } // end for each triangle set
    } // end if triangles found
} // end load triangles

// load & render Spheres
function loadSpheres() {
  var inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres");

  if (inputSpheres != String.null) {
    var n = inputSpheres.length;
    for (var s=0; s<n; s++) {
      // center & radius of the sphere
      var center = [inputSpheres[s].x,inputSpheres[s].y,inputSpheres[s].z];
      var radius = inputSpheres[s].r;
      // latitude & longitudes - will decide sphericalness
      var latitudeBands = 40;
      var longitudeBands = 40;
      var vertexPositionData = []; // vertex positions
      var normalData = []; // normal data

      // referred - WebGL lesson 11 - http://learningwebgl.com/blog/?p=1253
      for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
	var theta = latNumber * Math.PI / latitudeBands;
	var sinTheta = Math.sin(theta);
	var cosTheta = Math.cos(theta);
	    for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
	      var phi = longNumber * 2 * Math.PI / longitudeBands;
	      var sinPhi = Math.sin(phi);
	      var cosPhi = Math.cos(phi);
	      var x = cosPhi * sinTheta;
	      var y = cosTheta;
	      var z = sinPhi * sinTheta;
	      var u = 1 - (longNumber / longitudeBands);
	      var v = 1 - (latNumber / latitudeBands);
                  // normals
              normalData.push(x);
	          normalData.push(y);
	      normalData.push(z);
              // vertex position
	      vertexPositionData.push(radius * x);
	      vertexPositionData.push(radius * y);
	      vertexPositionData.push(radius * z);
	    }
      }
      // Adding indices for triangles generated
      var indexData = [];
      for (latNumber = 0; latNumber < latitudeBands; latNumber++) {
	for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
	  var first = (latNumber * (longitudeBands + 1)) + longNumber;
	  var second = first + longitudeBands + 1;
	  indexData.push(first);
	  indexData.push(second);
	      indexData.push(first + 1);
	  indexData.push(second);
	  indexData.push(second + 1);
	  indexData.push(first + 1);
	}
      }

      // send the vertex coords to webGL
      vertexBuffer = gl.createBuffer(); // init empty vertex coord buffer
      gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate that buffer
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexPositionData),gl.STATIC_DRAW); // coords to that buffer

      // send the triangle indices to webGL
      triangleBuffer = gl.createBuffer(); // init empty triangle index buffer
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer); // activate that buffer
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexData),gl.STATIC_DRAW); // indices to that buffer

      // normal buffer
      normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(normalData),gl.STATIC_DRAW);

      // color components
      ambient = inputSpheres[s].ambient;
      diffuse = inputSpheres[s].diffuse;
      specular = inputSpheres[s].specular;
      factor = parseFloat(inputSpheres[s].n);
      if(s == current_sphere){ // check if the current sphere is selected
        ambient = [0.5,0.5,0];
        diffuse = [0.5,0.5,0];
        specular = [0,0,0];
      }

      // send colors to webGL
      gl.uniform3fv(shaderProgram.uAmbientColor,ambient);
      gl.uniform3fv(shaderProgram.uDiffuseColor,diffuse);
      gl.uniform3fv(shaderProgram.uSpecularColor,specular);
      gl.uniform1f(shaderProgram.specular_exponent,factor);

      // calculate rotation & translation
      Rotation = [sph_rot_x[s],sph_rot_y[s],sph_rot_z[s]];
      Translation = [sph_trans_x[s],sph_trans_y[s],sph_trans_z[s]];

      // model view and look at matrix
      createModelViewMatrix([center[0],center[1],0.5],1,Translation,Rotation);
      createNMatrix();
      setMatrixUniforms();
      triBufferSize = indexData.length;

      // render
      renderTriangles();
    }
  }
}


// send matrices to webGL
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

// setup the webGL shaders
function setupShaders() {

  // define fragment shader in essl using es6 template strings
  var fShaderCode = `
  varying lowp vec4 vColor;

  void main(void) {
    gl_FragColor = vColor; // all fragments are white
  }
  `;

  // define vertex shader in essl using es6 template strings
  var vShaderCode = `
  attribute vec3 vertexPosition;
  attribute vec4 vertexColor;
      uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat3 uNMatrix;
    varying lowp vec4 vColor;
    attribute vec3 aVertexPosition;
    attribute vec3 aVertexNormal;
    attribute vec2 aTextureCoord;
    uniform vec3 uDiffuseColor;
    uniform vec3 uAmbientColor;
    uniform vec3 uSpecularColor;
    uniform vec3 uPointLightingLocation;
    uniform vec3 uPointLightingColor;
    uniform bool uUseLighting;
    varying vec3 vLightWeighting;
    uniform vec3 eyeLocation;
    float uSpecularExponent;

    void main(void) {
      // referred from WebGL lessons
      gl_Position = uPMatrix*uMVMatrix*vec4(vertexPosition, 1); // use the untransformed position
      vec4 mvPosition = uMVMatrix*vec4(vertexPosition,1);
      vec3 lightDirection = normalize(uPointLightingLocation - mvPosition.xyz);
      vec3 transformedNormal = uNMatrix * aVertexNormal;
      float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
      vec3 halfVector = normalize(lightDirection + normalize(-mvPosition.xyz + eyeLocation));
      float specularFactor = clamp(pow(max(dot(transformedNormal,halfVector),0.0),10.0),0.0,1.0);
      vLightWeighting = uAmbientColor + uDiffuseColor * directionalLightWeighting + uSpecularColor * specularFactor;
      vColor = vec4(vLightWeighting[0],vLightWeighting[1],vLightWeighting[2],1);
    }
  `;

  try {
    var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
    gl.shaderSource(fShader,fShaderCode); // attach code to shader
    gl.compileShader(fShader); // compile the code for gpu execution

    var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
    gl.shaderSource(vShader,vShaderCode); // attach code to shader
    gl.compileShader(vShader); // compile the code for gpu execution

    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
      throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
      gl.deleteShader(fShader);
    } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
      throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
      gl.deleteShader(vShader);
    } else { // no compile errors
      shaderProgram = gl.createProgram(); // create the single shader program
      gl.attachShader(shaderProgram, fShader); // put frag shader in program
      gl.attachShader(shaderProgram, vShader); // put vertex shader in program
      gl.linkProgram(shaderProgram); // link program into gl context

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
        throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
      } else { // no shader program link errors
        gl.useProgram(shaderProgram);// activate shader program (frag and vert)

        vertexPositionAttrib = gl.getAttribLocation(shaderProgram, "vertexPosition");  // get pointer to vertex shader input
        gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array

        vertexNormalAttribute = gl.getAttribLocation(shaderProgram,"aVertexNormal");
        gl.enableVertexAttribArray(vertexNormalAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.specular_exponent = gl.getUniformLocation(shaderProgram,"uSpecularExponent");
        shaderProgram.LightLocation = gl.getUniformLocation(shaderProgram,"uPointLightingLocation");
        shaderProgram.uAmbientColor = gl.getUniformLocation(shaderProgram,"uAmbientColor");
        shaderProgram.uDiffuseColor = gl.getUniformLocation(shaderProgram,"uDiffuseColor");
        shaderProgram.uSpecularColor = gl.getUniformLocation(shaderProgram,"uSpecularColor");
      } // end if no shader program link errors
    } // end if no compile errors
  } // end try

  catch(e) {
    console.log(e);
  } // end catch
} // end setup shaders

// rendering triangles
function renderTriangles() {

  // vertex buffer: activate and feed into vertex shader
  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
  gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

  gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  // triangle buffer: activate and render
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer); // activate
  gl.drawElements(gl.TRIANGLES,triBufferSize,gl.UNSIGNED_SHORT,0); // render

} // end render triangles

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}

function tick() {

  requestAnimationFrame(tick);
  handleKeys();
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
  loadTriangles();
  loadSpheres();
}


/* MAIN -- HERE is where execution begins after window load */

function main() {
  setupWebGL(); // set up the webGL environment
  setupShaders();// setup the webGL shaders
  initialize_plane();
  initialize_objects();
  createPerspectiveMatrix();

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
  gl.uniform3fv(shaderProgram.LightLocation, lightLocation);
  gl.uniform3fv(shaderProgram.eyeLocation, [Eye[0],Eye[1],Eye[2]]);

  loadTriangles(); // load and render triangles
  loadSpheres(); // load and render spheres
  document.onkeydown = handleKeyDown; // in key_bindings.js
  document.onkeyup = handleKeyUp; //  in key_bindings.js
  tick(); // animation frame
} // end main