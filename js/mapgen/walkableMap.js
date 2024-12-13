function runWalkableMap() {
    const canvas = document.getElementById('glCanvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) {
      alert("WebGL not supported!");
      return;
    }
  
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0,0,gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    let locked = false;
    // Pointer lock for mouse look
    canvas.addEventListener('click', () => {
        if (locked) {
            document.exitPointerLock();
            locked = false;
        } else {
            locked = true;
            canvas.requestPointerLock();
        }
      
    });
  
    document.addEventListener('pointerlockchange', () => {
      // Pointer lock state changed
    }, false);
  
    // Shaders
    const vertexShaderSource = `
      attribute vec3 aPosition;
      attribute vec3 aColor;
      uniform mat4 uMVMatrix;
      uniform mat4 uPMatrix;
  
      varying vec3 vColor;
  
      void main(void) {
        vColor = aColor;
        gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
      }
    `;
  
    const fragmentShaderSource = `
      precision mediump float;
  
      varying vec3 vColor;
  
      void main(void) {
        gl_FragColor = vec4(vColor, 1.0);
      }
    `;
  
    function compileShader(src, type) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }
  
    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
  
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
    }
    gl.useProgram(program);
  
    // Create geometry from heightmap
    // We'll create a grid of two triangles per cell
    const positions = [];
    const colorsArray = [];
    const indices = [];
    
    // Create vertices for a grid (world.width * world.height)
    // Y = elevation - 38
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const cell = world.map[y][x];
        const c = get3dColor(cell)
        let worldY = cell.elevation - 38; 
        worldY = Math.floor(worldY / 100)
        //worldY = 100
        if (world.drawingType === "overmap") {
          worldY = 1
        }
        //worldY = Math.max(-50, Math.min(50, worldY));
  
        // Each cell corner position:
        // Top-left corner of cell (x,y) at (x, worldY, y)
        // Actually, let's invert z and y usage:
        // We'll place x in X and y in Z, and elevation in Y.
        // So position = (x, worldY, y)
        positions.push(x, worldY, y);
        colorsArray.push(c.r/255, c.g/255, c.b/255);
      }
    }
  
    // Create indices for the grid
    // The grid of points is world.width by world.height
    // We'll form two triangles per cell:
    for (let y = 0; y < world.height-1; y++) {
      for (let x = 0; x < world.width-1; x++) {
        const topLeft = y*world.width + x;
        const topRight = y*world.width + (x+1);
        const bottomLeft = (y+1)*world.width + x;
        const bottomRight = (y+1)*world.width + (x+1);
  
        // Triangle 1: topLeft, bottomLeft, topRight
        indices.push(topLeft, bottomLeft, topRight);
        // Triangle 2: topRight, bottomLeft, bottomRight
        indices.push(topRight, bottomLeft, bottomRight);
      }
    }
  
    function createBuffer(gl, data, type, usage) {
      const buffer = gl.createBuffer();
      gl.bindBuffer(type, buffer);
      gl.bufferData(type, data, usage);
      return buffer;
    }
  
    const positionBuffer = createBuffer(gl, new Float32Array(positions), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    const colorBuffer = createBuffer(gl, new Float32Array(colorsArray), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
    const indexBuffer = createBuffer(gl, new Uint32Array(indices), gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);

  
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const aColor = gl.getAttribLocation(program, 'aColor');
    const uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
    const uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
  
    // Enable attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aPosition);
  
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(aColor);
  
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  
    // Camera and Controls
    let cameraX = world.width/2;
    let cameraY = 10; // start above ground
    let cameraZ = world.height/2;
    let yaw = 0;
    let pitch = 0;
    let speed = 2; // movement speed
    
    const keys = {};
    window.addEventListener('keydown', e => {
      keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', e => {
      keys[e.key.toLowerCase()] = false;
    });
  
    // Mouse look
    let pointerLocked = false;
    document.addEventListener('pointerlockchange', () => {
      pointerLocked = (document.pointerLockElement === canvas);
    });
  
    document.addEventListener('mousemove', e => {
      if (!pointerLocked) return;
      const sensitivity = 0.002;
      yaw -= e.movementX * sensitivity;
      pitch -= e.movementY * sensitivity;
      if(pitch > Math.PI/2) pitch = Math.PI/2;
      if(pitch < -Math.PI/2) pitch = -Math.PI/2;
    });
  
    // Movement: We'll move in the direction we're facing
    function updateMovement() {
      // Forward vector based on yaw/pitch
      const cosPitch = Math.cos(pitch);
      const dx = (Math.sin(yaw)*cosPitch) * 8;
      const dz = (Math.cos(yaw)*cosPitch) * 8;
      const dy = (Math.sin(-pitch)) * 8;
  
      let moveX = 0, moveY = 0, moveZ = 0;
  
      // W: forward, S: backward
      if (keys['s']) {
        moveX += dx;
        moveY += dy;
        moveZ += dz;
      }
      if (keys['w']) {
        moveX -= dx;
        moveY -= dy;
        moveZ -= dz;
      }
      // A: strafe left, D: strafe right
      const leftDx = Math.sin(yaw - Math.PI/2);
      const leftDz = Math.cos(yaw - Math.PI/2);
      if (keys['a']) {
        moveX += leftDx;
        moveZ += leftDz;
      }
      if (keys['d']) {
        moveX -= leftDx;
        moveZ -= leftDz;
      }
  
      // Space: up, Shift: down
      if (keys[' ']) { // space
        moveY += 1;
      }
      if (keys['shift']) {
        moveY -= 1;
      }
  
      const len = Math.sqrt(moveX*moveX + moveY*moveY + moveZ*moveZ);
      if (len > 0) {
        moveX /= len; moveY /= len; moveZ /= len;
        cameraX += moveX * speed;
        cameraY += moveY * speed;
        cameraZ += moveZ * speed;
      }
    }
  
    // Math helper functions
    function perspectiveMatrix(out, fovy, aspect, near, far) {
      const f = 1.0 / Math.tan(fovy / 2);
      const nf = 1 / (near - far);
      out[0] = f / aspect;
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
  
      out[4] = 0;
      out[5] = f;
      out[6] = 0;
      out[7] = 0;
  
      out[8] = 0;
      out[9] = 0;
      out[10] = (far + near)*nf;
      out[11] = -1;
  
      out[12] = 0;
      out[13] = 0;
      out[14] = (2*far*near)*nf;
      out[15] = 0;
    }
  
    function multiplyMatrix(out,a,b){
      const m = new Float32Array(16);
      for (let i=0; i<4; i++){
        for(let j=0;j<4;j++){
          m[j*4+i] = a[i]*b[j*4+0] + a[i+4]*b[j*4+1] + a[i+8]*b[j*4+2] + a[i+12]*b[j*4+3];
        }
      }
      out.set(m);
    }
  
    function identityMatrix() {
      return new Float32Array([1,0,0,0,
                               0,1,0,0,
                               0,0,1,0,
                               0,0,0,1]);
    }
  
    function rotateX(m, angle){
      const c=Math.cos(angle), s=Math.sin(angle);
      const r = identityMatrix();
      r[5]=c; r[6]=-s;
      r[9]=s; r[10]=c;
      multiplyMatrix(m,m,r);
    }
  
    function rotateY(m,angle){
      const c=Math.cos(angle), s=Math.sin(angle);
      const r=identityMatrix();
      r[0]=c; r[2]=s;
      r[8]=-s; r[10]=c;
      multiplyMatrix(m,m,r);
    }
  
    function translate(m,x,y,z){
      const t=identityMatrix();
      t[12]=x; t[13]=y; t[14]=z;
      multiplyMatrix(m,m,t);
    }
  
    let running = true;
    let animationFrameId;
  
    function drawScene() {
      if(!running) return;
  
      updateMovement();
  
      gl.clearColor(0,0,0,1);
      gl.clearDepth(1);
      gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
gl.cullFace(gl.BACK);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
      const pMatrix = new Float32Array(16);
      const aspect = gl.drawingBufferWidth/gl.drawingBufferHeight;
      perspectiveMatrix(pMatrix, Math.PI/4, aspect, 0.1, 1000.0);
  
      // Model-View matrix
      const mvMatrix = identityMatrix();
      // Move camera
      // We use a typical FPS camera:
      // First rotate by pitch around X, yaw around Y, then translate
      rotateX(mvMatrix, pitch);
      rotateY(mvMatrix, yaw);
  
      // Move the world opposite to camera
      translate(mvMatrix, -cameraX, -cameraY, -cameraZ);
  
      gl.uniformMatrix4fv(uPMatrix,false,pMatrix);
      gl.uniformMatrix4fv(uMVMatrix,false,mvMatrix);
  
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
  
      animationFrameId = requestAnimationFrame(drawScene);
    }
  
    // Stop on Esc if desired:
    window.addEventListener('keydown', e => {
        if(e.key === 'Escape'){
            running = false;
            if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            }
            GID("main-generator-div").style.display = "block";
            GID("glCanvas").style.display = "none"
        }
    });
  
    drawScene();
  }