/*
    HALO EXPANDED (p5.js)
    ORIGINAL
    Revised 2024
    Bruce Roberts
*/

var width = 1400, height = 800;
var colorWheelRadius = 92.5;
var center = [];
var mx, my, mouseDownOnColor = false;
var points = 0, points3day = 0, points8week = 0, pointsLast3day = 0, posts = 0, posts3day = 0, d3Day = 0;
var pointsCounter = 0, points3dayCounter = 0, points8weekCounter = 0, pointsLast3dayCounter = 0, postsCounter = 0, posts3dayCounter = 0;

var mouseDownOnCanvas = false;
var logoTexture, logoGraphic;

var controls;
var sizeSlider;
var colorSlider;
var rotationSlider;
var wobbleSlider;
var complexitySlider;
var extentSlider;
var radialExtentSlider;
var radialVelocitySlider;
var warpAngleSlider;
var warpVelocitySlider;
var twistSlider;
var colorRatioSlider;
var ringsSlider;
var wavesSlider;
var waveSpeedSlider;
var speedSlider;
var pilRotationSlider;
var colorSegments;
var logoToggle;

var font;

function preload() {
  font = loadFont('halo/resources/Moderniz.otf');
}



var centerColor = [], mainColor = [], waveColor = [];
function setup() {

     controls = true;



    /*P5 JS canvas for PIL + HALO render*/
    
    var width = document.getElementById("canvasContainer").offsetWidth;
    var p5Canvas = createCanvas(width, width, WEBGL, document.getElementById("haloCanvas"));
    p5Canvas.parent('canvasSection');
    center.x = 0;
    center.y = 0;
    
    centerColor.hue = 0;
    mainColor.hue = 255;
    waveColor.hue = 55;
    
    centerColor.saturation = 55;
    mainColor.saturation = 255;
    waveColor.saturation = 0;

    logoTexture = loadImage("./resources/ORABlack.jpeg");
    logoGraphic = createGraphics(width, height);

    
   
    //DATA : role
    //Set default colors 
    centerColor.red = 255;
    centerColor.green = 255;
    centerColor.blue = 255;

    mainColor.red = 255;
    mainColor.green = 25;
    mainColor.blue = 0;

    waveColor.red = 255;
    waveColor.green = 0;
    waveColor.blue = 0;
    
    
}

function windowResized () {


    var width = document.getElementById("canvasContainer").offsetWidth;
    resizeCanvas(width, width, WEBGL, document.getElementById("haloCanvas"));
}

var time = 0.0, radius = 125.0;

var mousePressLoc = [];
var lastYAngle = 0.0, lastXAngle = 0.0, yAngle = 0.0, xAngle = 0.0;

var pilAngle = 0.0;

var size = 0.85, rotation = 0.0, rotationSpeed = 0.01, wobble = 0.25, complexity = 0.5, colorRatio = 0.5, waveSpeed = 0.5, speed = 0.5;

var extent = 2.5;
var radialRange = 2.0;
var radialVelocity = 1.0;
var warpAngle = 0;
var linearVelocity = 2.0;
var twist = 0.0;

var logo = false;

