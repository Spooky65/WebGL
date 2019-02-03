function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if(xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

// variables globales du programme;
var canvas;
var gl; //contexte
var program; //shader program
var attribPos; //attribute position
var attribColor;
var attribRot;
var pointSize = 10.;
var attribTranslation;
var mousePositions = [ ];
var buffer;
var bufferColor;
var indexbuffer;
var angle;
var rota = 0;
var positions = [
    // Face 1
    -1.0, -1.0,  1.0, 1.0, -1.0,  1.0, 1.0,  1.0,  1.0, -1.0,  1.0,  1.0,    
    // Face 2
    -1.0, -1.0, -1.0, -1.0,  1.0, -1.0, 1.0,  1.0, -1.0, 1.0, -1.0, -1.0,    
    // Face 3
    -1.0,  1.0, -1.0, -1.0,  1.0,  1.0, 1.0,  1.0,  1.0, 1.0,  1.0, -1.0,    
    // Face 4
    -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0,  1.0, -1.0, -1.0,  1.0,    
    // Face 5
     1.0, -1.0, -1.0, 1.0,  1.0, -1.0, 1.0,  1.0,  1.0, 1.0, -1.0,  1.0,    
    // Face 6
    -1.0, -1.0, -1.0, -1.0, -1.0,  1.0, -1.0,  1.0,  1.0, -1.0,  1.0, -1.0
  ];
var colors = [

    0.0,  0.0,  0.0,  1.0,    // Face 1 : noir
    0.0,  0.0,  0.0,  1.0,    // Face 1 : noir
    0.0,  0.0,  0.0,  1.0,    // Face 1 : noir
    0.0,  0.0,  0.0,  1.0,    // Face 1 : noir
    
    1.0,  0.0,  0.0,  1.0,    // Face 2 : rouge
    1.0,  0.0,  0.0,  1.0,    // Face 2 : rouge
    1.0,  0.0,  0.0,  1.0,    // Face 2 : rouge
    1.0,  0.0,  0.0,  1.0,    // Face 2 : rouge
    0.0,  1.0,  0.0,  1.0,    // Face 3 : vert
    0.0,  1.0,  0.0,  1.0,    // Face 3 : vert
    0.0,  1.0,  0.0,  1.0,    // Face 3 : vert
    0.0,  1.0,  0.0,  1.0,    // Face 3 : vert
    
    0.0,  0.0,  1.0,  1.0,    // Face 4 : bleu
    0.0,  0.0,  1.0,  1.0,    // Face 4 : bleu
    0.0,  0.0,  1.0,  1.0,    // Face 4 : bleu
    0.0,  0.0,  1.0,  1.0,    // Face 4 : bleu
    1.0,  1.0,  0.0,  1.0,    // Face 5 : jaune
    1.0,  1.0,  0.0,  1.0,    // Face 5 : jaune
    1.0,  1.0,  0.0,  1.0,    // Face 5 : jaune
    1.0,  1.0,  0.0,  1.0,    // Face 5 : jaune
    1.0,  0.0,  1.0,  1.0,    // Face 6 : violet
    1.0,  0.0,  1.0,  1.0,    // Face 6 : violet
    1.0,  0.0,  1.0,  1.0,    // Face 6 : violet
    1.0,  0.0,  1.0,  1.0     // Face 6 : violet
];
  

var indices = [
    0,  1,  2,      0,  2,  3,    // avant
    4,  5,  6,      4,  6,  7,    // arrière
    8,  9,  10,     8,  10, 11,   // haut
    12, 13, 14,     12, 14, 15,   // bas
    16, 17, 18,     16, 18, 19,   // droite
    20, 21, 22,     20, 22, 23,   // gauche
  ];
  var Pmatrix;
  var Vmatrix;
  var Mmatrix;

  var proj_matrix;
  var mov_matrix ;
  var view_matrix;

  var xRotationMatrix = new Float32Array(16);
  var yRotationMatrix = new Float32Array(16);
  var zRotationMatrix = new Float32Array(16);
  var identityMatrix = new Float32Array(16);

function initContext() {
    canvas = document.getElementById('dawin-webgl');
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.log('ERREUR : echec chargement du contexte');
        return;
    }
    //gl.clearColor(0.1, 0.1, 0., 0.5);
}

//Initialisation des shaders et du program
function initShaders() {
    var fragmentSource = loadText('fragment.glsl');
    var vertexSource = loadText('vertex.glsl');

    var fragment = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment, fragmentSource);
    gl.compileShader(fragment);

    var vertex = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex, vertexSource);
    gl.compileShader(vertex);

    gl.getShaderParameter(fragment, gl.COMPILE_STATUS);
    gl.getShaderParameter(vertex, gl.COMPILE_STATUS);

    if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragment));
    }

    if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertex));
    }

    program = gl.createProgram();
    gl.attachShader(program, fragment);
    gl.attachShader(program, vertex);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log("Could not initialise shaders");
    }
    
    gl.useProgram(program);
}



