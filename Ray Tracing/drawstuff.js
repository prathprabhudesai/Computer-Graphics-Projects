
// Color constructor
class Color {
    constructor(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a;
            }
        } // end try

        catch (e) {
            console.log(e);
        }
    } // end Color constructor

        // Color change method
    change(r,g,b,a) {
        try {
            if ((typeof(r) !== "number") || (typeof(g) !== "number") || (typeof(b) !== "number") || (typeof(a) !== "number"))
                throw "color component not a number";
            else if ((r<0) || (g<0) || (b<0) || (a<0))
                throw "color component less than 0";
            else if ((r>255) || (g>255) || (b>255) || (a>255))
                throw "color component bigger than 255";
            else {
                this.r = r; this.g = g; this.b = b; this.a = a;
            }
        } // end throw

        catch (e) {
            console.log(e);
        }
    } // end Color change method
} // end color class


/* utility functions */

// draw a pixel at x,y using color
function drawPixel(imagedata,x,y,color) {
    try {
        if ((typeof(x) !== "number") || (typeof(y) !== "number"))
            throw "drawpixel location not a number";
        else if ((x<0) || (y<0) || (x>=imagedata.width) || (y>=imagedata.height))
            throw "drawpixel location outside of image";
        else if (color instanceof Color) {
            var pixelindex = (y*imagedata.width + x) * 4;
            imagedata.data[pixelindex] = color.r;
            imagedata.data[pixelindex+1] = color.g;
            imagedata.data[pixelindex+2] = color.b;
            imagedata.data[pixelindex+3] = color.a;
        } else
            throw "drawpixel color is not a Color";
    } // end try

    catch(e) {
        console.log(e);
    }
} // end drawPixel

// draw random pixels
function drawRandPixels(context) {
    var c = new Color(0,0,0,0); // the color at the pixel: black
    var w = context.canvas.width;
    var h = context.canvas.height;
    var imagedata = context.createImageData(w,h);
    const PIXEL_DENSITY = 0.01;
    var numPixels = (w*h)*PIXEL_DENSITY;

    // Loop over 1% of the pixels in the image
    for (var x=0; x<numPixels; x++) {
        c.change(Math.random()*255,Math.random()*255,
            Math.random()*255,255); // rand color
        drawPixel(imagedata,
            Math.floor(Math.random()*w),
            Math.floor(Math.random()*h),
                c);
    } // end for x
    context.putImageData(imagedata, 0, 0);
} // end draw random pixels

// get the input spheres from the standard class URL
function getInputSpheres() {
    const INPUT_SPHERES_URL =
        "https://ncsucgclass.github.io/prog1/spheres.json";

    // load the spheres file
    var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_SPHERES_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input spheres file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
} // end get input spheres

function drawRayCastSpheres(context)
{
  var inputSpheres = getInputSpheres();
  var w = context.canvas.width;
  var h = context.canvas.height;
  var imagedata = context.createImageData(w,h);

  var blackColor = new Color(0,0,0,255);
  var x = 0; var y = 0;

  for(var x = 0;x < 1; x=x+(1/512))
    for(var y = 0;y < 1;y=y+(1/512))
      drawPixel(imagedata,x*w,y*h,blackColor);

  if (inputSpheres != String.null) {
      var cx = 0; var cy = 0; var cz = 0;// init center x and y coord
      var sphereRadius = 0; // init sphere radius
      var pixelColor = new Color(0,0,0,0); // init the sphere color
      var n = inputSpheres.length;

      var discriminant = 0;
      var eye = [0.5, 0.5, -0.5];

      for (var s=0; s<n; s++) {
          console.log("in the loop");
          cx = inputSpheres[s].x; // sphere center x
          cy = inputSpheres[s].y; // sphere center y
          cz = inputSpheres[s].z;
          sphereRadius = inputSpheres[s].r; // radius

          pixelColor.change(
              inputSpheres[s].diffuse[0]*255,
              inputSpheres[s].diffuse[1]*255,
              inputSpheres[s].diffuse[2]*255,
              255); // rand color

              for(var y = 0;y < 1; y=y+(1/512))
                for(var x = 0;x < 1;x=x+(1/512))
                {

                  dx = x - eye[0];
                  dy = y - eye[1];
                  dz = 0 - eye[2];

                  a = dx*dx + dy*dy + dz*dz;
                  b = 2*dx*(eye[0] - cx) + 2*dy*(eye[1] - cy) + 2*dz*(eye[2] - cz);
                  c = cx*cx + cy*cy + cz*cz + eye[0]*eye[0] + eye[1]*eye[1] + eye[2]*eye[2]
                  -2*(cx*eye[0] + cy*eye[1] + cz*eye[2]) - sphereRadius*sphereRadius;

                  discriminant = b*b - 4*a*c;
                  if(discriminant > 0){
                    drawPixel(imagedata,x*w,(1-y)*h,pixelColor);
              }
            }
        }
        context.putImageData(imagedata, 0, 0);
      }
}


