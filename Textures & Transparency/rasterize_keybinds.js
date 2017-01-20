/* Program: Rendering spheres and triangles using rasterization
 * Author: Prathamesh Prabhudesai
 * Student Id: 200111145
 * Unity Id: ppprabhu
 *
 * References:
 * 1. Learning WebGl - http://learningwebgl.com/blog/?page_id=1217
 * (most of the code is referred from this)
 * 2. Mozilla Developer Network - WebGL Support
 */
/* GLOBAL CONSTANTS AND VARIABLES */

/* declaration and assignment of globals */
const WIN_Z = 0;  // default graphics window z coord in world space
const WIN_LEFT = 0; const WIN_RIGHT = 1;  // default left and right x coords in world space
const WIN_BOTTOM = 0; const WIN_TOP = 1;  // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "https://ncsucgclass.github.io/prog3/triangles.json"; // triangles file loc
const INPUT_SPHERES_URL = "https://ncsucgclass.github.io/prog3/spheres.json"; // spheres file loc
const REPO_URL = "https://ncsucgclass.github.io/prog3/";
var Eye = new vec4.fromValues(0.5,0.5,-0.5,1.0); // default eye position in world space
var lightLocation = [2,4,-0.5]; //light location
var gl = null; // the all powerful gl object. It's all here folks!
var shaderProgram; // shader program
var inputTriangles = getJSONFile(INPUT_TRIANGLES_URL,"triangles"); //input triangles
var inputSpheres = getJSONFile(INPUT_SPHERES_URL,"spheres"); // input spheres

// Buffers
var vertexBuffer; // this contains vertex coordinates in triples
var triangleBuffer; // this contains indices into vertexBuffer in triples
var normalBuffer; // normal buffer
var textureBuffer;
var sphereVertexPositionBuffer; // sphere vertex position buffer
var sphereVertexNormalBuffer; // sphere vertex normal buffer
var sphereVertexIndexBuffer; // sphere index buffer
var triBufferSize = 0; // the number of indices in the triangle buffer


// Different Attributes
var vertexPositionAttrib; // where to put position for vertex shader
var vertexColorAttribute; // color attribute for vertices
var vertexNormalAttribute; // normal attribute for vertices
var vertexTextureAttribute;

// Texture Variables
var textureCount = 0;
var shapeTexture = new Array();
var samplerUniform;
var triangleTextureMap = new Array();
var sphereTextureMap = new Array();
var texureIndex = 0;

// Shape Variables
var sortedTriangles;
var sortedSpheres;

//Viewport Properties
var mvMatrix = mat4.create(); // model view matrix
var pMatrix = mat4.create(); // perspective matrix
var nMatrix = mat3.create(); // normal matrix
var lookAt = mat4.create(); // lookat matrix
var mTriangles = new Array();
var mSpheres = new Array();

// Material Properties
var ambient = []; // ambient color
var diffuse = []; // diffuse color
var specular = []; // specular color
var factor = 0; // specular factor
var alpha;

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
var filter = 0;
var currentlyPressedKeys = {}; // array for current key pressings

/* Functions required for execution */

// Delay function - to create delay between keypresses - referred from https://www.sitepoint.com/delay-sleep-pause-wait/

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

  var imageCanvas = document.getElementById("myImageCanvas"); // create a 2d canvas
    var cw = imageCanvas.width, ch = imageCanvas.height;
    imageContext = imageCanvas.getContext("2d");
    var bkgdImage = new Image();
    bkgdImage.src = "https://ncsucgclass.github.io/prog3/stars.jpg";
    bkgdImage.onload = function(){
      var iw = bkgdImage.width, ih = bkgdImage.height;
      imageContext.drawImage(bkgdImage,0,0,iw,ih,0,0,cw,ch);
    } // end onload callback

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


function createSortedSets(){
    if (inputTriangles != String.null) sortedTriangles = createSortedSet(0,inputTriangles);
    if (inputSpheres != String.null) sortedSpheres = createSortedSet(1,inputSpheres);
}