//Evenement souris
function initEvents() {   
    document.onkeydown = function(e) {
        if(e.keyCode==37){
        }
        if(e.keyCode==38){
        }
        if(e.keyCode==39){
        }
        if(e.keyCode==40){
        }
        //gl.uniform2f(attribTranslation, getPosition[0], getPosition[1]);
        if(e.keyCode==37){
            rota += 0.1;
        }
        if(e.keyCode==39){
            rota -= 0.1;
        }
        gl.uniform1f(attribRot, rota);

        refreshBuffers();

    }
    $('#myRange1').click(function(){
    })
    $('#myRange2').click(function(){
    })
    $('#myRange3').click(function(){
    })
    $('#myRange4').click(function(){
        mat4.rotate(xRotationMatrix, identityMatrix, $('#myRange4').value / 4, [1, 0, 0]);
        refreshBuffers();
    })
    $('#myRange5').click(function(){
        mat4.rotate(yRotationMatrix, identityMatrix, $('#myRange5').value, [0, 1, 0]);
        refreshBuffers();
    })
    $('#myRange6').click(function(){
        mat4.rotate(zRotationMatrix, identityMatrix, $('#myRange6').value, [0, 0, 1]);
        refreshBuffers();
    })
    $('#myRange7').click(function(){
        view_matrix[14] = $('#myRange7').value;//zoom
        refreshBuffers();
    })
    $('#myRange8').click(function(){
    })
}


//TODO
//Fonction initialisant les attributs pour l'affichage (position et taille)
function initAttributes() {
    attribPos = gl.getAttribLocation(program, 'position');
    attribColor = gl.getAttribLocation(program, 'color');
    attribRot = gl.getUniformLocation(program, 'rotation');

    Pmatrix = gl.getUniformLocation(program, "Pmatrix");
    Vmatrix = gl.getUniformLocation(program, "Vmatrix");
    Mmatrix = gl.getUniformLocation(program, "Mmatrix");

    gl.enableVertexAttribArray(attribPos);
    gl.enableVertexAttribArray(attribColor);
    gl.enableVertexAttribArray(attribRot);
}

//TODO
//Initialisation des buffers
function initBuffers() {
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(positions),gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, true, 0, 0);

    bufferColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferColor);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribColor,4, gl.FLOAT, true, 0, 0);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices), gl.STATIC_DRAW);
    
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

}

function get_projection(angle, a, zMin, zMax) {
    var ang = Math.tan((angle*.5)*Math.PI/180);//angle*.5
    return [
       0.5/ang, 0 , 0, 0,
       0, 0.5*a/ang, 0, 0,
       0, 0, -(zMax+zMin)/(zMax-zMin), -1,
       0, 0, (-2*zMax*zMin)/(zMax-zMin), 0 
    ];
 }

function initMatrice(){
    
    

     proj_matrix = get_projection(40, canvas.width/canvas.height, 1, 100);
     mov_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
     view_matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];

     // translating z
     view_matrix[14] = view_matrix[14]-6;//zoom

   gl.uniformMatrix4fv(Pmatrix, false, proj_matrix);
   gl.uniformMatrix4fv(Vmatrix, false, view_matrix);
   gl.uniformMatrix4fv(Mmatrix, false, mov_matrix);
   
   mat4.identity(identityMatrix);
   var loop = function () {
        mat4.rotate(yRotationMatrix, identityMatrix, document.getElementById('myRange5').value, [0, 1, 0]);
        mat4.rotate(xRotationMatrix, identityMatrix, document.getElementById('myRange4').value / 4, [1, 0, 0]);
        mat4.rotate(zRotationMatrix, identityMatrix, document.getElementById('myRange5').value, [0, 1, 0]);
        mat4.mul(mov_matrix, yRotationMatrix, xRotationMatrix);
        gl.uniformMatrix4fv(Mmatrix, gl.FALSE, mov_matrix);

        gl.clearColor(0.75, 0.85, 0.8, 1.0);
        //gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
        //gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    //setInterval(requestAnimationFrame(loop), 200000);
    
        

}


//TODO
//Mise a jour des buffers : necessaire car les coordonnees des points sont ajoutees a chaque clic
function refreshBuffers(){
    initBuffers();
    initMatrice();
    draw();
    //gl.useProgram(program);
}

//TODO
//Fonction permettant le dessin dans le canvas
function draw() {
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.depthFunc(gl.LEQUAL);
    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.clearDepth(1.0);
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexbuffer);
}



function main() {
    initContext();
    initShaders();
    initAttributes();
    //initBuffers();
    initEvents();
    initMatrice();
    refreshBuffers();
}

