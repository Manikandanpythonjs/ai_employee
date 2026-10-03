"use client";

import { Suspense, useEffect, useMemo, useRef, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { useWebGLSupported } from "@/lib/use-webgl";
import { useInView } from "@/lib/use-in-view";

/**
 * A lit turntable viewer for the scanned / sculpted assets.
 *
 * The brain hologram is unlit and pure emissive, so it needs nothing but its
 * own colour. These assets are ordinary PBR — textured skin and fabric,
 * alpha-masked hair — so they are invisible without lights. Three lights carry
 * it: a warm key at the front-left, a cool fill opposite, and a low bounce
 * underneath, roughly the setup a product photographer would use.
 */
type Props = {
  src: string;
  /**
   * Fraction of the frame the subject's bounding sphere fills, 0..1.
   *
   * A sphere of radius 1 exactly touches the frustum, so anything above 1 is
   * clipped by construction — that is why `radius` used to mean "bigger" and
   * silently cut models off. Measure with the fit: this is not a free size knob.
   */
  radius?: number;
  /** Auto-rotation speed in radians per second. 0 disables it. */
  spin?: number;
  /**
   * Name of the animation clip to loop, e.g. `"idle"`. Omit for a still model.
   *
   * Deliberately a name rather than a boolean: the sci-fi robot carries three
   * clips that animate the same bones in conflicting directions, so playing
   * "all of them" would blend them into noise. The asset decides what it has;
   * the caller picks one.
   */
  clip?: string;
  className?: string;
  children?: ReactNode;
};

/** Camera distance. Fixed, so the fit below can solve against it. */
const DIST = 2.6;
const FOV = 40;

/**
 * The union of everything the subject can occupy: its bind pose plus, when a
 * clip is playing, every pose that clip passes through.
 *
 * `Box3.setFromObject` only knows the bind pose, so a clip that moves the
 * subject — the robots' `Sitting` and `Free_Fall` translate whole limbs — would
 * swing outside the measured box and get clipped by the frame. Sampling the
 * clip is what makes "fit" mean fit for the whole animation, not just its
 * first frame.
 */
function measure(model: THREE.Object3D, clips: THREE.AnimationClip[]) {
  const union = new THREE.Box3();

  if (clips.length === 0) {
    union.setFromObject(model);
    return union;
  }

  // Measured on a throwaway clone: sampling a clip leaves the bones posed, and
  // the real model must not inherit that. The clone shares geometry and
  // materials, so this costs rebinding a skeleton rather than a copy.
  const probe = cloneSkinned(model);
  const mixer = new THREE.AnimationMixer(probe);

  for (const clip of clips) {
    const action = mixer.clipAction(clip);
    action.play();

    const STEPS = 8;
    for (let i = 0; i <= STEPS; i++) {
      mixer.setTime((clip.duration * i) / STEPS);
      probe.updateMatrixWorld(true);
      union.union(new THREE.Box3().setFromObject(probe));
    }
  }

  mixer.stopAllAction();
  mixer.uncacheRoot(probe);
  return union;
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2.4, 3, 3]} intensity={2.2} />
      <directionalLight position={[-3, 1.2, 1.5]} intensity={0.85} color="#9fb6ff" />
      <directionalLight position={[0, -2, -1]} intensity={0.4} color="#ffd9b8" />
    </>
  );
}

/**
 * Normalises the asset and pulls the camera back far enough that the whole
 * subject fits the container.
 *
 * Two things had to be solved together. The obvious version scales the model so
 * its largest dimension equals `radius`, which fits the *height* of a portrait
 * frame and nothing else: in a wide container the camera's horizontal field is
 * much larger than its vertical one, so a tall subject overflowed and only its
 * middle was visible. Instead the scale is solved against whichever frustum axis
 * is tighter, using the real camera aspect — so the subject is fully contained
 * at any container size, and re-solved on resize.
 */