var waveOffset = 0.0;
var ringCount = 55, waveCount = 3;
var colorToggle = -1;
function draw() {
    randomSeed(0);
    background(0);

    fill(255);
    textFont(font);
    textSize(12)
    textAlign(CENTER);
    text("Stephen Marshall", 0, 0)

    
    /*Set Parameters*/
    

    
    /* UNCOMMENT THIS TO CHANGE INPUTS */

    size = 0.6;            
    radius = 0.5;           
    logo = 0.0;       
    rotationSpeed = 0.005;   
    wobble = 0.0;           
    complexity = 0.75;      
    colorRatio = 0.25;       
    ringCount = 25;        
    waveCount = 0.0;
    waveSpeed = 0.0;
    speed = 0.1;
    colorToggle = 2;    

    
    mainColor.red = 255;
    mainColor.green = 125;
    mainColor.blue = 0;

    centerColor.red = 255;
    centerColor.green = 0;
    centerColor.blue = 0;

    waveColor.red = 255;
    waveColor.green = 255;
    waveColor.blue = 255;

    


    if (logo == true) {
        stroke(255,255,255,0.01);
        for (var i = 0; i <= 1.0; i += 0.125) {
            circle(0, 0, i*width);
            if (i < 0.9)
            line(0, 0, width/2*cos(i*PI*2), height/2*sin(i*PI*2));
        }
    }

    fill(0);
    stroke(255);
    var w = radius*width*180.0/800.0*1.0;
    //circle(0, 0, w);
    //image(logoTexture, -w/2, -w/2, w, w);


    //calculate HSV color from mouse coords on color block
    var mag = sqrt(mx*mx+my*my);
    
    if (mouseDownOnColor) {

        //Calculate RGB from HSV

        //Center Color
        var colorFromHSV = [];
    
        if (colorToggle == 0) {
            centerColor.hue = (my < 0) ? (acos(mx/mag))/PI/2*360 : (PI*2 - acos(mx/mag))/PI/2*360;
            centerColor.saturation = min(255, (mag/colorWheelRadius*1.25)*255);
            centerColor.value = 1.0;//(1.0-0.5*mag/(1.0*colorWheelRadius));

            colorFromHSV = hsv_to_rgb(centerColor.hue, centerColor.saturation, centerColor.value);
            centerColor.red = colorFromHSV.red*0.9;
            centerColor.green = colorFromHSV.green*0.75;
            centerColor.blue = colorFromHSV.blue;

        } else if (colorToggle == 1) {
            mainColor.hue = (my < 0) ? (acos(mx/mag))/PI/2*360 : (PI*2 - acos(mx/mag))/PI/2*360;
            mainColor.saturation = min(255, (mag/colorWheelRadius*1.25)*255);
            mainColor.value = 1.0;//(1.0-0.5*mag/(1.0*colorWheelRadius));

            colorFromHSV = hsv_to_rgb(mainColor.hue, mainColor.saturation, mainColor.value);
            mainColor.red = colorFromHSV.red*0.9;
            mainColor.green = colorFromHSV.green*0.75;
            mainColor.blue = colorFromHSV.blue;

        } else if (colorToggle == 2) {
            waveColor.hue = (my < 0) ? (acos(mx/mag))/PI/2*360 : (PI*2 - acos(mx/mag))/PI/2*360;
            waveColor.saturation = min(255, (mag/colorWheelRadius*1.25)*255);
            waveColor.value = 1.0;//(1.0-0.5*mag/colorWheelRadius);
            
            colorFromHSV = hsv_to_rgb(waveColor.hue, waveColor.saturation, waveColor.value);
            waveColor.red = colorFromHSV.red*0.9;
            waveColor.green = colorFromHSV.green*0.75;
            waveColor.blue = colorFromHSV.blue;
        }

    }
    mouseDownOnColor = false;


    
    
    
    /* sample color
         context.fillStyle = 'hsl(' + mainColor.hue + ', 100%, ' + ((1.0-mainColor.saturation/255)*50+50) + '%)';
        context.beginPath();
         context.rect(colorWheelRadius/2, colorWheelRadius/2, 25, 25);
         context.closePath();
         context.fill();
         
         */
    
    
    
    /*Increment*/
    
    time += speed;
    
    waveOffset += 0.03*waveSpeed;
    if (waveOffset > 1.0) waveOffset--;
    
    rotation += rotationSpeed;
    //if (rotation > PI*2) rotation -= PI*2;
    
    

    //Logo

    
    /*HALO
        Rings with two scales of perlin noise (wobble and complexity), wave effects, and color gradient
        Parameters :
        RING COUNT
        COLOR GRADIENT (CENTER AND OUTER COLOR)
        COLOR RATIO (balance between colors)
        TILT (axis rotation)
        ROTATION (radial rotation)
        SPEED
        WOBBLE (large scale perlin)
        COMPLEXITY (small scale perlin)
        WAVE COUNT
        WAVE INTENSITY
        WAVE COLOR
    */

        if (radius > 0.05 && logo == true) {

            stroke(125);
            strokeWeight(3);
            noFill();
            var w = radius*width;
            //circle(width/2, height/2, radius*width);
            image(logoTexture, -w/2, -w/2, w, w);
            } else {
                rotateX(xAngle);
                rotateY(yAngle);
            }


    //blendMode(SCREEN);
    blendMode(BLEND);

    colorMode(RGB);
    noFill();
    strokeWeight(2);



    
  for (var i = 0; i < 1.0; i += 1.0/ringCount) {
      //stroke(mainColor.saturation - (mainColor.saturation - centerColor.saturation)*(1-i)*colorRatio, 255, 255);
      //stroke(mainColor.hue - (mainColor.hue - centerColor.hue)*(1-i + colorRatio/2)*colorRatio, mainColor.saturation - (mainColor.saturation - centerColor.saturation)*(1-i + colorRatio/2)*colorRatio, 255);
      stroke(
            mainColor.red*(i-colorRatio) + centerColor.red*(1.0-i+colorRatio),
            mainColor.green*(i-colorRatio) + centerColor.green*(1.0-i+colorRatio),
            mainColor.blue*(i-colorRatio) + centerColor.blue*(1.0-i+colorRatio), 255);

      
            //Wave ring case
      if (waveCount > 0 && floor((i-waveOffset) * ringCount) % floor(ringCount/waveCount) == 0) {
          strokeWeight(2);
          stroke(
            waveColor.red*(0.7) + mainColor.red*(0.3),
            waveColor.green*(0.7) + mainColor.green*(0.3),
            waveColor.blue*(0.7) + mainColor.blue*(0.3));
            stroke(
              waveColor.red*sqrt(1-i) + mainColor.red*sq(i),
              waveColor.green*sqrt(1-i) + mainColor.green*sq(i),
              waveColor.blue*sqrt(1-i) + mainColor.blue*sq(i));
      }
      
      beginShape();
      for (var t = 0; t < 1.0; t += 0.005) {
          /*var rNoise = complexity*i*(noise(3 + time/5 - 3*i + 5*cos(t*PI*2), 3 + time/5 - 3*i + 5*sin(t*PI*2), i*5*complexity));
          var rNoise = complexity*(noise(3 + time/5 - 1*i + 5*cos(t*PI*2), 3 + time/5 - 1*i + 5*sin(t*PI*2), i*2*complexity) - 0.5);
          var rNoise = (complexity)*(noise(3 + 0*time/3*speed + 5*cos(t*PI*2), 3 + 1*time/3*speed + 5*sin(t*PI*2), i*5*complexity - time/2)-1.0);
            */

          var rNoise = complexity*(
            noise(  extent + extent*cos(t*PI*2 + i*PI*twist) + linearVelocity*cos(warpAngle)*time*speed,
                    extent + extent*sin(t*PI*2 + i*PI*twist) + linearVelocity*sin(warpAngle)*time*speed,
                    i*radialRange - time*radialVelocity*speed)
        );


          /*var xNoise = complexity*i*0*(noise(25 + time/5 + 155*cos(t*PI*2), 25 + time/5 + 155*sin(t*PI*2), i*1-time/5)-0.5);
          var yNoise = complexity*i*0*(noise(15 + time/5 + 155*cos(t*PI*2), 15 + time/5 + 155*sin(t*PI*2), i*1-time/5)-0.5);
          var zNoise = complexity*pow(i,0.5)*sin(t*PI*15 + i*PI*5 + time);//(noise(3 + time/5 + 5*cos(t*PI*2), 3 + time/5 + 5*sin(t*PI*2), i*1-time/5)-0.5);
          var xWobble = wobble*i*width*3.0/8.0*(noise(3 + time/5 + 0.5*cos(t*PI*2), 3 + time/5 + 0.5*sin(t*PI*2), i*1+time/5)-0.5);
          var yWobble = wobble*i*width*3.0/8.0*(noise(8 + time/5 + 0.5*cos(t*PI*2), 8 + time/5 + 0.5*sin(t*PI*2), i*1+time/5)-0.5);
          
          var x = (radius*width*180.0/800.0 + (i)*width*150.0/800.0*size + rNoise + xWobble)*cos(t*PI*2 + rotation) + xNoise;
          var y = (radius*width*180.0/800.0 + (i)*width*150.0/800.0*size + rNoise + yWobble)*sin(t*PI*2 + rotation) + yNoise;*/


          var x = (width*0.5*(radius + pow(i, 0.9)*size*(1.0-radius)*(1.0-rNoise)) )*cos(t*PI*2 + rotation);
          var y = (width*0.5*(radius + pow(i, 0.9)*size*(1.0-radius)*(1.0-rNoise)) )*sin(t*PI*2 + rotation);

          //var x = (radius*height*0.5 + i*size*height*(1-radius)*0.5*(0.5+rNoise))*cos(t*PI*2 + rotation);
          //var y = (radius*height*0.5 + i*size*height*(1-radius)*0.5*(0.5+rNoise))*sin(t*PI*2 + rotation);


          var z = 0.0;
          vertex(x, y, 0);
      }
      endShape(CLOSE);
      strokeWeight(1);
  }
    
    
    //Draw FX
    

    //translate(-center.x, -center.y, 200);
    
}

