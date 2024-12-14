function get3dColor(cell) {
  const { r, g, b } = getRGBFromElevation(cell.elevation);
  let color;
  
  switch (world.drawingType) {
      case "book":
      color = getBookColor(cell);
      break;
      case "parchment":
      color = getParchmentColor(cell, r, g, b);
      break;
      case "paper":
      color = getPaperColor(cell, r, g, b);
      break;
      case "papyrus":
      if (cell.riverRun > -1) {
          color = getRivermapColorPapyrus(cell)
      } else {
          color = getPapyrusColor(cell, r, g, b);
      }
      break;
      case "relief":
      color = getReliefColor(cell);
      break;
      case "temperature":
      color = newGetTemperatureColor(cell);
      break;
      case "koppen":
      if (cell.elevation < 38) {
          color = { r: 0, g: 0, b: 0 }
      } else {
          color = getKoppenColor(cell);
      }
      break;
      case "precipitation":
      color = newGetPrecipitationColor(cell);
      break;
      case "continentality":
      color = newGetContinentalityColor(cell);
      break;
      case "currents":
      color = newGetOceanCurrentColor(cell);
      break;
      case "colorful":
      color = getColorfulColor(cell);
      break;
      case "heightmap":
      color = getHeightmapColor(cell);
      break;
      case "rivermap":
      color = getRivermapColor(cell);
      break;
      case "rivermapLowRes":
      color = getRiverMapColorLowRes(cell);
      break;
      case "fantasy":
      color = getFantasyColor(cell)
      break;
      case "overmap":
        color = cell.overmap
        break;
      default:
      color = getSpecialColor(cell, world.drawingType);
      break;
  }
  if (color !== "skip") {
      return color;
  }
}

