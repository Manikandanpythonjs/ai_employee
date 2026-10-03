"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { clamp, pointer } from "@/lib/scroll-signal";
import { useWebGLSupported } from "@/lib/use-webgl";
import { useInView } from "@/lib/use-in-view";

type Spec = {
    label: string;
    ring: 0 | 1 | 2;
    angle: number;
    color: string;
    r: number;
};

const R = [0, 2.5, 4.3];

/** Orchestrator → 8 agents → 8 tools. Placement is deterministic by design. */
const NODES: Spec[] = [
    { label: "ORCHESTRATOR", ring: 0, angle: 0, color: "#ff4a1c", r: 0.16 },

    { label: "PLANNER", ring: 1, angle: 0.0, color: "#121317", r: 0.1 },
    { label: "RESEARCH", ring: 1, angle: 0.785, color: "#2447e8", r: 0.1 },
    { label: "BROWSER", ring: 1, angle: 1.571, color: "#ff4a1c", r: 0.1 },
    { label: "DATA", ring: 1, angle: 2.356, color: "#121317", r: 0.1 },
    { label: "CODING", ring: 1, angle: 3.142, color: "#121317", r: 0.1 },
    { label: "MEMORY", ring: 1, angle: 3.927, color: "#121317", r: 0.1 },
    { label: "OUTREACH", ring: 1, angle: 4.712, color: "#121317", r: 0.1 },
    { label: "VERIFIER", ring: 1, angle: 5.498, color: "#c8f432", r: 0.1 },

    { label: "SEARCH", ring: 2, angle: 0.39, color: "#9b9ea3", r: 0.055 },
    { label: "CHROME", ring: 2, angle: 1.178, color: "#9b9ea3", r: 0.055 },
    { label: "GITHUB", ring: 2, angle: 1.963, color: "#9b9ea3", r: 0.055 },
    { label: "GMAIL", ring: 2, angle: 2.749, color: "#9b9ea3", r: 0.055 },
    { label: "SLACK", ring: 2, angle: 3.534, color: "#9b9ea3", r: 0.055 },
    { label: "POSTGRES", ring: 2, angle: 4.32, color: "#9b9ea3", r: 0.055 },
    { label: "CALENDAR", ring: 2, angle: 5.105, color: "#9b9ea3", r: 0.055 },
    { label: "FILES", ring: 2, angle: 5.89, color: "#9b9ea3", r: 0.055 },
];

const worldPos = (s: Spec) =>
    new THREE.Vector3(
        Math.cos(s.angle) * R[s.ring],
        Math.sin(s.angle) * R[s.ring],
        s.ring === 0 ? 0.5 : s.ring === 1 ? 0 : -0.6
    );

/* ---------------------------------------------------------------- *
 *  Connections — catmull-rom curves carrying energy packets.
 * ---------------------------------------------------------------- */