function drawRayCastSpheresBlinnPhong(context)
{
  var inputSpheres = getInputSpheres();
  var w = context.canvas.width;
  var h = context.canvas.height;
  var imagedata = context.createImageData(w,h);
  var numPixels = w*h;

  var blackColor = new Color(0,0,0,255);
  var x = 0; var y = 0;

  for(var i = 0;i < numPixels; i++)
  {
    x = Math.floor(i/w);
    y = i%h;
    drawPixel(imagedata,x,y,blackColor);
  }

  if (inputSpheres != String.null) {
      x = 0; y = 0; // pixel coord init
      var cx = 0; var cy = 0; var cz = 0;// init center x and y coord
      var sphereRadius = 0; // init sphere radius
      var pixelColor = new Color(0,0,0,0); // init the sphere color
      var n = inputSpheres.length;
      var discriminant = 0;
      console.log("found sphere");

      var eye = [0.5, 0.5, -0.5];
      var Light = [2, 4, -0.5];

      var La = 1; var Ld = 1; var Ls = 1;

      for (var s=0; s<n; s++) {
          cx = inputSpheres[s].x; // sphere center x
          cy = inputSpheres[s].y; // sphere center y
          cz = inputSpheres[s].z; // sphere center z
          sphereRadius = inputSpheres[s].r; // radius

          for(var y = 1;y > 0; y=y-(1/h))
            for(var x = 0;x < 1;x=x+(1/w))
            {
              dx = (x - eye[0]);
              dy = (y - eye[1]);
              dz = (0 - eye[2]);

              a = dx*dx + dy*dy + dz*dz;
              b = 2*dx*(eye[0] - cx) + 2*dy*(eye[1] - cy) + 2*dz*(eye[2] - cz);
              c = cx*cx + cy*cy + cz*cz + eye[0]*eye[0] + eye[1]*eye[1] + eye[2]*eye[2]
              -2*(cx*eye[0] + cy*eye[1] + cz*eye[2]) - sphereRadius*sphereRadius;

              discriminant = b*b - 4*a*c;

              if(discriminant > 0)
              {
                t1 = (-b - Math.sqrt(discriminant))/(2*a);
                t2 = (-b + Math.sqrt(discriminant))/(2*a);
                if(t1<t2) t = t1; else t = t2;
                

                x_sphere = eye[0] + t*dx;
                y_sphere = eye[1] + t*dy;
                z_sphere = (eye[2] + t*dz);

                // Unit normal vector to the point on the sphere
                var Nx = -(cx - x_sphere)/sphereRadius;
                var Ny = -(cy - y_sphere)/sphereRadius;
                var Nz = (cz - z_sphere)/sphereRadius;//changes made

                // Unit vector from light source to the point
                var Lx_dash = (Light[0] - x_sphere);
                var Ly_dash = (Light[1] - y_sphere);
                var Lz_dash = -(Light[2] - z_sphere);
                var L_dash_mag = Math.sqrt(Lx_dash*Lx_dash + Ly_dash*Ly_dash + Lz_dash*Lz_dash);
                var Lx = Lx_dash/L_dash_mag;
                var Ly = Ly_dash/L_dash_mag;
                var Lz = Lz_dash/L_dash_mag;

                // N Dot L
                var NdotL = Nx*Lx + Ny*Ly + Nz*Lz;
                

                // V vector
                var Vx = -(x_sphere - eye[0]);
                var Vy = -(y_sphere - eye[1]);
                var Vz = (z_sphere - eye[2]);
                var V_mag = Math.sqrt(Vx*Vx + Vy*Vy + Vz*Vz);
                Vx = Vx/V_mag;
                Vy = Vy/V_mag;
                Vz = Vz/V_mag;

                // Camera vector
                var Hx = Vx + Lx;
                var Hy = Vy + Ly;
                var Hz = Vz + Lz;
                var Hmag = Math.sqrt(Hx*Hx + Hy*Hy + Hz*Hz);
                Hx = Hx/Hmag;
                Hy = Hy/Hmag;
                Hz = Hz/Hmag;

                HdotN = Nx*Hx + Ny*Hy + Nz*Hz;
                HdotN = Math.pow(HdotN,inputSpheres[s].n);


                Ir = (La*inputSpheres[s].ambient[0] + Ld*inputSpheres[s].diffuse[0]*NdotL
                + Ls*inputSpheres[s].specular[0]*HdotN);
                Ig = (La*inputSpheres[s].ambient[1] + Ld*inputSpheres[s].diffuse[1]*NdotL
                + Ls*inputSpheres[s].specular[1]*HdotN);
                Ib = (La*inputSpheres[s].ambient[2] + Ld*inputSpheres[s].diffuse[2]*NdotL
                + Ls*inputSpheres[s].specular[2]*HdotN);

                var I = [Ir, Ig, Ib];
                for (var p = 0; p < I.length; p++) {
                  if (I[p] > 1)
                     I[p] = 1;
                  if (I[p] < 0)
                      I[p] = 0;
                    }
                //console.log(Ir,Ig,Ib);

                pixelColor.change(I[0]*255,I[1]*255,I[2]*255,255);

                drawPixel(imagedata,x*w,(1-y)*h,pixelColor);
            }
          }
        } // end for pixels in sphere
        context.putImageData(imagedata, 0, 0);
      } // end for spheres
///context.putImageData(imagedata, 0, 0);
}