function run3dMap() {
  // -----------------------------------------------------------
  // WebGL Setup
  // -----------------------------------------------------------
  const glcanvas = document.getElementById('glCanvas');
  const gl = glcanvas.getContext('webgl2');
  if (!gl) {
    alert("WebGL not supported!");
  }

  // Adjust glcanvas size
  function resizeCanvas() {
    glcanvas.width = window.innerWidth;
    glcanvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();


  // -----------------------------------------------------------
  // Shaders
  // -----------------------------------------------------------

  // Vertex shader:
  // Transform the vertex position and pass the normal to the fragment shader.
  const vertexShaderSource = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec2 aTexCoord;

  uniform mat4 uMVMatrix;
  uniform mat4 uPMatrix;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vTexCoord;

  void main(void) {
      vTexCoord = aTexCoord;
      vNormal = mat3(uMVMatrix) * aNormal; // Transform normal to world space
      vPosition = vec3(uMVMatrix * vec4(aPosition, 1.0));
      gl_Position = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);
  }
  `;

  // Fragment shader:
  // Implement directional lighting to simulate day/night cycle.
  const fragmentShaderSource = `
  precision mediump float;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vTexCoord;

  uniform sampler2D uColorMap;
  uniform vec3 uLightDirection; // Directional light (sun)

  void main(void) {
      // Normalize the normal vector
      vec3 normal = normalize(vNormal);
      
      // Normalize the light direction
      vec3 lightDir = normalize(uLightDirection);
      
      // Calculate the diffuse intensity using Lambertian reflection
      float diff = max(dot(normal, lightDir), 0.0);
      
      // Sample the base color from the texture
      vec4 baseColor = texture2D(uColorMap, vTexCoord);
      
      // Calculate ambient and diffuse lighting
      vec3 ambient = 0.2 * baseColor.rgb; // Ambient light
      vec3 diffuse = diff * baseColor.rgb; // Diffuse light
      
      // Final color
      vec3 finalColor = ambient + diffuse;
      
      gl_FragColor = vec4(finalColor, baseColor.a);
  }
  `;



  // -----------------------------------------------------------
  // Compile Shaders
  // -----------------------------------------------------------
  function compileShader(src, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

  // -----------------------------------------------------------
  // Create and Link Program
  // -----------------------------------------------------------
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);


  // -----------------------------------------------------------
  // Create Sphere Geometry
  // -----------------------------------------------------------
  function createSphere(radius, latBands, longBands) {
    const positions = [];
    const normals = [];
    const texCoords = [];
    const indices = [];

    for (let lat = 0; lat <= latBands; lat++) {
      const theta = lat * Math.PI / latBands;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      for (let lon = 0; lon <= longBands; lon++) {
        const phi = lon * 2 * Math.PI / longBands;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const x = cosPhi * sinTheta;
        const y = cosTheta;
        const z = sinPhi * sinTheta;

        const u = 1 - (lon / longBands);
        const v = (lat / latBands);

        positions.push(radius * x, radius * y, radius * z);
        normals.push(x, y, z);
        texCoords.push(u, v);
      }
    }

    for (let lat = 0; lat < latBands; lat++) {
      for (let lon = 0; lon < longBands; lon++) {
        const first = (lat * (longBands + 1)) + lon;
        const second = first + longBands + 1;
        indices.push(first, second, first + 1, second, second + 1, first + 1);
      }
    }

    return {positions, normals, texCoords, indices};
  }

  const sphereData = createSphere(1.0, 64, 64);



  // -----------------------------------------------------------
  // Create Buffers
  // -----------------------------------------------------------
  function createBuffer(gl, data, type, usage) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(type, buffer);
    gl.bufferData(type, data, usage);
    gl.bindBuffer(type, null);
    return buffer;
  }

  const positionBuffer = createBuffer(gl, new Float32Array(sphereData.positions), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  const normalBuffer = createBuffer(gl, new Float32Array(sphereData.normals), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  const texCoordBuffer = createBuffer(gl, new Float32Array(sphereData.texCoords), gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  const indexBuffer = createBuffer(gl, new Uint16Array(sphereData.indices), gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);

  // -----------------------------------------------------------
  // Create Color Texture from colors array
  // -----------------------------------------------------------
  const colorData = new Uint8Array(world.width * world.height * 4);
  for (let y = 0; y < world.height; y++) {
    for (let x = 0; x < world.width; x++) {
      const i = (y * world.width + x) * 4;
      // Assuming colors[y][x] = {r: number, g: number, b: number}
      let cell = world.map[y][x]
      let colors = get3dColor(cell)
      colorData[i] = colors.r;
      colorData[i+1] = colors.g;
      colorData[i+2] = colors.b;
      colorData[i+3] = 255;
    }
  }

  const colorTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, colorTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, world.width, world.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, colorData);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // -----------------------------------------------------------
  // Get Attribute/Uniform Locations
  // -----------------------------------------------------------
  const aPosition = gl.getAttribLocation(program, 'aPosition');
  const aNormal = gl.getAttribLocation(program, 'aNormal');
  const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');

  const uPMatrix = gl.getUniformLocation(program, 'uPMatrix');
  const uMVMatrix = gl.getUniformLocation(program, 'uMVMatrix');
  const uColorMap = gl.getUniformLocation(program, 'uColorMap');
  const uLightDirection = gl.getUniformLocation(program, 'uLightDirection'); // New uniform for light direction

  // -----------------------------------------------------------
  // Enable Vertex Attributes
  // -----------------------------------------------------------
  function enableAttribute(buffer, attribute, size, type) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, size, type, false, 0, 0);
  }

  enableAttribute(positionBuffer, aPosition, 3, gl.FLOAT);
  enableAttribute(normalBuffer, aNormal, 3, gl.FLOAT);
  enableAttribute(texCoordBuffer, aTexCoord, 2, gl.FLOAT);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  // -----------------------------------------------------------
  // Set Uniforms
  // -----------------------------------------------------------
  // We use the color map as the main texture
  gl.uniform1i(uColorMap, 0); // texture unit 0

  // Initialize Day/Night Cycle Variables
  let dayNightEnabled = true; // Toggle for day/night cycle (default to enabled)
  let lightAngle = 0; // Tracks the current angle of the light source
  const rotationSpeed = 0.003; // Speed at which the light moves (radians per frame)

  // Function to toggle day/night cycle
  function toggleDayNightCycle() {
    dayNightEnabled = !dayNightEnabled;
  }

  // Expose the toggle function globally (optional)
  window.toggleDayNightCycle = toggleDayNightCycle;

  // -----------------------------------------------------------
  // Matrix Setup (Model-View & Projection)
  // -----------------------------------------------------------
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
    out[10] = (far + near) * nf;
    out[11] = -1;

    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
  }

  function lookAt(out, eye, center, up) {
    const x0 = eye[0], x1 = eye[1], x2 = eye[2];
    const c0 = center[0], c1 = center[1], c2 = center[2];
    const u0 = up[0], u1 = up[1], u2 = up[2];

    let zx = x0 - c0, zy = x1 - c1, zz = x2 - c2;
    let len = Math.sqrt(zx*zx + zy*zy + zz*zz);
    zx /= len; zy /= len; zz /= len;

    let xx = u1*zz - u2*zy;
    let xy = u2*zx - u0*zz;
    let xz = u0*zy - u1*zx;
    len = Math.sqrt(xx*xx + xy*xy + xz*xz);
    xx /= len; xy /= len; xz /= len;

    let yx = zy*xz - zz*xy;
    let yy = zz*xx - zx*xz;
    let yz = zx*xy - zy*xx;

    len = Math.sqrt(yx*yx + yy*yy + yz*yz);
    yx /= len; yy /= len; yz /= len;

    out[0] = xx; out[1] = yx; out[2] = zx; out[3] = 0;
    out[4] = xy; out[5] = yy; out[6] = zy; out[7] = 0;
    out[8] = xz; out[9] = yz; out[10] = zz; out[11] = 0;
    out[12] = -(xx*x0 + xy*x1 + xz*x2);
    out[13] = -(yx*x0 + yy*x1 + yz*x2);
    out[14] = -(zx*x0 + zy*x1 + zz*x2);
    out[15] = 1;
  }

  function multiplyMatrix(out, a, b) {
    const m = new Float32Array(16);
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        m[j*4+i] = a[i]*b[j*4+0] + a[i+4]*b[j*4+1] + a[i+8]*b[j*4+2] + a[i+12]*b[j*4+3];
      }
    }
    out.set(m);
  }

  // -----------------------------------------------------------
  // Interaction Controls
  // -----------------------------------------------------------
  let rotationX = 0;     // rotation around X axis
  let rotationY = 0;     // rotation around Y axis
  let distance = 3;      // camera distance
  let dragging = false;
  let lastX, lastY;

  // Mouse events for rotation
  glcanvas.addEventListener('mousedown', e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });
  glcanvas.addEventListener('mouseup', () => {
    dragging = false;
  });
  glcanvas.addEventListener('mousemove', e => {
    if (dragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        // Adjust these factors for desired sensitivity
        rotationY += dx * 0.01; 
        rotationX += dy * 0.01;
        lastX = e.clientX;
        lastY = e.clientY;
    }
  });

  // Mouse wheel for zoom
  glcanvas.addEventListener('wheel', e => {
    distance += e.deltaY * 0.01;
    if (distance < 1) distance = 1;
    if (distance > 100) distance = 100;
  });
  let animationFrameId;
  let running = true;
  // -----------------------------------------------------------
  // Animation Loop
  // -----------------------------------------------------------
  let rotateSpeed = 0.0005;
  function drawScene() {
      if (!running) {
          return;
      }
      gl.clearColor(0,0,0,1);
      gl.clearDepth(1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
      // Projection
      const pMatrix = new Float32Array(16);
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      perspectiveMatrix(pMatrix, Math.PI/4, aspect, 0.1, 100.0);
    
      // Model-View
      const mvMatrix = new Float32Array(16);
      // Camera looking at [0,0,0] from [0,0,distance]
      lookAt(mvMatrix, [0,0,distance], [0,0,0], [0,1,0]);
    
      // Apply rotations from user input and slow auto-rotate
      rotationY += rotateSpeed;
    
      // Create rotation matrices
      const rotXMatrix = new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(rotationX), -Math.sin(rotationX), 0,
        0, Math.sin(rotationX), Math.cos(rotationX), 0,
        0, 0, 0, 1
      ]);
    
      const rotYMatrix = new Float32Array([
        Math.cos(rotationY), 0, Math.sin(rotationY), 0,
        0, 1, 0, 0,
        -Math.sin(rotationY), 0, Math.cos(rotationY), 0,
        0, 0, 0, 1
      ]);
    
      // Combine mvMatrix * rotX * rotY
      multiplyMatrix(mvMatrix, mvMatrix, rotXMatrix);
      multiplyMatrix(mvMatrix, mvMatrix, rotYMatrix);
    
      gl.uniformMatrix4fv(uPMatrix, false, pMatrix);
      gl.uniformMatrix4fv(uMVMatrix, false, mvMatrix);
    
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, colorTexture);

      // -----------------------------------------------------------
      // Update Light Direction for Day/Night Cycle
      // -----------------------------------------------------------
      let lightDir = [0, 0, 1]; // Initial light direction (pointing towards positive Z)
      if (dayNightEnabled) {
          // Rotate the light direction around the Y-axis to simulate Earth's rotation
          lightAngle += rotationSpeed;
          const cosAngle = Math.cos(lightAngle);
          const sinAngle = Math.sin(lightAngle);
          lightDir = [
              sinAngle, // X component
              0,        // Y component remains 0 for simplicity
              cosAngle  // Z component
          ];
      }

      // Normalize the light direction
      const length = Math.sqrt(lightDir[0]**2 + lightDir[1]**2 + lightDir[2]**2);
      lightDir = lightDir.map(component => component / length);

      // Pass the light direction to the shader
      gl.uniform3fv(uLightDirection, lightDir);

      // -----------------------------------------------------------
      // Draw the Sphere
      // -----------------------------------------------------------
      gl.drawElements(gl.TRIANGLES, sphereData.indices.length, gl.UNSIGNED_SHORT, 0);
        // Request next frame only if still running
      if (running) {
          animationFrameId = requestAnimationFrame(drawScene);
      }
  }
  GID("main-generator-div").style.display = "none";
  drawScene();
  // Listen for the Escape key press to stop the animation
  window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    running = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    GID("main-generator-div").style.display = "block";
    GID("glCanvas").style.display = "none"
  }
});
}
