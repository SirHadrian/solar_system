import {
  Scene,
  AdditiveBlending,
  Points,
  PointsMaterial,
  BackSide,
  BufferGeometry,
  Float32BufferAttribute,
  TextureLoader,
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
  Vector3,
} from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Sun
import _Sun_VS from './shaders/sun_VS.c?raw'
import _Sun_FS from './shaders/sun_FS.c?raw'

import _Atmo_VS from './shaders/atmosphere_VS.c?raw'
import _Atmo_FS from './shaders/atmosphere_FS.c?raw'

// Earth
import _Earth_VS from './shaders/_Earth_VS?raw'
import _Earth_FS from './shaders/_Earth_FS?raw'

import _Atmosphere_VS from './shaders/_Atmosphere_VS?raw'
import _Atmosphere_FS from './shaders/_Atmosphere_FS?raw'

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

  const gSphere = new SphereGeometry(10, 50, 50)
  const mSphere = new ShaderMaterial({
    vertexShader: _Sun_VS,
    fragmentShader: _Sun_FS,
    uniforms,
  })
  const sphere = new Mesh(gSphere, mSphere)
  scene.add(sphere)

  const gAtmophere = new SphereGeometry(10, 50, 50)
  const mAtmosphere = new ShaderMaterial({
    vertexShader: _Atmo_VS,
    fragmentShader: _Atmo_FS,
    uniforms,
    transparent: true,
  })
  const atmosphere = new Mesh(gAtmophere, mAtmosphere)
  atmosphere.scale.set(1.1, 1.1, 1.1)
  scene.add(atmosphere)


  // Earth
  const earth = new Mesh(
    new SphereGeometry(10, 50, 50),
    new ShaderMaterial({
      vertexShader: _Earth_VS,
      fragmentShader: _Earth_FS,
      uniforms: {
        globeTexture: {
          value: new TextureLoader().load('./assets/earth.jpg'),
        }
      }
    })
  )
  earth.rotateZ(-0.1)
  earth.position.add(new Vector3(-30, 0, 0))
  scene.add(earth)

  // Clouds
  const clouds = new Mesh(
    new SphereGeometry(10, 50, 50),
    new ShaderMaterial({
      vertexShader: _Earth_VS,
      fragmentShader: _Earth_FS,
      blending: AdditiveBlending,
      transparent: true,
      uniforms: {
        globeTexture: {
          value: new TextureLoader().load('./assets/clouds.jpg'),
        }
      }
    })
  )
  clouds.scale.set(1.01, 1.01, 1.01)
  clouds.position.add(new Vector3(-30, 0, 0))
  scene.add(clouds)

  // Atmosphere
  const earth_atmosphere = new Mesh(
    new SphereGeometry(10, 50, 50),
    new ShaderMaterial({
      vertexShader: _Atmosphere_VS,
      fragmentShader: _Atmosphere_FS,
      blending: AdditiveBlending,
      side: BackSide,
    })
  )
  earth_atmosphere.scale.set(1.1, 1.1, 1.1)
  earth_atmosphere.position.add(new Vector3(-30, 0, 0))
  scene.add(earth_atmosphere)


  // Stars
  const material = new PointsMaterial({
    size: 10,
    map: new TextureLoader().load(
      "./assets/star.png"
    ),
    transparent: true,
  })

  const geometry = new BufferGeometry()
  const generatePoints = (num: number) => {
    const stars = []
    for (let i = 0; i < num * 3; ++i) {
      let x = (Math.random() - 0.5) * 2000
      let y = (Math.random() - 0.5) * 2000
      let z = -1 * Math.random() * 2000

      stars.push(x, y, z)
    }
    return stars
  }

  geometry.setAttribute(
    "position",
    new Float32BufferAttribute(generatePoints(1000), 3)
  )

  const stars = new Points(geometry, material)
  scene.add(stars)

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

    earth.rotateY(0.01)
    clouds.rotateY(0.01)

    renderer.render(scene, camera)
    requestAnimationFrame(animate)
  }
  animate()

  //#endregion
}

main()