function Connections({ progressRef }: { progressRef: React.RefObject<number> }) {
    const linesRef = useRef<THREE.LineSegments>(null);
    const packetsRef = useRef<THREE.Points>(null);
    const tmp = useMemo(() => new THREE.Vector3(), []);

    const { lineGeom, packetGeom } = useMemo(() => {
        const curves: THREE.CatmullRomCurve3[] = [];

        const agentIdx = NODES.map((n, i) => (n.ring === 1 ? i : -1)).filter((i) => i >= 0);
        const toolIdx = NODES.map((n, i) => (n.ring === 2 ? i : -1)).filter((i) => i >= 0);

        // Orchestrator → every agent
        for (const ai of agentIdx) {
            const a = worldPos(NODES[0]);
            const b = worldPos(NODES[ai]);
            const mid = a.clone().lerp(b, 0.5).multiplyScalar(0.62).setZ(0.9);
            curves.push(new THREE.CatmullRomCurve3([a, mid, b]));
        }
        // Agents → a subset of tools (a real graph, not a full mesh)
        agentIdx.forEach((ai, k) => {
            for (let j = 0; j < toolIdx.length; j++) {
                if ((ai + j + k) % 3 !== 0) continue;
                const a = worldPos(NODES[ai]);
                const b = worldPos(NODES[toolIdx[j]]);
                const mid = a.clone().lerp(b, 0.5).multiplyScalar(1.05).setZ(-0.25);
                curves.push(new THREE.CatmullRomCurve3([a, mid, b]));
            }
        });

        const seg: number[] = [];
        for (const c of curves) {
            const pts = c.getPoints(26);
            for (let i = 0; i < pts.length - 1; i++) {
                seg.push(pts[i].x, pts[i].y, pts[i].z, pts[i + 1].x, pts[i + 1].y, pts[i + 1].z);
            }
        }

        const PACKETS = 80;
        const seeds = new Float32Array(PACKETS * 2);
        // Deterministic speed spread — keeps packet motion reproducible and
        // keeps this memo pure (no Math.random during render).
        for (let i = 0; i < PACKETS; i++) {
            seeds[i * 2] = i / PACKETS; // curve index
            seeds[i * 2 + 1] = 0.18 + ((i * 37) % 100) / 100 * 0.4; // speed
        }

        return {
            lineGeom: new Float32Array(seg),
            curveList: curves,
            packetGeom: { seeds, curves },
        };
    }, []);

    useFrame((state) => {
        const p = clamp(progressRef.current ?? 0);
        const t = state.clock.elapsedTime;

        if (linesRef.current) {
            (linesRef.current.material as THREE.LineBasicMaterial).opacity = clamp(p * 2.4) * 0.26;
            linesRef.current.rotation.z = t * 0.025;
        }

        const pts = packetsRef.current;
        if (!pts) return;
        const attr = pts.geometry.getAttribute("position") as THREE.BufferAttribute;
        const arr = attr.array as Float32Array;
        const { seeds, curves } = packetGeom;

        for (let i = 0; i < seeds.length / 2; i++) {
            const c = curves[Math.floor(seeds[i * 2] * curves.length)];
            if (!c) continue;
            const u = (t * seeds[i * 2 + 1] + seeds[i * 2] * 7.3) % 1;
            c.getPointAt(u, tmp);
            arr[i * 3] = tmp.x;
            arr[i * 3 + 1] = tmp.y;
            arr[i * 3 + 2] = tmp.z;
        }
        attr.needsUpdate = true;
        (pts.material as THREE.PointsMaterial).opacity = clamp(p * 2.4 - 0.4) * 0.95;
        pts.rotation.z = t * 0.025;
    });

    return (
        <group>
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[lineGeom, 3]} />
                </bufferGeometry>
                <lineBasicMaterial color="#121317" transparent opacity={0} />
            </lineSegments>
            <points ref={packetsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[new Float32Array(80 * 3), 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.06}
                    sizeAttenuation
                    color="#ff4a1c"
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </points>
        </group>
    );
}

/* ---------------------------------------------------------------- *
 *  Node group — rings rotate at different rates, labels fade in by depth.
 * ---------------------------------------------------------------- */
function Network({
    progressRef,
    onHover,
}: {
    progressRef: React.RefObject<number>;
    onHover: (i: number | null) => void;
}) {
    const g1 = useRef<THREE.Group>(null);
    const g2 = useRef<THREE.Group>(null);
    const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

    useFrame((state, delta) => {
        const p = clamp(progressRef.current ?? 0);
        const t = state.clock.elapsedTime;
        if (g1.current) g1.current.rotation.z = t * 0.055;
        if (g2.current) g2.current.rotation.z = -t * 0.04;
        // Ring 2 (tools) only materialises once the network has been established.
        const toolMat = mats.current[2];
        if (toolMat) toolMat.opacity = clamp(p * 2.6 - 0.9);
        void delta;
    });

    const rings = [0, 1, 2] as const;

    return (
        <group>
            {rings.map((ring) => {
                const specs = NODES.map((s, i) => ({ s, i })).filter(({ s }) => s.ring === ring);
                const rotRef = ring === 1 ? g1 : ring === 2 ? g2 : undefined;
                const baseOpacity = ring === 0 ? 1 : ring === 1 ? 0.9 : 0.75;

                return (
                    <group key={ring} ref={rotRef}>
                        {specs.map(({ s, i }) => {
                            const p = worldPos(s);
                            return (
                                <group key={`${s.label}-${i}`} position={[p.x, p.y, p.z]}>
                                    <mesh
                                        onPointerOver={(e) => {
                                            e.stopPropagation();
                                            onHover(i);
                                        }}
                                        onPointerOut={() => onHover(null)}
                                    >
                                        <sphereGeometry args={[s.r, 20, 20]} />
                                        <meshBasicMaterial
                                            ref={(m) => {
                                                if (ring === 2) mats.current[2] = m;
                                            }}
                                            color={s.color}
                                            transparent
                                            opacity={baseOpacity}
                                        />
                                    </mesh>
                                    {/* Hit target — the visible sphere is too small to hover. */}
                                    <mesh
                                        visible={false}
                                        onPointerOver={(e) => {
                                            e.stopPropagation();
                                            onHover(i);
                                        }}
                                        onPointerOut={() => onHover(null)}
                                    >
                                        <sphereGeometry args={[0.34, 8, 8]} />
                                        <meshBasicMaterial />
                                    </mesh>
                                </group>
                            );
                        })}
                    </group>
                );
            })}
        </group>
    );
}