function drawRayCastSpheresBlinnPhongCustomViewport(context,width,height)
{
  var inputSpheres = getInputSpheres();
  var w = width;
  var h = height;
  var aspect = Math.min(w,h);
  var imagedata = context.createImageData(w,h);
  var numPixels = w*h;

  var blackColor = new Color(0,0,0,255);
  var x = 0; var y = 0;

  for(var i = 0;i < numPixels; i++)
  {
    x = Math.floor(i/w);
    y = i%h;
    drawPixel(imagedata,x,y,blackColor);
  }

  if (inputSpheres != String.null) {
      x = 0; y = 0; // pixel coord init
      var cx = 0; var cy = 0; var cz = 0;// init center x and y coord
      var sphereRadius = 0; // init sphere radius
      var pixelColor = new Color(0,0,0,0); // init the sphere color
      var n = inputSpheres.length;
      var discriminant = 0;
      console.log("found sphere");

      var eye = [0.5, 0.5, -0.5];
      var Light = [2, 4, -0.5];

      var La = 1; var Ld = 1; var Ls = 1;

      for (var s=0; s<n; s++) {
          cx = inputSpheres[s].x; // sphere center x
          cy = inputSpheres[s].y; // sphere center y
          cz = inputSpheres[s].z; // sphere center z
          sphereRadius = inputSpheres[s].r; // radius

          for(var y = 1;y > 0; y=y-(1/aspect))
            for(var x = 0;x < 1;x=x+(1/aspect))
            {
              dx = (x - eye[0]);
              dy = (y - eye[1]);
              dz = (0 - eye[2]);

              a = dx*dx + dy*dy + dz*dz;
              b = 2*dx*(eye[0] - cx) + 2*dy*(eye[1] - cy) + 2*dz*(eye[2] - cz);
              c = cx*cx + cy*cy + cz*cz + eye[0]*eye[0] + eye[1]*eye[1] + eye[2]*eye[2]
              -2*(cx*eye[0] + cy*eye[1] + cz*eye[2]) - sphereRadius*sphereRadius;

              discriminant = b*b - 4*a*c;

              if(discriminant > 0)
              {
                t1 = (-b - Math.sqrt(discriminant))/(2*a);
                t2 = (-b + Math.sqrt(discriminant))/(2*a);
                if(t1<t2) t = t1; else t = t2;
                

                x_sphere = eye[0] + t*dx;
                y_sphere = eye[1] + t*dy;
                z_sphere = (eye[2] + t*dz);

                // Unit normal vector to the point on the sphere
                var Nx = -(cx - x_sphere)/sphereRadius;
                var Ny = -(cy - y_sphere)/sphereRadius;
                var Nz = (cz - z_sphere)/sphereRadius;//changes made

                // Unit vector from light source to the point
                var Lx_dash = (Light[0] - x_sphere);
                var Ly_dash = (Light[1] - y_sphere);
                var Lz_dash = -(Light[2] - z_sphere);
                var L_dash_mag = Math.sqrt(Lx_dash*Lx_dash + Ly_dash*Ly_dash + Lz_dash*Lz_dash);
                var Lx = Lx_dash/L_dash_mag;
                var Ly = Ly_dash/L_dash_mag;
                var Lz = Lz_dash/L_dash_mag;

                // N Dot L
                var NdotL = Nx*Lx + Ny*Ly + Nz*Lz;
                

                // V vector
                var Vx = -(x_sphere - eye[0]);
                var Vy = -(y_sphere - eye[1]);
                var Vz = (z_sphere - eye[2]);
                var V_mag = Math.sqrt(Vx*Vx + Vy*Vy + Vz*Vz);
                Vx = Vx/V_mag;
                Vy = Vy/V_mag;
                Vz = Vz/V_mag;

                console.log(Vx,Vy,Vz);

                // Camera vector
                var Hx = Vx + Lx;
                var Hy = Vy + Ly;
                var Hz = Vz + Lz;
                var Hmag = Math.sqrt(Hx*Hx + Hy*Hy + Hz*Hz);
                Hx = Hx/Hmag;
                Hy = Hy/Hmag;
                Hz = Hz/Hmag;

                console.log(Hx,Hy,Hz);

                HdotN = Nx*Hx + Ny*Hy + Nz*Hz;
                HdotN = Math.pow(HdotN,inputSpheres[s].n);


                Ir = (La*inputSpheres[s].ambient[0] + Ld*inputSpheres[s].diffuse[0]*NdotL
                + Ls*inputSpheres[s].specular[0]*HdotN);
                Ig = (La*inputSpheres[s].ambient[1] + Ld*inputSpheres[s].diffuse[1]*NdotL
                + Ls*inputSpheres[s].specular[1]*HdotN);
                Ib = (La*inputSpheres[s].ambient[2] + Ld*inputSpheres[s].diffuse[2]*NdotL
                + Ls*inputSpheres[s].specular[2]*HdotN);

                var I = [Ir, Ig, Ib];
                for (var p = 0; p < I.length; p++) {
                  if (I[p] > 1)
                     I[p] = 1;
                  if (I[p] < 0)
                      I[p] = 0;
                    }
                //console.log(Ir,Ig,Ib);

                pixelColor.change(I[0]*255,I[1]*255,I[2]*255,255);

                drawPixel(imagedata,x*aspect,(1-y)*aspect,pixelColor);
            }
          }
        } // end for pixels in sphere
        context.putImageData(imagedata, 0, 0);
      } // end for spheres
///context.putImageData(imagedata, 0, 0);
}


function getInputLight(){
    const INPUT_LIGHT_URL =
        "https://ncsucgclass.github.io/prog1/lights.json";

        var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_LIGHT_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input triangles file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
}




