/* eslint-disable @typescript-eslint/no-explicit-any */
import { Camera, Mesh, Plane, Program, Renderer, Texture, Transform, Raycast, Vec2 } from 'ogl';
import { useEffect, useRef } from 'react';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

import './CircularGallery.css';

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function autoBind(instance: any) {
  const proto = Object.getPrototypeOf(instance);
  Object.getOwnPropertyNames(proto).forEach(key => {
    if (key !== 'constructor' && typeof instance[key] === 'function') {
      instance[key] = instance[key].bind(instance);
    }
  });
}

function createDetailsTexture(gl: any, text: string, category: string, font = '900 64px "Big Shoulders Display", sans-serif') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return { texture: new Texture(gl), width: 0, height: 0 };

  const scale = 2;
  const width = 800 * scale;
  const height = 800 * scale;
  canvas.width = width;
  canvas.height = height;
  context.scale(scale, scale);
  context.clearRect(0, 0, width, height);

  // Explicitly reset any shadows for a flat look
  context.shadowBlur = 0;
  context.shadowColor = 'transparent';
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  // Category DNA
  context.font = '900 24px "Big Shoulders Display", sans-serif';
  if ('letterSpacing' in context) (context as any).letterSpacing = "12px";
  context.fillStyle = '#ef4444';
  context.textAlign = 'center';
  context.fillText(category.toUpperCase(), 400, 300);

  // Title DNA: Creative Strand (Matches Work Page Headline)
  context.font = '900 80px "Big Shoulders Display", sans-serif';
  if ('letterSpacing' in context) (context as any).letterSpacing = "-5.5px";
  context.textBaseline = 'middle';

  const words = text.split(' ');
  let part1 = '';
  let part2 = '';

  if (words.length >= 2) {
    part1 = words[0];
    part2 = ' ' + words.slice(1).join(' ');
  } else {
    const half = Math.ceil(text.length / 2);
    part1 = text.slice(0, half);
    part2 = text.slice(half);
  }

  const w1 = context.measureText(part1).width;
  const w2 = context.measureText(part2).width;
  const totalW = w1 + w2;
  let startX = 400 - totalW / 2;

  // Draw DNA Split (Exact Headline Match)
  context.textAlign = 'left';
  context.fillStyle = '#ef4444'; // Standard Brand Red
  context.fillText(part1, startX, 400);

  context.fillStyle = 'white'; // Pure White
  context.fillText(part2, startX + w1 + 10, 400); // Added slight spacing

  const texture = new Texture(gl, { generateMipmaps: false, minFilter: gl.LINEAR, magFilter: gl.LINEAR });
  texture.image = canvas;
  return { texture, width: 800, height: 800 };
}

class Details {
  gl: any; plane: any; text: string; category: string; font: string; mesh: any;

  constructor({ gl, plane, text, category, font }: any) {
    this.gl = gl; this.plane = plane; this.text = text; this.category = category; this.font = font;
    this.createMesh();
  }
  createMesh() {
    const { texture } = createDetailsTexture(this.gl, this.text, this.category, this.font);
    const geometry = new Plane(this.gl);
    const program = new Program(this.gl, {
      vertex: `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; uniform float uHover; varying vec2 vUv; void main() { vUv = uv; vec3 pos = position; pos.y += (1.0 - uHover) * 0.2; pos.z += uHover * 1.2; gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); }`,
      fragment: `precision highp float; uniform sampler2D tMap; uniform float uHover; varying vec2 vUv; void main() { vec4 color = texture2D(tMap, vUv); gl_FragColor = vec4(color.rgb, color.a * uHover); }`,
      uniforms: { tMap: { value: texture }, uHover: { value: 0 } },
      transparent: true
    });
    this.mesh = new Mesh(this.gl, { geometry, program });
    this.mesh.setParent(this.plane);
    this.onResize();
  }
  onResize() {
    if (!this.plane) return;
    const parentScaleX = this.plane.scale.x;
    const parentScaleY = this.plane.scale.y;
    // Target the text to be a fixed portion of the viewport width relative to the card
    // This compensates for the parent card being narrow/tall
    const targetWidth = parentScaleX * 1.5;
    this.mesh.scale.x = targetWidth / parentScaleX;
    this.mesh.scale.y = targetWidth / parentScaleY;
    this.mesh.position.z = 0.2;
  }
}