/* ---------------------------------------------------------------- *
 *  Labels
 *
 *  drei's <Html> was replaced by this split. <Html> mounts a nested React
 *  root per label; on route change r3f tore down the canvas while those 17
 *  roots were still mounted, so React's unmount commit threw removeChild
 *  against a detached parent, no error boundary caught it, and the section
 *  blanked.
 *
 *  The replacement cannot live inside <Canvas> either — R3F's reconciler
 *  claims every JSX child, portal or not, and throws "Span is not part of
 *  the THREE namespace". So the work is split in two: <Projector> runs
 *  inside the Canvas and does nothing but write screen coordinates into a
 *  plain array, and <Labels> renders the actual DOM outside the Canvas and
 *  reads that array on its own frame loop. No nested root, and the label
 *  markup is never handed to R3F.
 * ---------------------------------------------------------------- */
type LabelSlot = { x: number; y: number; opacity: number; visible: boolean };
type LabelState = LabelSlot[];
type LabelRef = React.RefObject<LabelState | null>;

const makeLabelState = (): LabelState =>
    NODES.map(() => ({ x: 0, y: 0, opacity: 0, visible: false }));

function Projector({
    progressRef,
    outRef,
}: {
    progressRef: React.RefObject<number>;
    outRef: LabelRef;
}) {
    const v = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ camera, size }) => {
        const out = outRef.current;
        if (!out) return;
        const p = clamp(progressRef.current ?? 0);
        // Same reveal curve the material uses, so labels appear with the nodes.
        const fade = clamp(p * 2.6 - 0.9);

        for (let i = 0; i < NODES.length; i++) {
            const slot = out[i];
            v.copy(worldPos(NODES[i])).project(camera);

            // Behind the camera: project() flips x/y, which would smear labels
            // across the viewport, so they are parked instead.
            if (v.z > 1) {
                slot.visible = false;
                continue;
            }
            slot.visible = true;
            slot.x = (v.x * 0.5 + 0.5) * size.width;
            slot.y = (-v.y * 0.5 + 0.5) * size.height;
            slot.opacity = fade * 0.55;
        }
    });

    return null;
}