function drawRayCastSpheresBlinnPhongCustomLight(context,Lexter,amb,dif,spe)
{
  var inputSpheres = getInputSpheres();
  var w = context.canvas.width;
  var h = context.canvas.height;
  var imagedata = context.createImageData(w,h);
  var numPixels = w*h;

  var blackColor = new Color(0,0,0,255);
  var x = 0; var y = 0;

  for(var i = 0;i < numPixels; i++)
  {
    x = Math.floor(i/w);
    y = i%h;
    drawPixel(imagedata,x,y,blackColor);
  }

  if (inputSpheres != String.null) {
      x = 0; y = 0; // pixel coord init
      var cx = 0; var cy = 0; var cz = 0;// init center x and y coord
      var sphereRadius = 0; // init sphere radius
      var pixelColor = new Color(0,0,0,0); // init the sphere color
      var n = inputSpheres.length;
      var discriminant = 0;
      console.log("found sphere");

      var eye = [0.5, 0.5, -0.5];
      var Light = [2, 4, -0.5];

      var La = 1; var Ld = 1; var Ls = 1;

      for (var s=0; s<n; s++) {
          cx = inputSpheres[s].x; // sphere center x
          cy = inputSpheres[s].y; // sphere center y
          cz = inputSpheres[s].z; // sphere center z
          sphereRadius = inputSpheres[s].r; // radius

          for(var y = 1;y > 0; y=y-(1/h))
            for(var x = 0;x < 1;x=x+(1/w))
            {
              dx = (x - eye[0]);
              dy = (y - eye[1]);
              dz = (0 - eye[2]);

              a = dx*dx + dy*dy + dz*dz;
              b = 2*dx*(eye[0] - cx) + 2*dy*(eye[1] - cy) + 2*dz*(eye[2] - cz);
              c = cx*cx + cy*cy + cz*cz + eye[0]*eye[0] + eye[1]*eye[1] + eye[2]*eye[2]
              -2*(cx*eye[0] + cy*eye[1] + cz*eye[2]) - sphereRadius*sphereRadius;

              discriminant = b*b - 4*a*c;

              if(discriminant > 0)
              {
                t1 = (-b - Math.sqrt(discriminant))/(2*a);
                t2 = (-b + Math.sqrt(discriminant))/(2*a);
                if(t1<t2) t = t1; else t = t2;
                

                x_sphere = eye[0] + t*dx;
                y_sphere = eye[1] + t*dy;
                z_sphere = (eye[2] + t*dz);

                var spherePoint = [x_sphere, y_sphere, z_sphere];

                // Unit normal vector to the point on the sphere
                var Nx = -(cx - x_sphere)/sphereRadius;
                var Ny = -(cy - y_sphere)/sphereRadius;
                var Nz = (cz - z_sphere)/sphereRadius;//changes made

                // Unit vector from light source to the point
                var Lx_dash = (Light[0] - x_sphere);
                var Ly_dash = (Light[1] - y_sphere);
                var Lz_dash = -(Light[2] - z_sphere);
                var L_dash_mag = Math.sqrt(Lx_dash*Lx_dash + Ly_dash*Ly_dash + Lz_dash*Lz_dash);
                var Lx = Lx_dash/L_dash_mag;
                var Ly = Ly_dash/L_dash_mag;
                var Lz = Lz_dash/L_dash_mag;

                var LightVector = [0,0,0];
                for (var p = 0; p < 3; p++)
                  LightVector[p] = Lexter[p] - spherePoint[p]; 
                LightVector[2] = -1*LightVector[2];
                var LightMag = Math.sqrt(LightVector[0]*LightVector[0] + LightVector[1]*LightVector[1] + LightVector[2]*LightVector[2]);
                for (var p=0; p<3;p++)
                  LightVector[p] = LightVector[p]/LightMag; 


                // N Dot L
                var NdotL = Nx*Lx + Ny*Ly + Nz*Lz;
                var NdotL_exter = Nx*LightVector[0] + Ny*LightVector[1] + Nz*LightVector[2];
                

                // V vector
                var Vx = -(x_sphere - eye[0]);
                var Vy = -(y_sphere - eye[1]);
                var Vz = (z_sphere - eye[2]);
                var V_mag = Math.sqrt(Vx*Vx + Vy*Vy + Vz*Vz);
                Vx = Vx/V_mag;
                Vy = Vy/V_mag;
                Vz = Vz/V_mag;

                

                // Camera vector
                var Hx = Vx + Lx;
                var Hy = Vy + Ly;
                var Hz = Vz + Lz;
                var Hmag = Math.sqrt(Hx*Hx + Hy*Hy + Hz*Hz);
                Hx = Hx/Hmag;
                Hy = Hy/Hmag;
                Hz = Hz/Hmag;

                var Hexter = [Vx + LightVector[0], Vy + LightVector[1], Vz + LightVector[2]];
                var HexterMag = Math.sqrt(Hexter[0]*Hexter[0] + Hexter[1]*Hexter[1] + Hexter[2]*Hexter[2]);
                Hexter = [Hexter[0]/HexterMag,Hexter[1]/HexterMag,Hexter[2]/HexterMag];

                HdotN = Nx*Hx + Ny*Hy + Nz*Hz;
                HdotN = Math.pow(HdotN,inputSpheres[s].n);

                HdotN_exter = Nx*Hexter[0] + Ny*Hexter[1] + Nz*Hexter[2];
                HdotN_exter = Math.pow(HdotN_exter,inputSpheres[s].n);


      Ir = (La*inputSpheres[s].ambient[0] + amb[0]*inputSpheres[s].ambient[0] + 
            Ld*inputSpheres[s].diffuse[0]*NdotL + dif[0]*inputSpheres[s].diffuse[0]*NdotL_exter + 
            Ls*inputSpheres[s].specular[0]*HdotN + spe[0]*inputSpheres[s].specular[0]*HdotN_exter);

      Ig = (La*inputSpheres[s].ambient[1] + amb[1]*inputSpheres[s].ambient[0] + 
            Ld*inputSpheres[s].diffuse[1]*NdotL + dif[1]*inputSpheres[s].diffuse[1]*NdotL_exter +
            Ls*inputSpheres[s].specular[1]*HdotN + spe[1]*inputSpheres[s].specular[1]*HdotN_exter);

      Ib = (La*inputSpheres[s].ambient[2] + amb[2]*inputSpheres[s].ambient[0] +
            Ld*inputSpheres[s].diffuse[2]*NdotL + dif[2]*inputSpheres[s].diffuse[2]*NdotL_exter +
            Ls*inputSpheres[s].specular[2]*HdotN + spe[2]*inputSpheres[s].specular[2]*HdotN_exter);



                var I = [Ir, Ig, Ib];
                for (var p = 0; p < I.length; p++) {
                  if (I[p] > 1)
                     I[p] = 1;
                  if (I[p] < 0)
                      I[p] = 0;
                    }
                //console.log(Ir,Ig,Ib);

                pixelColor.change(I[0]*255,I[1]*255,I[2]*255,255);

                drawPixel(imagedata,x*w,(1-y)*h,pixelColor);
            }
          }
        } // end for pixels in sphere
        context.putImageData(imagedata, 0, 0);
      } // end for spheres
///context.putImageData(imagedata, 0, 0);

}

