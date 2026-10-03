"use client";

import type { ReactNode } from "react";
import { EntityField } from "@/components/features/EntityField";
import { RoutingWeave } from "@/components/features/RoutingWeave";
import { DrawFlow } from "@/components/features/DrawFlow";
import { ToolOrbit } from "@/components/features/ToolOrbit";
import { StrataFan } from "@/components/features/StrataFan";
import { VerificationGate } from "@/components/features/VerificationGate";
import { HumanSignOff } from "@/components/features/HumanSignOff";
import { RepairLoop } from "@/components/features/RepairLoop";
import { ParallelLanes } from "@/components/features/ParallelLanes";
import { Clockwork } from "@/components/features/Clockwork";

/**
 * Resolves the `visual` discriminator from FEATURES to a component. Three of
 * those values are used twice on the page, so a second occurrence (variant 1)
 * resolves to a different mechanism rather than repeating the first.
 */
const REGISTRY: Record<string, [() => ReactNode, () => ReactNode]> = {
  entity: [() => <EntityField />, () => <EntityField />],
  graph: [() => <RoutingWeave />, () => <ParallelLanes />],
  flow: [() => <DrawFlow />, () => <DrawFlow />],
  orbit: [() => <ToolOrbit />, () => <ToolOrbit />],
  stack: [() => <StrataFan />, () => <Clockwork />],
  gate: [() => <VerificationGate />, () => <HumanSignOff />],
  loop: [() => <RepairLoop />, () => <RepairLoop />],
};

export function FeatureVisual({
  visual,
  variant = 0,
}: {
  visual: string;
  variant?: number;
}) {
  const entry = REGISTRY[visual];
  if (!entry) return null;
  const render = entry[variant] ?? entry[0];
  return <>{render()}</>;
}