function Labels({ stateRef, live }: { stateRef: LabelRef; live: boolean }) {
    const refs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        const state = stateRef.current;
        if (!state) return;

        /* The Projector writes this array from inside the Canvas' frame loop,
           so something has to read it back out on the same cadence — but only
           while the canvas is actually rendering. Driving this from its own rAF
           unconditionally meant a second full-rate loop writing DOM for a graph
           that had already been scrolled past. */
        if (!live) return;

        let raf = 0;
        // Cached so an unchanged label does not re-issue a style write; the
        // projector runs every frame and most nodes do not move between frames.
        const last = NODES.map(() => ({ x: NaN, y: NaN, opacity: NaN, visible: false }));

        const tick = () => {
            for (let i = 0; i < NODES.length; i++) {
                const el = refs.current[i];
                if (!el) continue;
                const s = state[i];
                const c = last[i];
                if (
                    c.visible === s.visible &&
                    c.x === s.x &&
                    c.y === s.y &&
                    c.opacity === s.opacity
                )
                    continue;
                c.visible = s.visible;
                c.x = s.x;
                c.y = s.y;
                c.opacity = s.opacity;

                if (!s.visible) {
                    el.style.opacity = "0";
                    continue;
                }
                el.style.transform = `translate3d(${s.x.toFixed(1)}px, ${s.y.toFixed(
                    1
                )}px, 0) translate(-50%, -50%)`;
                el.style.opacity = String(s.opacity);
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [stateRef, live]);

    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
        >
            {NODES.map((s, i) => (
                <span
                    key={s.label}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                    className="u-mono absolute left-0 top-0 whitespace-nowrap text-[9px] tracking-[0.18em] text-ink/55 opacity-0"
                    style={{ willChange: "transform, opacity" }}
                >
                    {s.label}
                </span>
            ))}
        </div>
    );
}

/* ---------------------------------------------------------------- *
 *  Camera rig
 * ---------------------------------------------------------------- */
function Rig({ progressRef }: { progressRef: React.RefObject<number> }) {
    const { camera } = useThree();
    useFrame((state) => {
        const p = clamp(progressRef.current ?? 0);
        const a = p * 1.05 + pointer.x * 0.14 + state.clock.elapsedTime * 0.028;
        const r = 8.4 - p * 2.2;
        camera.position.set(Math.sin(a) * r, 0.5 - p * 0.35, Math.cos(a) * r);
        camera.lookAt(0, 0, 0);
    });
    return null;
}

function Scene({
    progressRef,
    onHover,
    labelsRef,
}: {
    progressRef: React.RefObject<number>;
    onHover: (i: number | null) => void;
    labelsRef: LabelRef;
}) {
    return (
        <>
            <Rig progressRef={progressRef} />
            <Network progressRef={progressRef} onHover={onHover} />
            <Connections progressRef={progressRef} />
            <Projector progressRef={progressRef} outRef={labelsRef} />
        </>
    );
}

/* ---------------------------------------------------------------- */

export function OrchestrationScene({
    progressRef,
}: {
    progressRef: React.RefObject<number>;
}) {
    const supported = useWebGLSupported();
    const [hover, setHover] = useState<number | null>(null);
    const active = hover !== null ? NODES[hover] : null;
    const labelsRef = useRef<LabelState | null>(null);
    if (labelsRef.current === null) labelsRef.current = makeLabelState();
    const hostRef = useRef<HTMLDivElement>(null);
    const live = useInView(hostRef);

    return (
        <div ref={hostRef} className="absolute inset-0">
            {supported && (
                <Canvas
                    dpr={[1, 1.6]}
                    // This graph animates on every frame and sits behind a long
                    // pinned stretch of the page. Freezing it once the section
                    // is off screen removes one of the three heaviest canvases
                    // from the scroll that follows.
                    frameloop={live ? "always" : "never"}
                    gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
                    camera={{ position: [0, 0, 8.4], fov: 45 }}
                    onPointerMissed={() => setHover(null)}
                    style={{ background: "transparent" }}
                >
                    <Scene
                        progressRef={progressRef}
                        onHover={setHover}
                        labelsRef={labelsRef}
                    />
                </Canvas>
            )}

            <Labels stateRef={labelsRef} live={live} />

            {/* Hover readout — a small technical plate, bottom-left. */}
            <div className="u-mono pointer-events-none absolute bottom-6 left-0 flex items-center gap-3 text-ash">
                <span
                    className="size-2 rounded-full transition-colors duration-300"
                    style={{ background: active?.color ?? "#121317" }}
                />
                {active ? (
                    <span className="text-ink">
                        {active.label}
                        <span className="ml-2 text-ash">
                            {active.ring === 0 ? "ORCHESTRATOR" : active.ring === 1 ? "AGENT" : "TOOL"}
                        </span>
                    </span>
                ) : (
                    <span>Hover a node</span>
                )}
            </div>
        </div>
    );
}