function createSortedSet(shape,input){
var sortedArrayTransparent = new Array();
var sortedArrayOpaque = new Array();
var alphas = new Array();

if(shape){
    for(var i = 0; i < input.length; i++) alphas.push(input[i].alpha)
    alphas.sort(); alphas.reverse();
    for(var i = 0; i < input.length; i++){
      for(var j = 0; j < input.length; j++){
        if(alphas[i] == input[j].alpha){
          if(alphas[i] == 1)
            sortedArrayOpaque.push(j);
          else
            sortedArrayTransparent.push(j);
        }
      }
    }
  }
  else{
    for(var i = 0; i < input.length; i++) alphas.push(input[i].material.alpha)
    alphas.sort(); alphas.reverse();
    for(var i = 0; i < input.length; i++){
      for(var j = 0; j < input.length; j++){
        if(alphas[i] == input[j].material.alpha){
          if(alphas[i] == 1)
            sortedArrayOpaque.push(j);
          else
            sortedArrayTransparent.push(j);
        }
      }
    }
  }
return [sortedArrayOpaque,sortedArrayTransparent];
}


// read and render triangles
function loadTriangles(transparency) {
    var myset;
    if (inputTriangles != String.null) {
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set

        if(transparency) myset = sortedTriangles[1];
        else myset = sortedTriangles[0];

      for (var genIndex=0; genIndex<myset.length; genIndex++) {
          var whichSet = myset[genIndex];
          triBufferSize = 0;
          var coordArray = []; // 1D array of vertex coords for WebGL
          var indexArray = []; // 1D array of vertex indices for WebGL
          var textureArray = [];
          var vtxBufferSize = 0; // the number of vertices in the vertex buffer
          var vtxToAdd = []; // vtx coords to add to the coord array
          var indexOffset = vec3.create(); // the index offset for the current set
          var triToAdd = vec3.create(); // tri indices to add to the index array
          var normalArray = []; //1D array of normals
          var normalToAdd = []; //1D array to add normal data
          var textureToAdd = [];
          vec3.set(indexOffset,vtxBufferSize,vtxBufferSize,vtxBufferSize); // update vertex offset

          // set up the vertex coord array
          for (whichSetVert=0; whichSetVert<inputTriangles[whichSet].vertices.length; whichSetVert++) {
            vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
            coordArray.push(vtxToAdd[0],vtxToAdd[1],vtxToAdd[2]);
            // color components
            ambient = inputTriangles[whichSet].material.ambient;
            diffuse = inputTriangles[whichSet].material.diffuse;
            specular = inputTriangles[whichSet].material.specular;
            factor = inputTriangles[whichSet].material.n*2;
            alpha = inputTriangles[whichSet].material.alpha;
            // normals
            normalToAdd = inputTriangles[whichSet].normals[whichSetVert];
            normalArray.push(normalToAdd[0],normalToAdd[1],normalToAdd[2]);
            //texture
            textureToAdd = inputTriangles[whichSet].uvs[whichSetVert];
            textureArray.push(textureToAdd[0],textureToAdd[1]);

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

          // texture buffer
          textureBuffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffer);
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureArray),gl.STATIC_DRAW);

          if(whichSet == current_triangle){ //checking if the current triangle
            // Change color
            ambient = [0.5,0.5,0];
            diffuse = [0.5,0.5,0];
            specular = [0,0,0];
            alpha = 1;
          }

          // send the color components to webGL
          gl.uniform3fv(shaderProgram.uAmbientColor,ambient);
          gl.uniform3fv(shaderProgram.uDiffuseColor,diffuse);
          gl.uniform3fv(shaderProgram.uSpecularColor,specular);
          gl.uniform1f(shaderProgram.specular_exponent,factor);
          gl.uniform1f(shaderProgram.alphaTransparency,alpha);

          // calculate rotation and translation
          Rotation = [tri_rot_x[whichSet],tri_rot_y[whichSet],tri_rot_z[whichSet]];
          Translation = [tri_trans_x[whichSet],tri_trans_y[whichSet],tri_trans_z[whichSet]];
          triBufferSize *= 3;

          // create model view matrix and look at matrix
          createModelViewMatrix([0,0,0],0,Translation,Rotation);
          createNMatrix();
          setMatrixUniforms();

          renderTriangles(0,whichSet);
        } // end for each triangle set
    } // end if triangles found
} // end load triangles