function drawRayCastSpheresBlinnPhongShadows(context)
{
 var inputSpheres = getInputSpheres();
  var w = context.canvas.width;
  var h = context.canvas.height;
  var imagedata = context.createImageData(w,h);
  var numPixels = w*h;

  var blackColor = new Color(0,0,0,255);
  var x = 0; var y = 0;

  for(var i = 0;i < numPixels; i++)
  {
    x = Math.floor(i/w);
    y = i%h;
    drawPixel(imagedata,x,y,blackColor);
  }

  if (inputSpheres != String.null) {
      x = 0; y = 0; // pixel coord init
      var cx = 0; var cy = 0; var cz = 0;// init center x and y coord
      var sphereRadius = 0; // init sphere radius
      var pixelColor = new Color(0,0,0,0); // init the sphere color
      var n = inputSpheres.length;
      var discriminant = 0;
      console.log("found sphere");

      var eye = [0.5, 0.5, -0.5];
      var Light = [2, 4, -0.5];

      var La = 1; var Ld = 1; var Ls = 1;

      for (var s=0; s<n; s++) {
          cx = inputSpheres[s].x; // sphere center x
          cy = inputSpheres[s].y; // sphere center y
          cz = inputSpheres[s].z; // sphere center z
          sphereRadius = inputSpheres[s].r; // radius

          for(var y = 1;y > 0; y=y-(1/h))
            for(var x = 0;x < 1;x=x+(1/w))
            {
              dx = (x - eye[0]);
              dy = (y - eye[1]);
              dz = (0 - eye[2]);

              a = dx*dx + dy*dy + dz*dz;
              b = 2*dx*(eye[0] - cx) + 2*dy*(eye[1] - cy) + 2*dz*(eye[2] - cz);
              c = cx*cx + cy*cy + cz*cz + eye[0]*eye[0] + eye[1]*eye[1] + eye[2]*eye[2]
              -2*(cx*eye[0] + cy*eye[1] + cz*eye[2]) - sphereRadius*sphereRadius;

              discriminant = b*b - 4*a*c;

              if(discriminant > 0)
              {
                t1 = (-b - Math.sqrt(discriminant))/(2*a);
                t2 = (-b + Math.sqrt(discriminant))/(2*a);
                if(t1<t2) t = t1; else t = t2;
                

                x_sphere = eye[0] + t*dx;
                y_sphere = eye[1] + t*dy;
                z_sphere = (eye[2] + t*dz);

                // Unit normal vector to the point on the sphere
                var Nx = -(cx - x_sphere)/sphereRadius;
                var Ny = -(cy - y_sphere)/sphereRadius;
                var Nz = (cz - z_sphere)/sphereRadius;//changes made

                // Unit vector from light source to the point
                var Lx_dash = (Light[0] - x_sphere);
                var Ly_dash = (Light[1] - y_sphere);
                var Lz_dash = -(Light[2] - z_sphere);
                var L_dash_mag = Math.sqrt(Lx_dash*Lx_dash + Ly_dash*Ly_dash + Lz_dash*Lz_dash);
                var Lx = Lx_dash/L_dash_mag;
                var Ly = Ly_dash/L_dash_mag;
                var Lz = Lz_dash/L_dash_mag;

                // N Dot L
                var NdotL = Nx*Lx + Ny*Ly + Nz*Lz;
                

                // V vector
                var Vx = -(x_sphere - eye[0]);
                var Vy = -(y_sphere - eye[1]);
                var Vz = (z_sphere - eye[2]);
                var V_mag = Math.sqrt(Vx*Vx + Vy*Vy + Vz*Vz);
                Vx = Vx/V_mag;
                Vy = Vy/V_mag;
                Vz = Vz/V_mag;

                var shadow = 0;
                for(var obj=0;obj < n;obj++)
                {
                  if(obj != s)
                  {
                    var center_of_sphere = [inputSpheres[obj].x,inputSpheres[obj].y,inputSpheres[obj].z]; 
                    var radius_of_sphere = inputSpheres[obj].r;
                    var Point1 = [x_sphere,y_sphere,z_sphere];
                    if(whetherRayIntersect(center_of_sphere,radius_of_sphere,Point1,Light)){
                      shadow = 1;
                      break;
                    }
                  }
                }

                if(shadow)
                {
                Ir = (La*inputSpheres[s].ambient[0]);
                Ig = (La*inputSpheres[s].ambient[1]);
                Ib = (La*inputSpheres[s].ambient[2]);

                }
                else{
                // Camera vector
                var Hx = Vx + Lx;
                var Hy = Vy + Ly;
                var Hz = Vz + Lz;
                var Hmag = Math.sqrt(Hx*Hx + Hy*Hy + Hz*Hz);
                Hx = Hx/Hmag;
                Hy = Hy/Hmag;
                Hz = Hz/Hmag;

                HdotN = Nx*Hx + Ny*Hy + Nz*Hz;
                HdotN = Math.pow(HdotN,inputSpheres[s].n);


                Ir = (La*inputSpheres[s].ambient[0] + Ld*inputSpheres[s].diffuse[0]*NdotL
                + Ls*inputSpheres[s].specular[0]*HdotN);
                Ig = (La*inputSpheres[s].ambient[1] + Ld*inputSpheres[s].diffuse[1]*NdotL
                + Ls*inputSpheres[s].specular[1]*HdotN);
                Ib = (La*inputSpheres[s].ambient[2] + Ld*inputSpheres[s].diffuse[2]*NdotL
                + Ls*inputSpheres[s].specular[2]*HdotN);
              }

                var I = [Ir, Ig, Ib];
                for (var p = 0; p < I.length; p++) {
                  if (I[p] > 1)
                     I[p] = 1;
                  if (I[p] < 0)
                      I[p] = 0;
                    }
                //console.log(Ir,Ig,Ib);

                pixelColor.change(I[0]*255,I[1]*255,I[2]*255,255);

                drawPixel(imagedata,x*w,(1-y)*h,pixelColor);
            }
          }
        } // end for pixels in sphere
        context.putImageData(imagedata, 0, 0);
      } // end for spheres
///context.putImageData(imagedata, 0, 0);

}

