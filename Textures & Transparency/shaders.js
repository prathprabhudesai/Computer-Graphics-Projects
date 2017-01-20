function setupShaders() {

  // define fragment shader in essl using es6 template strings
  var fShaderCode = `

  precision mediump float;

  varying lowp vec3 vColor;
  varying vec2 vTextureCoord;
  uniform float uAlpha;
  uniform sampler2D uSampler;
  uniform bool isTexture;

  void main(void) {
     if(isTexture){
     vec4 textureColor = texture2D(uSampler,vec2(vTextureCoord.s,vTextureCoord.t));    ; // all fragments are white
      gl_FragColor = vec4(textureColor.rgb*vColor, textureColor.a*uAlpha);
       }
    else
      gl_FragColor = vec4(vColor,1.0);
 }
 `;

  // define vertex shader in essl using es6 template strings
  var vShaderCode = `

    attribute vec3 vertexPosition;
    attribute vec4 vertexColor;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    uniform mat3 uNMatrix;
    varying lowp vec3 vColor;
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


    uniform float uSpecularExponent;

    //attribute vec2 aTextureCoord;

    varying vec2 vTextureCoord;


    void main(void) {
      // referred from WebGL lessons
      gl_Position = uPMatrix*uMVMatrix*vec4(vertexPosition, 1.0); // use the untransformed position
      vec4 mvPosition = uMVMatrix*vec4(vertexPosition,1.0);
      vec3 lightDirection = normalize(uPointLightingLocation - mvPosition.xyz);
      vec3 transformedNormal = uNMatrix * aVertexNormal;
      float directionalLightWeighting = max(dot(transformedNormal, lightDirection), 0.0);
      vec3 halfVector = normalize(lightDirection + normalize(-mvPosition.xyz + eyeLocation));
      float specularFactor = pow(max(dot(transformedNormal,halfVector),0.0),uSpecularExponent);
      vLightWeighting = uAmbientColor + uDiffuseColor * directionalLightWeighting + uSpecularColor * specularFactor;
      vColor = vec3(vLightWeighting[0],vLightWeighting[1],vLightWeighting[2]);
      vTextureCoord = aTextureCoord;
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

        vertexTextureAttribute = gl.getAttribLocation(shaderProgram,"aTextureCoord");
        gl.enableVertexAttribArray(vertexTextureAttribute);

        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
        shaderProgram.specular_exponent = gl.getUniformLocation(shaderProgram,"uSpecularExponent");
        shaderProgram.LightLocation = gl.getUniformLocation(shaderProgram,"uPointLightingLocation");
        shaderProgram.uAmbientColor = gl.getUniformLocation(shaderProgram,"uAmbientColor");
        shaderProgram.uDiffuseColor = gl.getUniformLocation(shaderProgram,"uDiffuseColor");
        shaderProgram.uSpecularColor = gl.getUniformLocation(shaderProgram,"uSpecularColor");
        shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram,"uSampler");
        shaderProgram.alphaTransparency = gl.getUniformLocation(shaderProgram,"uAlpha");
        shaderProgram.texturePresence = gl.getUniformLocation(shaderProgram,"isTexture");
      } // end if no shader program link errors
    } // end if no compile errors
  } // end try

  catch(e) {
    console.log(e);
  } // end catch
} // end setup shaders