// load & render Spheres
function loadSpheres(transparency) {
  var myset;
  if (inputSpheres != String.null) {
    if(transparency) myset = sortedSpheres[1];
    else myset = sortedSpheres[0];
    var n = myset.length;
    for (var genIndex=0; genIndex<n; genIndex++) {
      var s = myset[genIndex];
      // center & radius of the sphere
      var center = [inputSpheres[s].x,inputSpheres[s].y,inputSpheres[s].z];
      var radius = inputSpheres[s].r;
      // latitude & longitudes - will decide sphericalness
      var latitudeBands = 30;
      var longitudeBands = 30;
      var vertexPositionData = []; // vertex positions
      var normalData = []; // normal data
      var textureData = [];

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
              // texture
              textureData.push(u);
              textureData.push(v);
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

      // texture buffer
      textureBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(textureData),gl.STATIC_DRAW);


      // color components
      ambient = inputSpheres[s].ambient;
      diffuse = inputSpheres[s].diffuse;
      specular = inputSpheres[s].specular;
      factor = parseFloat(inputSpheres[s].n)*2;
      alpha = parseFloat(inputSpheres[s].alpha);
      if(s == current_sphere){ // check if the current sphere is selected
        ambient = [0.5,0.5,0];
        diffuse = [0.5,0.5,0];
        specular = [0,0,0];
        alpha = 1;
      }

      // send colors to webGL
      gl.uniform3fv(shaderProgram.uAmbientColor,ambient);
      gl.uniform3fv(shaderProgram.uDiffuseColor,diffuse);
      gl.uniform3fv(shaderProgram.uSpecularColor,specular);
      gl.uniform1f(shaderProgram.specular_exponent,factor);
      gl.uniform1f(shaderProgram.alphaTransparency,alpha);
      // calculate rotation & translation
      Rotation = [sph_rot_x[s],sph_rot_y[s],sph_rot_z[s]];
      Translation = [sph_trans_x[s],sph_trans_y[s],sph_trans_z[s]];

      // model view and look at matrix
      createModelViewMatrix([center[0],center[1],0.5],1,Translation,Rotation);
      createNMatrix();
      setMatrixUniforms();
      triBufferSize = indexData.length;
      renderTriangles(1,s);
    }
  }
}


// send matrices to webGL

// setup the webGL shaders

// rendering triangles
function renderTriangles(shape,index) {
  // vertex buffer: activate and feed into vertex shader
  //check if you want to load texture or not
  if(shape == 0){
    var myShape = inputTriangles;
    if(myShape[index].material.texture == false)
      gl.uniform1i(shaderProgram.texturePresence,0);
    else
      gl.uniform1i(shaderProgram.texturePresence,1);
    textureIndex = triangleTextureMap[index];
  }

  else{
    var myShape = inputSpheres;
    if(myShape[index].texture == false)
      gl.uniform1i(shaderProgram.texturePresence,0);
    else
      gl.uniform1i(shaderProgram.texturePresence,1);
    textureIndex = sphereTextureMap[index];
    }

  // bind all the buffers

  gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer); // activate
  gl.vertexAttribPointer(vertexPositionAttrib,3,gl.FLOAT,false,0,0); // feed

  gl.bindBuffer(gl.ARRAY_BUFFER,normalBuffer);
  gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);

  //texture Buffer
  gl.bindBuffer(gl.ARRAY_BUFFER,textureBuffer);
  gl.vertexAttribPointer(vertexTextureAttribute,2,gl.FLOAT,false,0,0);

  // activate the texture and load it

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, shapeTexture[textureIndex]);
  gl.uniform1i(samplerUniform, 0);

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, shapeTexture[textureIndex].image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

  // triangle buffer: activate and render
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,triangleBuffer); // activate
  gl.drawElements(gl.TRIANGLES,triBufferSize,gl.UNSIGNED_SHORT,0); // render

} // end render triangles


function tick() {

  requestAnimationFrame(tick);
  handleKeys();
  gl.clear(/*gl.COLOR_BUFFER_BIT|*/ gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
  loadTriangles(0);
  loadSpheres(0);
  gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
  gl.enable(gl.BLEND);
  gl.depthMask(false);
  loadTriangles(1);
  loadSpheres(1);
  gl.disable(gl.BLEND);
  gl.depthMask(true);

}


/* MAIN -- HERE is where execution begins after window load */

function main() {
  setupWebGL(); // set up the webGL environment
  setupShaders();// setup the webGL shaders
  initialize_plane();
  initialize_objects();
  createPerspectiveMatrix();
  gl.clear(/*gl.COLOR_BUFFER_BIT |*/ gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
  gl.uniform3fv(shaderProgram.LightLocation, lightLocation);
  gl.uniform3fv(shaderProgram.eyeLocation, [Eye[0],Eye[1],Eye[2]]);
  initialize_textures();
  createSortedSets();
  document.onkeydown = handleKeyDown; // in key_bindings.js
  document.onkeyup = handleKeyUp; //  in key_bindings.js
  tick(); // animation frame
} // end main