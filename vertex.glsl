attribute vec3 position;
attribute vec4 color;
varying vec4 vColor;
uniform float rotation;
uniform mat4 Pmatrix;
uniform mat4 Vmatrix;
uniform mat4 Mmatrix;
void main() {
    gl_Position = Pmatrix*Vmatrix*Mmatrix*vec4(position, 1.0);
    vColor = color;
}