function hsv_to_hsl(h, s, v) {
    // both hsv and hsl values are in [0, 1]
    var l = (2 - s) * v / 2;

    if (l != 0) {
        if (l == 1) {
            s = 0
        } else if (l < 0.5) {
            s = s * v / (l * 2)
        } else {
            s = s * v / (2 - l * 2)
        }
    }

    return [h, s, l]
}

function hsv_to_rgb(h, s, v) {

    var color = [];

    var c = s/255;
    var x = c*(1-abs((h/60) % 2 - 1));
    var m = 1.0 - c;
    var rgb = [];
    if (h < 60) {
        rgb.r = c;
        rgb.g = x;
        rgb.b = 0;
    } else if (h < 120) {
        rgb.r = x;
        rgb.g = c;
        rgb.b = 0;
    } else if (h < 180) {
        rgb.r = 0;
        rgb.g = c;
        rgb.b = x;
    } else if (h < 240) {
        rgb.r = 0;
        rgb.g = x;
        rgb.b = c;
    } else if (h < 300) {
        rgb.r = x;
        rgb.g = 0;
        rgb.b = c;
    } else if (h < 360) {
        rgb.r = c;
        rgb.g = 0;
        rgb.b = x;
    }

    color.red = (rgb.r+m)*255*v;
    color.green = (rgb.g+m)*255*v;
    color.blue = (rgb.b+m)*255*v;

    return color;
}



