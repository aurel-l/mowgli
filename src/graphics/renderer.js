/*
 *  mowgli: Molecule WebGL Viewer in JavaScript, html5, css3, and WebGL
 *  Copyright (C) 2015  Jean-Christophe Taveau.
 *
 *  This file is part of mowgli
 *
 * This program is free software: you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by 
 * the Free Software Foundation, either version 3 of the License, or 
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with mowgli.  If not, see <http://www.gnu.org/licenses/>.
 *
 *
 * Authors:
 * Jean-Christophe Taveau
 */


"use strict"

/*
 * Singleton ??
 */
function Renderer(canvas_id) {
  this.scene = null;

  // Get A WebGL context
  function createWebGLContext(canvas, opt_attribs) {
    var names = ["webgl", "experimental-webgl"];
    var context = null;
    for (var ii in names) {
      try {
        context = canvas.getContext(names[ii], opt_attribs);
      } catch(e) {}
      if (context) {
        break;
      }
    }
    return context;
  }

  var canvas = document.getElementById(canvas_id);
  this.context = createWebGLContext(canvas);

  if (!this.context) {
    return;
  }

  // Properties
  this.context.viewportWidth  = canvas.width;
  this.context.viewportHeight = canvas.height;
  this.shaders={}; 
  this.shaderProgram=null; //Active program ID

  // Init GL
  this._initGL();
}

Renderer.prototype.getContext = function () {
  return this.context;
}

Renderer.prototype.addScene = function (a_scene) {
  this.scene = a_scene;
}

Renderer.prototype.addSensor = function (a_sensor) {
  this.sensor = a_sensor;
  this.sensor.setRenderer(this);
}

Renderer.prototype.drawScene = function () {
  var gl = this.context;
  var FLOAT_IN_BYTES = 4;
  // Clear Screen And Depth Buffer
  gl.viewport(0.0, 0.0, gl.viewportWidth, gl.viewportHeight);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);	
  
  // Update camera matrix
  var cam = this.scene.children['camera'];
  cam.setViewport(gl.viewportWidth,gl.viewportHeight);


  for (var i in this.scene.children) {
    var shape = this.scene.children[i];
    if (shape instanceof Shape) {
      var shaderProgram = shape.shaderProgram;
      console.log(shape.shaderProgram);
      shaderProgram.use();

      // TODO Update uniforms
      gl.uniformMatrix4fv(shaderProgram.getUniformLocation("uPMatrix"), false, cam.projMatrix);
      gl.uniformMatrix4fv(shaderProgram.getUniformLocation("uVMatrix"), false, cam.viewMatrix);
      gl.uniformMatrix4fv(shaderProgram.getUniformLocation("uMMatrix"), false, shape.matrix);

      console.log('coordSize '+shape.VBO.numItems +' '+shape.VBO.itemSize);

      for (var j in shaderProgram.attributes) {
        var attrib = shaderProgram.attributes[j];
        if (shape.VBO[attrib.name].type === 'indexed') {
          gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, shape.VBO[attrib.name].IndxID);
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, shape.VBO[attrib.name].ID);
        gl.enableVertexAttribArray(shaderProgram.getAttributeLocation(attrib.name) );
        gl.vertexAttribPointer(shaderProgram.getAttributeLocation(attrib.name), shape.VBO[attrib.name].itemSize, gl.FLOAT, false, 0, 0);
      }
      // Draw ...
      console.log(shape.type + ' '+ shape.glType +' '+ shape.numIndices+' '+ shape.numItems);
      if (shape.isIndexedGeometry() ) {
        gl.drawElements(shape.glType, shape.numIndices, gl.UNSIGNED_SHORT, 0);
      }
      else {
        gl.drawArrays(shape.glType, 0, shape.numItems);
      }

    }
  }

}

Renderer.prototype.update = function () {
  var gl = this.context;
  
  // TODO
}


/*
 * Private
 */
Renderer.prototype._initGL = function() {
  // Init GL stuff
  var gl = this.context;
  // TODO
  // Default clearColor
  gl.clearColor(0.1,0.1,0.1,1.0);

  gl.enable(gl.DEPTH_TEST);

  // Check extension...
  gl.getExtension("EXT_frag_depth");
  if (gl.getSupportedExtensions().indexOf("EXT_frag_depth") < 0 ) {
    alert('Extension frag_depth not supported');
  }


  // Default shader program
  this.program = new Program();
}



