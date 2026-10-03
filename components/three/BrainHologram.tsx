"use client";

import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { scrollSignal, pointer, clamp } from "@/lib/scroll-signal";
import { useWebGLSupported } from "@/lib/use-webgl";
import { useInView } from "@/lib/use-in-view";

const SRC = "/media/models/brain_hologram.glb";

type P = { progressRef: RefObject<number> };

/**
 * Keeps the hologram's own materials readable on the light hero.
 *
 * Nothing here recolours: `color` and `emissive` are left exactly as the GLB
 * authored them, so the model keeps its native magenta and cyan. Three things
 * are still set, all of them about legibility rather than hue:
 *
 * - `emissiveIntensity` is pulled down from the asset's 10. The GLB ships
 *   `KHR_materials_emissive_strength: 10`, and there are no lights in this
 *   scene, so the subject renders as pure emissive. At 10x every channel blows
 *   past 1.0 and flattens magenta and cyan to the same washed near-white, which
 *   reads as "the model is missing". Just above 1 keeps the authored hues vivid
 *   without clipping to white.
 * - NormalBlending, not additive: additive light over this cream ground clamps
 *   to white the same way.
 * - A little transparency so the particle shells layer instead of fusing.
 */
function useHologramMaterial(group: THREE.Group) {
    useEffect(() => {
        group.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh || !mesh.material) return;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const raw of mats) {
                const m = raw as THREE.MeshStandardMaterial;
                if (!m.emissive) continue;
                m.emissiveIntensity = 1.1;
                m.blending = THREE.NormalBlending;
                // Depth writing off so the three shells of each colour layer up
                // instead of z-fighting each other into patches.
                m.depthWrite = false;
                m.transparent = true;
                m.opacity = 0.9;
                m.side = THREE.DoubleSide;
                m.needsUpdate = true;
            }
        });
    }, [group]);
}

/**
 * The hologram, normalised on load and animated thereafter.
 *
 * Framing is computed from the loaded bounds rather than hand-tuned: the asset
 * ships a 100x root scale and an off-origin pivot, so any hardcoded position
 * would be guessing. Whatever the bounds, the subject ends up centred on the
 * origin and scaled to a fixed size, which is what lets the camera framing stay
 * stable.
 */
function Hologram({ progressRef }: P) {
    const pivotRef = useRef<THREE.Group>(null);
    const fitRef = useRef<THREE.Group>(null);
    const { scene } = useGLTF(SRC);

    // clone() shares material instances with drei's cached scene, and the
    // material pass mutates them in place, so this instance needs its own copies.
    const model = useMemo(() => {
        const c = scene.clone(true);
        c.traverse((o) => {
            const mesh = o as THREE.Mesh;
            if (!mesh.isMesh) return;
            mesh.material = Array.isArray(mesh.material)
                ? mesh.material.map((m) => m.clone())
                : mesh.material.clone();
        });
        return c;
    }, [scene]);

    useHologramMaterial(model);

    useEffect(() => {
        const fit = fitRef.current;
        if (!fit) return;

        // Measure against a pristine group, never one a previous run already
        // scaled. Next.js runs React in StrictMode, which invokes this effect
        // twice on mount: the second pass would otherwise measure the fitted
        // four-unit result, compute k = 1, and scale the subject back down to
        // its raw ~1.6-unit size — which is what made it render tiny and made
        // changing the target below have no visible effect.
        fit.scale.setScalar(1);
        fit.position.set(0, 0, 0);
        fit.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(fit);
        const size = new THREE.Vector3();
        const centre = new THREE.Vector3();
        box.getSize(size);
        box.getCenter(centre);

        const maxDim = Math.max(size.x, size.y, size.z);
        if (!Number.isFinite(maxDim) || maxDim <= 0) return;

        // A three.js group maps a child point p to `position + scale * p`, so
        // landing the centroid `centre` on the origin requires the offset to be
        // the *pre-scaled* centroid, not the raw one. The fit group holds both
        // the scale and that offset and is never touched again, leaving the
        // pivot above it free to rotate and bob without disturbing either.
        //
        // 3.5 units — a touch larger than the original 2.9 — so the subject
        // reads as the presence on its stage without the tightest framing
        // cropping the outer particles as it rotates.
        const k = 3.5 / maxDim;
        fit.scale.setScalar(k);
        fit.position.set(-centre.x * k, -centre.y * k, -centre.z * k);
        fit.updateMatrixWorld(true);
    }, [model]);

    useFrame((state, delta) => {
        const g = pivotRef.current;
        if (!g) return;
        const p = clamp(progressRef.current ?? 0);
        const t = state.clock.elapsedTime;
        const v = clamp(Math.abs(scrollSignal.velocity) / 26);

        // Rotation, not scale. The previous hero entity grew to 1.28x while its
        // own detail expanded 2.45x, which is what pushed it past its stage and
        // got it clipped by the container. Here the footprint is fixed: the
        // subject always turns on its own, and scroll only speeds that turn up.
        g.rotation.y += delta * (0.35 + p * 0.55);
        g.rotation.x = THREE.MathUtils.lerp(
            g.rotation.x,
            -0.12 + pointer.y * 0.16,
            0.06
        );

        // Hover plus a scroll-velocity kick that settles back on its own.
        g.position.y = Math.sin(t * 0.7) * 0.06 + pointer.y * 0.04;
        g.position.z = Math.sin(t * 0.45) * 0.05;
        g.position.x = Math.sin(t * 0.33) * 0.04;
        g.scale.setScalar(1 + v * 0.05 + Math.sin(t * 1.3) * 0.012);
    });

    return (
        <group ref={pivotRef}>
            <group ref={fitRef}>
                <primitive object={model} />
            </group>
        </group>
    );
}