function getInputTriangle(){
    const INPUT_TRIANGLE_URL =
        "https://raw.githubusercontent.com/riteshgajare/CSC561Projects/master/triangles.json";

        var httpReq = new XMLHttpRequest(); // a new http request
    httpReq.open("GET",INPUT_TRIANGLE_URL,false); // init the request
    httpReq.send(null); // send the request
    var startTime = Date.now();
    while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
        if ((Date.now()-startTime) > 3000)
            break;
    } // until its loaded or we time out after three seconds
    if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) {
        console.log*("Unable to open input triangles file!");
        return String.null;
    } else
        return JSON.parse(httpReq.response);
}

function drawSphereTriangle(context)
{
    console.log("In the function");
  var inputSpheres = getInputSpheres();
  var w = context.canvas.width;
  var h = context.canvas.height;
  var imagedata = context.createImageData(w,h);
  var pixelColor = new Color(0,0,0,0);

  var blackColor = new Color(0,0,0,255);
  var x = 0; var y = 0;
   var eye = [0.5, 0.5, -0.5];

  for(var x = 0;x < 1; x=x+(1/512))
    for(var y = 0;y < 1;y=y+(1/512))
      drawPixel(imagedata,x*w,y*h,blackColor);

  if (inputSpheres != String.null) {
      x = 0; y = 0; // pixel coord init
      var cx = 0; var cy = 0; var cz = 0;// init center x and y coord
      var sphereRadius = 0; // init sphere radius
      var pixelColor = new Color(0,0,0,0); // init the sphere color
      var n = inputSpheres.length;
      var discriminant = 0;
      console.log("found sphere");

      var eye = [0.5, 0.5, -0.5];
      var Light = [2, 4, -0.5];

      var La = 1; var Ld = 1; var Ls = 1;

      for (var s=0; s<n; s++) {
          cx = inputSpheres[s].x; // sphere center x
          cy = inputSpheres[s].y; // sphere center y
          cz = inputSpheres[s].z; // sphere center z
          sphereRadius = inputSpheres[s].r; // radius

          for(var y = 1;y > 0; y=y-(1/h))
            for(var x = 0;x < 1;x=x+(1/w))
            {
              dx = (x - eye[0]);
              dy = (y - eye[1]);
              dz = (0 - eye[2]);

              a = dx*dx + dy*dy + dz*dz;
              b = 2*dx*(eye[0] - cx) + 2*dy*(eye[1] - cy) + 2*dz*(eye[2] - cz);
              c = cx*cx + cy*cy + cz*cz + eye[0]*eye[0] + eye[1]*eye[1] + eye[2]*eye[2]
              -2*(cx*eye[0] + cy*eye[1] + cz*eye[2]) - sphereRadius*sphereRadius;

              discriminant = b*b - 4*a*c;

              if(discriminant > 0)
              {
                t1 = (-b - Math.sqrt(discriminant))/(2*a);
                t2 = (-b + Math.sqrt(discriminant))/(2*a);
                if(t1<t2) t = t1; else t = t2;
                

                x_sphere = eye[0] + t*dx;
                y_sphere = eye[1] + t*dy;
                z_sphere = (eye[2] + t*dz);

                // Unit normal vector to the point on the sphere
                var Nx = -(cx - x_sphere)/sphereRadius;
                var Ny = -(cy - y_sphere)/sphereRadius;
                var Nz = (cz - z_sphere)/sphereRadius;//changes made

                // Unit vector from light source to the point
                var Lx_dash = (Light[0] - x_sphere);
                var Ly_dash = (Light[1] - y_sphere);
                var Lz_dash = -(Light[2] - z_sphere);
                var L_dash_mag = Math.sqrt(Lx_dash*Lx_dash + Ly_dash*Ly_dash + Lz_dash*Lz_dash);
                var Lx = Lx_dash/L_dash_mag;
                var Ly = Ly_dash/L_dash_mag;
                var Lz = Lz_dash/L_dash_mag;

                // N Dot L
                var NdotL = Nx*Lx + Ny*Ly + Nz*Lz;
                

                // V vector
                var Vx = -(x_sphere - eye[0]);
                var Vy = -(y_sphere - eye[1]);
                var Vz = (z_sphere - eye[2]);
                var V_mag = Math.sqrt(Vx*Vx + Vy*Vy + Vz*Vz);
                Vx = Vx/V_mag;
                Vy = Vy/V_mag;
                Vz = Vz/V_mag;

                // Camera vector
                var Hx = Vx + Lx;
                var Hy = Vy + Ly;
                var Hz = Vz + Lz;
                var Hmag = Math.sqrt(Hx*Hx + Hy*Hy + Hz*Hz);
                Hx = Hx/Hmag;
                Hy = Hy/Hmag;
                Hz = Hz/Hmag;

                HdotN = Nx*Hx + Ny*Hy + Nz*Hz;
                HdotN = Math.pow(HdotN,inputSpheres[s].n);


                Ir = (La*inputSpheres[s].ambient[0] + Ld*inputSpheres[s].diffuse[0]*NdotL
                + Ls*inputSpheres[s].specular[0]*HdotN);
                Ig = (La*inputSpheres[s].ambient[1] + Ld*inputSpheres[s].diffuse[1]*NdotL
                + Ls*inputSpheres[s].specular[1]*HdotN);
                Ib = (La*inputSpheres[s].ambient[2] + Ld*inputSpheres[s].diffuse[2]*NdotL
                + Ls*inputSpheres[s].specular[2]*HdotN);

                var I = [Ir, Ig, Ib];
                for (var p = 0; p < I.length; p++) {
                  if (I[p] > 1)
                     I[p] = 1;
                  if (I[p] < 0)
                      I[p] = 0;
                    }
                //console.log(Ir,Ig,Ib);

                pixelColor.change(I[0]*255,I[1]*255,I[2]*255,255);

                drawPixel(imagedata,x*w,(1-y)*h,pixelColor);
            }
          }
        } // end for pixels in sphere
        context.putImageData(imagedata, 0, 0);
      } // end for spheres
///context.putImageData(imagedata, 0, 0);

      var inputTrinagle = getInputTriangle();

      if (inputTrinagle != String.null) {
        console.log('There is a triangle');

        var A = inputTrinagle[1].vertices[0];
        var C = inputTrinagle[1].vertices[1];
        var B = inputTrinagle[1].vertices[2];

        var AB = [-(A[0]-B[0]), -(A[1]-B[1]), -(A[2]-B[2])];
        var AC = [-(A[0]-C[0]), -(A[1]-C[1]), -(A[2]-C[2])];

        var N = math.cross(AB,AC);
        Nmag = Math.sqrt(N[0]*N[0] + N[1]*N[1] + N[2]*N[2]);
        N = [1*N[0]/Nmag, 1*N[1]/Nmag, 1*N[2]/Nmag];

        EyeDotN = (eye[0]*N[0] + eye[1]*N[1] + eye[2]*N[2]);

        var vertexMat = [[A[0],B[0],C[0]],[A[1],B[1],C[1]],[A[2],B[2],C[2]]];
        var vertexMatInverse = math.inv(vertexMat);

        var E = [A[0]-eye[0], A[1]-eye[1], A[2]-eye[2]];
        var EN = E[0]*N[0] + E[1]*N[1] + E[2]*N[2];

        pixelColor.change(
              inputTrinagle[0].material.diffuse[0]*255,
              inputTrinagle[0].material.diffuse[1]*255,
              inputTrinagle[0].material.diffuse[2]*255,
              255);


        for(var y = 1;y > 0; y=y-(1/h))
            for(var x = 0;x < 1;x=x+(1/w))
            {
                var V = [x - eye[0], y - eye[1], 0 - eye[2]];
                var VN = V[0]*N[0] + V[1]*N[1] + V[2]*N[2];

                var t = -(EyeDotN/VN);
                
                var K = VN/EN;

                var PP = [V[0]/K + eye[0] , V[1]/K + eye[1], V[2]/K + eye[2]];
                
                var dec = math.multiply(vertexMatInverse,PP);

                if(dec[0] >= 0 && dec[1] >= 0 && dec[2] >= 0)
                {
                  // Unit normal vector to the point on the sphere
                var Nx = N[0];
                var Ny = N[1];
                var Nz = N[2];//changes made

                // Unit vector from light source to the point
                var Lx_dash = (Light[0] - PP[0]);
                var Ly_dash = (Light[1] - PP[1]);
                var Lz_dash = -(Light[2] - PP[2]);
                var L_dash_mag = Math.sqrt(Lx_dash*Lx_dash + Ly_dash*Ly_dash + Lz_dash*Lz_dash);
                var Lx = Lx_dash/L_dash_mag;
                var Ly = Ly_dash/L_dash_mag;
                var Lz = Lz_dash/L_dash_mag;

                // N Dot L
                var NdotL = Nx*Lx + Ny*Ly + Nz*Lz;
                

                // V vector
                var Vx = -(PP[0] - eye[0]);
                var Vy = -(PP[1] - eye[1]);
                var Vz = (PP[2] - eye[2]);
                var V_mag = Math.sqrt(Vx*Vx + Vy*Vy + Vz*Vz);
                Vx = Vx/V_mag;
                Vy = Vy/V_mag;
                Vz = Vz/V_mag;

                // Camera vector
                var Hx = Vx + Lx;
                var Hy = Vy + Ly;
                var Hz = Vz + Lz;
                var Hmag = Math.sqrt(Hx*Hx + Hy*Hy + Hz*Hz);
                Hx = Hx/Hmag;
                Hy = Hy/Hmag;
                Hz = Hz/Hmag;

                HdotN = Nx*Hx + Ny*Hy + Nz*Hz;
                HdotN = Math.pow(HdotN,5);


                Ir = (La*inputTrinagle[0].material.ambient[0] + Ld*inputTrinagle[0].material.diffuse[0]*NdotL
                + Ls*inputTrinagle[0].material.specular[0]*HdotN);
                Ig = (La*inputTrinagle[0].material.ambient[1] + Ld*inputTrinagle[0].material.diffuse[1]*NdotL
                + Ls*inputTrinagle[0].material.specular[1]*HdotN);
                Ib = (La*inputTrinagle[0].material.ambient[2] + Ld*inputTrinagle[0].material.diffuse[2]*NdotL
                + Ls*inputTrinagle[0].material.specular[2]*HdotN);

                var I = [Ir, Ig, Ib];
                for (var p = 0; p < I.length; p++) {
                  if (I[p] > 1)
                     I[p] = 1;
                  if (I[p] < 0)
                      I[p] = 0;
                    }
                //console.log(Ir,Ig,Ib);

                pixelColor.change(I[0]*255,I[1]*255,I[2]*255,255);

                drawPixel(imagedata,x*w,(1-y)*h,pixelColor);
                }
            }
      }
      context.putImageData(imagedata, 0, 0);
}




