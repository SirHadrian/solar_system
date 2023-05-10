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
  ShaderMaterial,
  Clock,
  Vector2,
  Uniform,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import _Sun_VS from './shaders/sun_VS.c?raw'
import _Sun_FS from './shaders/sun_FS.c?raw'

import _Atmo_VS from './shaders/atmosphere_VS.c?raw'
import _Atmo_FS from './shaders/atmosphere_FS.c?raw'

const clock = new Clock()
const uniforms = {
  R: new Uniform(new Vector2(window.innerWidth, window.innerHeight)),
  T: { value: 1.0 },
}

class SceneSetup extends Scene {

  constructor() {

    super()

  }

}


class CameraSetup extends PerspectiveCamera {

  constructor(fov: number, aspectRatio: number, nearDistance: number, farDistance: number) {

    super(fov, aspectRatio, nearDistance, farDistance)

    this.position.set(0, 0, 200)
    this.lookAt(0, 0, 0)
  }
}


class RendererSetup extends WebGLRenderer {

  constructor(configs: object, camera: CameraSetup) {

    super(configs)

    this.setSize(window.innerWidth, window.innerHeight)
    this.setPixelRatio(window.devicePixelRatio)
    this.outputEncoding = sRGBEncoding

    // Inject renderer to DOM
    const target = document.getElementById("app")
    target?.appendChild(this.domElement)

    // OrbitControls
    new OrbitControls(camera, this.domElement)
  }
}

class LightSetup extends AmbientLight {

  constructor(scene: Scene, color: ColorRepresentation, intensity: number) {

    super(color, intensity)

    this.position.set(0, 50, 100)

    // DEBUG light
    const light_sphere = new Mesh(
      new SphereGeometry(10, 10, 10),
      new MeshBasicMaterial({
        color: 0xffffff,
      })
    )
    light_sphere.position.set(this.position.x, this.position.y, this.position.z)
    scene.add(light_sphere)
    // ===========

  }
}


function main() {

  //#region INIT

  // Create Scene
  const scene = new SceneSetup()

  // Create Camera
  const camera = new CameraSetup(
    50, // FOV
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near: distance objects apear on camera
    1000, // Far: distance objects disapear from camera
  )

  // Create Renderer
  const renderer = new RendererSetup({ antialiasing: true }, camera)

  // Create light source
  const light = new LightSetup(
    scene,
    0xffffff,
    1
  )

  scene.add(light)

  //#endregion

  //#region PlayGround

  const gSphere = new SphereGeometry(5, 50, 50)
  const mSphere = new ShaderMaterial({
    vertexShader: _Sun_VS,
    fragmentShader: _Sun_FS,
    uniforms,
  })
  const sphere = new Mesh(gSphere, mSphere)
  scene.add(sphere)

  const gAtmophere = new SphereGeometry(5, 50, 50)
  const mAtmosphere = new ShaderMaterial({
    vertexShader: _Atmo_VS,
    fragmentShader: _Atmo_FS,
    uniforms,
    transparent: true,
  })
  const atmosphere = new Mesh(gAtmophere, mAtmosphere)
  atmosphere.scale.set(1.1, 1.1, 1.1)
  scene.add(atmosphere)

  //#endregion

  //#region Main loop and events

  // On window resize
  const resize = () => {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener("resize", resize, false)

  // Animation loop
  const animate = () => {

    uniforms.T.value = clock.getElapsedTime()

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()

  //#endregion
}


main()
