import {
  Scene,
  Mesh,
  WebGLRenderer,
  PerspectiveCamera,
  sRGBEncoding,
  AmbientLight,
  ColorRepresentation,
  SphereGeometry,
  MeshBasicMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


class SceneSetup extends Scene {

  constructor() {

    super();

  }

}


class CameraSetup extends PerspectiveCamera {

  constructor(fov: number, aspectRatio: number, nearDistance: number, farDistance: number) {

    super(fov, aspectRatio, nearDistance, farDistance);

    this.position.set(0, 0, 200);
    this.lookAt(0, 0, 0);
  }
}


class RendererSetup extends WebGLRenderer {

  constructor(configs: object, camera: CameraSetup) {

    super(configs);

    this.setSize(window.innerWidth, window.innerHeight);
    this.setPixelRatio(window.devicePixelRatio);
    this.outputEncoding = sRGBEncoding;

    // Inject renderer to DOM
    const target = document.getElementById("app");
    target?.appendChild(this.domElement);

    // OrbitControls
    new OrbitControls(camera, this.domElement);
  }
}

class LightSetup extends AmbientLight {

  constructor(scene: Scene, color: ColorRepresentation, intensity: number) {

    super(color, intensity);

    this.position.set(0, 50, 100);

    // DEBUG light
    const light_sphere = new Mesh(
      new SphereGeometry(10, 10, 10),
      new MeshBasicMaterial({
        color: 0xffffff,
      })
    );
    light_sphere.position.set(this.position.x, this.position.y, this.position.z);
    scene.add(light_sphere);
    // ===========

  }
}


function main() {

  //#region INIT

  // Create Scene
  const scene = new SceneSetup();

  // Create Camera
  const camera = new CameraSetup(
    50, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near: distance objects apear on camera
    1000, // Far: distance objects disapear from camera
  );

  // Create Renderer
  const renderer = new RendererSetup({ antialiasing: true }, camera);

  // Create light source
  const light = new LightSetup(
    scene,
    0xffffff,
    1
  );

  scene.add(light);

  //#endregion

  //#region Main loop and events

  // On window resize
  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize, false);

  // Animation loop
  const animate = () => {


    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  //#endregion
}


main()
