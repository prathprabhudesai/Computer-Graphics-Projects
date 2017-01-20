function initialize_textures(){

   var count = 0;
    if (inputTriangles != String.null) {
        for (var whichSet=0; whichSet<inputTriangles.length; whichSet++) {
          if(inputTriangles[whichSet].material.texture != false)
            shapeTexture.push(initTexture(REPO_URL + inputTriangles[whichSet].material.texture));
          else
            shapeTexture.push(initTexture("https://raw.githubusercontent.com/gpjt/webgl-lessons/master/lesson11/moon.gif"));
          triangleTextureMap.push(count);
          count++;
        }
    }

    if (inputSpheres != String.null) {
      for (var whichSet=0; whichSet<inputSpheres.length; whichSet++) {
          if(inputSpheres[whichSet].texture != false)
            shapeTexture.push(initTexture(REPO_URL + inputSpheres[whichSet].texture));
          else
            shapeTexture.push(initTexture("https://raw.githubusercontent.com/gpjt/webgl-lessons/master/lesson11/moon.gif"));
        sphereTextureMap.push(count);
        count++;
      }
    }
}

function initTexture(source){
  var texture = gl.createTexture();
  texture.image = new Image();
  texture.image.crossOrigin = "anonymous";
  texture.image.onload = function(){
    textureCount++;
  }

  texture.image.src = source;
  return texture;
}