function parse_value(id,defvalue)
{
  if(parseInt(document.getElementById(id).value))
    return parseInt(document.getElementById(id).value);
    else {
      return defvalue;
    }
}

function whetherRayIntersect(center,radius,point1,point2)
{
var d = [(point2[0] - point1[0]), (point2[1] - point1[1]), (point2[2] - point1[2])];
var a = math.dot(d,d);
var n = [(point1[0] - center[0]), (point1[1] - center[1]), -(point1[2] - center[2])];
var b = 2*math.dot(d,n);
var c = math.dot(n,n) - radius*radius;
if(((b*b) - (4*a*c)) > 0)
  return 1;
else
  return 0;
}









/* main -- here is where execution begins after window load */

function main(a) {
    console.log("entered the main");
    // Get the canvas and context
    var canvas = document.getElementById("viewport");
    var context = canvas.getContext("2d");

    // Create the image
    //drawRandPixels(context);
      // shows how to draw pixels
    var b = parseInt(a);
    //drawRandPixelsInInputSpheres(context); // Original
    if(b == 1)
    drawRayCastSpheres(context);

    if(b == 2)
    drawRayCastSpheresBlinnPhong(context);

    if(b == 3){
    console.log('Rendering custom eye');
    eyex = document.getElementById('ex').value;
    eyey = document.getElementById('ey').value;
    eyez = document.getElementById('ez').value;
    eye = [0.5,0.5,-0.5];

    if(parseFloat(eyex))
      eye[0] = parseFloat(eyex);


    if(parseFloat(eyey))
      eye[1] = parseFloat(eyey);


    if(parseFloat(eyez))
      eye[2] = parseFloat(eyez);

    console.log(eye);

    drawRayCastSpheresBlinnPhongCustomEye(context,eye);

    }


    if(b == 5)
    {
      var inputLight = getInputLight();
      var Lexter = [inputLight[0].x,inputLight[0].y,inputLight[0].z];
      var ambientExter = inputLight[0].ambient;
      var diffuseExter = inputLight[0].diffuse;
      var specularExter = inputLight[0].specular;

      drawRayCastSpheresBlinnPhongCustomLight(context,Lexter,ambientExter,diffuseExter,specularExter);
    }

    if(b == 6)
    {
      drawRayCastSpheresBlinnPhongShadows(context);
    }

    if(b == 7)
    {
      drawSphereTriangle(context);
    }

      // shows how to draw pixels and read input file

    //drawInputSpheresUsingArcs(context);
          // shows how to read input file, but not how to draw pixels
}