function Subject({
  src,
  radius,
  spin,
  clip,
}: Required<Omit<Props, "className" | "children">>) {
  const pivotRef = useRef<THREE.Group>(null);
  const fitRef = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const { scene, animations } = useGLTF(src);

  /* `Object3D.clone` copies bone *references*, so a cloned skinned mesh keeps
     reading the bones it was cloned from while a mixer drives its own copies.
     The mesh then never moves, and the clip plays into nothing. `SkeletonUtils`
     is the clone that rebinds the skeleton to the new bone tree. */
  const model = useMemo(() => {
    const c = cloneSkinned(scene);
    // cloneSkinned shares material instances, so anything that might mutate a
    // material still needs its own copies.
    c.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map((m) => m.clone())
        : mesh.material.clone();
    });
    return c;
  }, [scene]);

  // Clips authored for these assets: the sci-fi robot has Free_Fall, Look_Wave
  // and Sitting, the human has idle, the small robot a single take. Only the
  // requested one runs — see the `clip` prop for why that matters.
  const { actions } = useAnimations(animations, model);
  useEffect(() => {
    if (!clip) return;
    // drei types every entry as nullable, since the mixer is empty until the
    // clip is bound.
    const action = actions[clip];
    if (!action) return;

    action.reset().play();

    return () => {
      action.stop();
    };
  }, [actions, clip]);

  useEffect(() => {
    const fit = fitRef.current;
    if (!fit) return;

    // Measure against a pristine group, never one a previous run already
    // scaled: this effect runs twice under StrictMode, and a second pass over
    // an already-fitted group would measure the fitted result and scale the
    // model straight back to its authored size.
    fit.scale.setScalar(1);
    fit.position.set(0, 0, 0);
    fit.updateMatrixWorld(true);

    const active = clip ? animations.filter((c) => c.name === clip) : [];
    const box = measure(fit, active);

    const dim = new THREE.Vector3();
    const centre = new THREE.Vector3();
    box.getSize(dim);
    box.getCenter(centre);

    // Bounding sphere: the subject is contained if this is, whatever its
    // proportions and whatever way it is turned.
    const sphereR = Math.max(dim.x, dim.y, dim.z) / 2;
    if (!Number.isFinite(sphereR) || sphereR <= 0) return;

    const persp = camera as THREE.PerspectiveCamera;
    const vFov = ((persp.fov || FOV) * Math.PI) / 180;
    // Half-extents of the frustum at the subject's distance.
    const halfH = DIST * Math.tan(vFov / 2);
    const halfW = halfH * Math.max(0.1, size.width / Math.max(1, size.height));
    // The tighter axis is what the subject has to fit inside.
    const k = (radius * Math.min(halfH, halfW)) / sphereR;

    // A group maps a child point p to `position + scale * p`, so landing the
    // centroid on the origin needs the pre-scaled centroid as the offset.
    fit.scale.setScalar(k);
    fit.position.set(-centre.x * k, -centre.y * k, -centre.z * k);
    fit.updateMatrixWorld(true);
  }, [model, radius, camera, size.width, size.height, animations, clip]);

  // Turntable plus drag-to-orbit, both living on one angle so they compose
  // instead of fighting over rotation.y.
  //
  // This state is deliberately per-subject. It used to be read from the shared
  // `pointer` global in scroll-signal, which holds one value for the whole
  // document — so moving the cursor rotated every model on the page at once,
  // including ones far off screen. Pointer state has to be per-canvas to be
  // per-model.
  const angle = useRef(0);
  const dragging = useRef(false);
  const lastX = useRef(0);

  useFrame((state, delta) => {
    const g = pivotRef.current;
    if (!g) return;
    if (spin) angle.current += delta * spin;
    g.rotation.y = angle.current;
    g.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
  });

  const grab = (e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
  };

  const drag = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    angle.current += (e.clientX - lastX.current) * 0.01;
    lastX.current = e.clientX;
  };

  const release = () => {
    dragging.current = false;
  };

  return (
    <group
      ref={pivotRef}
      onPointerDown={grab}
      onPointerMove={drag}
      onPointerUp={release}
      onPointerLeave={release}
    >
      <group ref={fitRef}>
        <primitive object={model} />
      </group>

      {/* Invisible backdrop.
          * R3F delivers pointer events by raycasting the scene, and a group has
          * no geometry of its own — so a drag only registers when it *starts on
          * the model*. Starting it in the empty part of the frame would do
          * nothing, which reads as a broken control rather than a precise one.
          * A transparent plane behind the subject gives the whole frame a hit
          * area; it is a child of the pivot, so its events bubble to the same
          * handlers.
          *
          * Transparent rather than `visible={false}`: three's raycaster ignores
          * visibility, but R3F's event layer does its own filtering, and an
          * invisible object is the more fragile of the two to rely on. */}
      <mesh position={[0, 0, -0.6]}>
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function EntityModel({
  src,
  radius = 0.9,
  spin = 0.18,
  clip = "",
  className = "",
  children,
}: Props) {
  const supported = useWebGLSupported();
  const hostRef = useRef<HTMLDivElement>(null);
  // Stop the render loop once the model leaves the neighbourhood of the
  // viewport. It stays mounted, so scrolling back is instant — it just stops
  // paying for a GL context nobody can see.
  const live = useInView(hostRef);

  if (!supported) return null;

  return (
    // Load-bearing wrapper: R3F sizes its canvas from the parent's bounding
    // rect, so a collapsing parent would render the subject a few pixels wide.
    <div ref={hostRef} className={`relative h-full w-full ${className}`}>
      <Canvas
        dpr={[1, 1.75]}
        frameloop={live ? "always" : "never"}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        camera={{ position: [0, 0.06, DIST], fov: FOV }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Lights />
          <Subject src={src} radius={radius} spin={spin} clip={clip} />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}