function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        mouseDownOnCanvas = true;
        mousePressLoc.x = mouseX;
        mousePressLoc.y = mouseY;
    }
}

function mouseDragged() {
    if (mouseDownOnCanvas) {
        yAngle = lastYAngle + (mouseX - mousePressLoc.x)/255;
        xAngle = lastXAngle - (mouseY - mousePressLoc.y)/255;
    }
    
}

function mouseReleased() {

    if (mouseDownOnCanvas) {
        lastYAngle = yAngle;
        lastXAngle = xAngle;
    }

    mouseDownOnCanvas = false;

    console.log(mainColor)
}


/*Old color function

    stroke(colorA.x*i*colorRatio*2 + colorB.x*(1.0-i)*(1.0-colorRatio)*2, colorA.y*i*colorRatio*2 + colorB.y*(1.0-i)*(1.0-colorRatio)*2, colorA.z*i*colorRatio*2 + colorB.z*(1.0-i)*(1.0-colorRatio)*2);*/
    window.addEventListener('message', function(event) {
    if (event.data.type === 'VERTEX_UPDATE') {
        let vertices = event.data.vertices;
        
        // MAP VERTICES TO YOUR HALO VARIABLES
        updateHaloColor(vertices.color);           // 0-1 VALUE
        updateColorRatio(vertices.colorRatio);     // 0-1 VALUE  
        updateSize(vertices.size);                 // 0-1 VALUE
        updateRotation(vertices.rotation);         // 0-1 VALUE
        updateRingCount(vertices.ringCount);       // 0-1 VALUE
        
        console.log('HALO VERTICES RECEIVED:', vertices);
    }
});

function updateHaloColor(value) {
    mainColor.hue = value * 360;
    
    var colorFromHSV = hsv_to_rgb(mainColor.hue, mainColor.saturation, mainColor.value);
    mainColor.red = colorFromHSV.red * 0.9;
    mainColor.green = colorFromHSV.green * 0.75;
    mainColor.blue = colorFromHSV.blue;
}

function updateColorRatio(value) {
    colorRatio = value;
}

function updateSize(value) {
    size = 0.3 + (value * 0.7);
}

function updateRotation(value) {
    rotationSpeed = (value - 0.5) * 0.02;
}

function updateRingCount(value) {
    ringCount = Math.floor(20 + (value * 60));
}