// Media class handles the project cards
class Media {
  extra: number = 0; geometry: any; gl: any; image: string; index: number; length: number; scene: any; screen: any; text: string; viewport: any; bend: number; borderRadius: number; font: string; program: any; plane: any; width: any; widthTotal: any; x: any;
  details: any;
  isHovered: boolean = false; hoverValue: number = 0;

  constructor({ geometry, gl, image, index, length, scene, screen, text, category, viewport, bend, borderRadius, font }: any) {
    Object.assign(this, { geometry, gl, image, index, length, scene, screen, text, category, viewport, bend, borderRadius, font });
    this.createShader();
    this.createMesh();
    this.details = new Details({ gl, plane: this.plane, text, category, font });
    this.onResize();
  }
  createShader() {
    const texture = new Texture(this.gl, { generateMipmaps: true, minFilter: this.gl.LINEAR_MIPMAP_LINEAR, magFilter: this.gl.LINEAR });
    this.program = new Program(this.gl, {
      vertex: `attribute vec3 position; attribute vec2 uv; uniform mat4 modelViewMatrix; uniform mat4 projectionMatrix; varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragment: `precision highp float; uniform vec2 uImageSizes; uniform vec2 uPlaneSizes; uniform sampler2D tMap; uniform float uBorderRadius; uniform float uHover; varying vec2 vUv;
        float roundedBoxSDF(vec2 p, vec2 b, float r) { vec2 d = abs(p) - b; return length(max(d, vec2(0.0))) + min(max(d.x, d.y), 0.0) - r; }
        void main() {
          vec2 ratio = vec2(min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0), min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0));
          vec2 uv = vUv * ratio + (1.0 - ratio) * 0.5;
          vec4 color = texture2D(tMap, uv);
          float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
          float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          float borderAlpha = smoothstep(-0.002, 0.002, d + 0.008) - smoothstep(-0.002, 0.002, d);
          vec3 finalColor = mix(color.rgb, vec3(1.0), borderAlpha * (0.2 + uHover * 0.4));
          finalColor += uHover * 0.1; 
          gl_FragColor = vec4(finalColor, alpha);
        }`,
      uniforms: { tMap: { value: texture }, uPlaneSizes: { value: [0, 0] }, uImageSizes: { value: [0, 0] }, uBorderRadius: { value: this.borderRadius }, uHover: { value: 0 } },
      transparent: true
    });
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = this.image;
    img.onload = () => {
      texture.image = img; this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
      const ext = this.gl.getExtension('EXT_texture_filter_anisotropic');
      if (ext) {
        const max = this.gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture.texture);
        this.gl.texParameterf(this.gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
      }
    };
  }
  createMesh() { this.plane = new Mesh(this.gl, { geometry: this.geometry, program: this.program }); this.plane.setParent(this.scene); }
  update(scroll: any, direction: string) {
    this.plane.position.x = this.x - scroll.current - this.extra;
    const x = this.plane.position.x;
    const H = this.viewport.width / 2;
    if (this.bend !== 0) {
      const R = (H * H + this.bend * this.bend) / (2 * Math.abs(this.bend));
      const effectiveX = Math.min(Math.abs(x), H);
      const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
      this.plane.position.y = Math.sign(this.bend) === -1 ? arc : -arc;
      this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R) * Math.sign(this.bend);
    } else { this.plane.position.y = 0; this.plane.rotation.z = 0; }
    const planeOffset = this.plane.scale.x / 2;
    const viewportOffset = this.viewport.width / 2;
    if (direction === 'right' && this.plane.position.x + planeOffset < -viewportOffset) this.extra -= this.widthTotal;
    if (direction === 'left' && this.plane.position.x - planeOffset > viewportOffset) this.extra += this.widthTotal;
    this.hoverValue = lerp(this.hoverValue, this.isHovered ? 1 : 0, 0.1);
    this.program.uniforms.uHover.value = this.hoverValue;
    this.plane.scale.z = 1 + this.hoverValue * 0.05;
    this.plane.children.forEach((child: any) => {
      if (child.program.uniforms.uHover) child.program.uniforms.uHover.value = this.hoverValue;
    });
  }
  onResize({ screen, viewport }: any = {}) {
    if (screen) this.screen = screen; if (viewport) this.viewport = viewport;
    const scale = this.screen.height / 1200;
    this.plane.scale.y = (this.viewport.height * (800 * scale)) / this.screen.height;
    this.plane.scale.x = (this.viewport.width * (700 * scale)) / this.screen.width;
    this.program.uniforms.uPlaneSizes.value = [this.plane.scale.x, this.plane.scale.y];
    this.width = this.plane.scale.x + 1.5;
    this.widthTotal = this.width * this.length;
    this.x = this.width * this.index;
    if (this.details) this.details.onResize();
  }
}

class App {
  container: HTMLElement; scrollSpeed: number; scroll: any; renderer: any; gl: any; camera: any; scene: any; screen: any; viewport: any; planeGeometry: any; medias: any; isDown: boolean = false; start: number = 0; raf: any;
  raycast: any; mouse: Vec2; onClick: (text: string) => void;
  startTime: number = 0; currentIntersect: any = null;
  boundHandlers: any = {};

  constructor(container: HTMLElement, { items, bend, borderRadius, font, scrollSpeed, scrollEase, onClick }: any) {
    this.container = container; this.scrollSpeed = scrollSpeed; this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    this.onClick = onClick;
    this.renderer = new Renderer({ alpha: true, antialias: true, dpr: window.devicePixelRatio });
    this.gl = this.renderer.gl; this.container.appendChild(this.gl.canvas);
    this.camera = new Camera(this.gl); this.camera.position.z = 20; this.scene = new Transform();
    this.raycast = new Raycast(); this.mouse = new Vec2(-10, -10);
    this.planeGeometry = new Plane(this.gl, { heightSegments: 1, widthSegments: 1 });
    this.onResize();
    const images = (items || []).concat(items || []);
    this.medias = images.map((data: any, index: number) => new Media({ geometry: this.planeGeometry, gl: this.gl, image: getOptimizedImageUrl(data.image, 800), index, length: images.length, scene: this.scene, screen: this.screen, text: data.text, category: data.category || '', viewport: this.viewport, bend, borderRadius, font }));
    
    // Pre-bind handlers for reliable cleanup
    this.boundHandlers.onResize = this.onResize.bind(this);
    this.boundHandlers.onWheel = this.onWheel.bind(this);
    this.boundHandlers.onTouchDown = this.onTouchDown.bind(this);
    this.boundHandlers.onTouchMove = this.onTouchMove.bind(this);
    this.boundHandlers.onTouchUp = this.onTouchUp.bind(this);

    this.update(); this.addEventListeners();
  }
  onTouchDown(e: any) { 
    this.isDown = true; 
    this.scroll.position = this.scroll.current; 
    this.start = e.touches ? e.touches[0].clientX : e.clientX; 
    this.startTime = Date.now();

    // Update mouse coordinates immediately on touch down
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    this.mouse.set((x / this.screen.width) * 2 - 1, -(y / this.screen.height) * 2 + 1);

    // Initial raycast check
    this.raycast.castMouse(this.camera, this.mouse);
    const intersects = this.raycast.intersectBounds(this.medias.map((m: any) => m.plane));
    this.currentIntersect = intersects.length ? this.medias.find((m: any) => m.plane === intersects[0]) : null;
  }

  onTouchUp() {
    this.isDown = false;
    const duration = Date.now() - (this.startTime || 0);
    
    // Only trigger click if it was a short tap/click (less than 250ms)
    if (duration < 250 && this.currentIntersect) {
      this.onClick(this.currentIntersect.text);
    }
    this.currentIntersect = null;
  }
  onTouchMove(e: any) {
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    this.mouse.set((x / this.screen.width) * 2 - 1, -(y / this.screen.height) * 2 + 1);
    if (!this.isDown) return;
    this.scroll.target = this.scroll.position + (this.start - x) * (this.scrollSpeed * 0.025);
  }
  onWheel(e: any) { this.scroll.target += e.deltaY * (this.scrollSpeed * 0.05); }
  onResize() {
    this.screen = { width: this.container.clientWidth, height: this.container.clientHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.perspective({ aspect: this.screen.width / this.screen.height });
    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    this.viewport = { width: height * this.camera.aspect, height };
    if (this.medias) this.medias.forEach((m: any) => m.onResize({ screen: this.screen, viewport: this.viewport }));
  }
  update() {
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);
    const direction = this.scroll.current > this.scroll.last ? 'right' : 'left';

    if (this.medias && this.medias.length) {
      this.raycast.castMouse(this.camera, this.mouse);
      const intersects = this.raycast.intersectBounds(this.medias.map((m: any) => m.plane));
      let hoveredMedia = intersects.length ? intersects[0] : null;
      this.container.style.cursor = hoveredMedia ? 'pointer' : 'default';
      this.medias.forEach((m: any) => {
        m.isHovered = (m.plane === hoveredMedia);
        m.update(this.scroll, direction);
      });
    }

    this.renderer.render({ scene: this.scene, camera: this.camera });
    this.scroll.last = this.scroll.current; this.raf = window.requestAnimationFrame(this.update.bind(this));
  }
  addEventListeners() {
    window.addEventListener('resize', this.boundHandlers.onResize);
    window.addEventListener('wheel', this.boundHandlers.onWheel);
    window.addEventListener('mousedown', this.boundHandlers.onTouchDown);
    window.addEventListener('mousemove', this.boundHandlers.onTouchMove);
    window.addEventListener('mouseup', this.boundHandlers.onTouchUp);
    window.addEventListener('touchstart', this.boundHandlers.onTouchDown);
    window.addEventListener('touchmove', this.boundHandlers.onTouchMove);
    window.addEventListener('touchend', this.boundHandlers.onTouchUp);
  }
  destroy() { 
    window.cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.boundHandlers.onResize);
    window.removeEventListener('wheel', this.boundHandlers.onWheel);
    window.removeEventListener('mousedown', this.boundHandlers.onTouchDown);
    window.removeEventListener('mousemove', this.boundHandlers.onTouchMove);
    window.removeEventListener('mouseup', this.boundHandlers.onTouchUp);
    window.removeEventListener('touchstart', this.boundHandlers.onTouchDown);
    window.removeEventListener('touchmove', this.boundHandlers.onTouchMove);
    window.removeEventListener('touchend', this.boundHandlers.onTouchUp);
    if (this.renderer?.gl.canvas.parentNode) this.renderer.gl.canvas.parentNode.removeChild(this.renderer.gl.canvas); 
  }
}

export default function CircularGallery({ items, bend = 0, borderRadius = 0.05, font = '900 60px "Big Shoulders Display", sans-serif', scrollSpeed = 2, scrollEase = 0.05, onClick }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!containerRef.current) return;

    let app: any;
    // Wait for fonts to be ready for accurate canvas measurements
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;
      app = new App(containerRef.current, { items, bend, borderRadius, font, scrollSpeed, scrollEase, onClick });
    });

    return () => {
      if (app) app.destroy();
    };
  }, [items, bend, borderRadius, font, scrollSpeed, scrollEase, onClick]);
  return <div className="circular-gallery" ref={containerRef} />;
}