/**
 * Camera framing. The radius holds or eases outward with progress and never
 * closes in, so the subject cannot be cropped by its container at any scroll
 * position — scrolling back up included.
 */
function Rig({ progressRef }: P) {
    const three = useThree();
    // Read once into a ref so the frame loop mutates a local rather than a
    // value the compiler treats as immutable render output.
    const camera = useRef(three.camera);

    useFrame(() => {
        const cam = camera.current;
        if (!cam) return;
        const p = clamp(progressRef.current ?? 0);
        const angle = -0.5 + p * 1.1 + pointer.x * 0.12;
        // Framed against a 3.5-unit subject: this distance holds or eases out
        // with progress so the subject is never cropped harder as the reader
        // scrolls, in either direction.
        const radius = 3.95 + p * 0.45;
        cam.position.set(
            Math.sin(angle) * radius,
            0.2 - p * 0.35 + pointer.y * 0.08,
            Math.cos(angle) * radius
        );
        cam.lookAt(0, 0, 0);
    });

    return null;
}

/**
 * Hero entity — the brain hologram, replacing the previous shader shell.
 *
 * Wrapped in Suspense so the route paints immediately: the asset is 16MB and
 * must never hold up first render.
 */
export function BrainHologram({ progressRef }: P) {
    const supported = useWebGLSupported();
    const hostRef = useRef<HTMLDivElement>(null);
    const live = useInView(hostRef);

    if (!supported) return null;

    return (
        // The wrapper is load-bearing, not decoration: R3F sizes its canvas from
        // `canvas.parentElement.getBoundingClientRect()`. A bare <Canvas> mounts
        // into the entity div, and if that div collapses the canvas measures 0x0
        // and the subject renders a few pixels across.
        <div ref={hostRef} className="relative h-full w-full">
            <Canvas
                dpr={[1, 1.75]}
                // The hero is the one canvas that is on screen for most of the
                // first read, but it is also the largest and most expensive.
                // Pausing it once the reader is well past it keeps a 16MB
                // emissive model off the main thread for the rest of the page.
                frameloop={live ? "always" : "never"}
                // `flat` disables ACES tone mapping. The subject is unlit and
                // pure emissive, so tone mapping only compresses its already
                // in-range channels and desaturates magenta and cyan toward
                // white. With it off the authored colours survive intact.
                flat
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                camera={{ position: [0, 0.2, 3.95], fov: 42 }}
                style={{ background: "transparent" }}
            >
                <Suspense fallback={null}>
                    <Rig progressRef={progressRef} />
                    <Hologram progressRef={progressRef} />
                </Suspense>
            </Canvas>
        </div>
    );
}
