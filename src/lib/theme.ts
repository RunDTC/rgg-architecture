import type { ArchNodeDef } from "@/data/types";
import type {
  Domain,
  FlowKind,
  MigrationStatus,
  SystemStatus,
  Tier,
} from "@/config/taxonomy";
import {
  DOMAINS,
  FLOW_KINDS,
  MIGRATION_STATUSES,
  NODE_KIND_VISUALS,
  SYSTEM_STATUSES,
  TIERS,
} from "@/config/taxonomy";

// Everything in this file is DERIVED from src/config/taxonomy.ts. To change a color or
// label, or add a tier/domain/status, edit the arrays there — the maps below follow.

export interface NodeVisual {
  /** Accent used for borders/headers. */
  accent: string;
  /** Card background. */
  bg: string;
  /** Small category label shown on the node. */
  categoryLabel: string;
}

const tierVisuals = Object.fromEntries(
  TIERS.map((tier) => [
    tier.id,
    { accent: tier.accent, bg: tier.bg, categoryLabel: tier.label },
  ]),
) as Record<Tier, NodeVisual>;

export function nodeVisual(node: ArchNodeDef): NodeVisual {
  if (node.kind === "system") return tierVisuals[node.tier];
  const visual = NODE_KIND_VISUALS[node.kind];
  return { accent: visual.accent, bg: visual.bg, categoryLabel: visual.label };
}

export const statusLabels = Object.fromEntries(
  SYSTEM_STATUSES.map((status) => [status.id, status.label]),
) as Record<SystemStatus, string>;

export const statusColors = Object.fromEntries(
  SYSTEM_STATUSES.map((status) => [status.id, status.color]),
) as Record<SystemStatus, string>;

export const migrationStatusLabels = Object.fromEntries(
  MIGRATION_STATUSES.map((status) => [status.id, status.label]),
) as Record<MigrationStatus, string>;

export const migrationStatusColors = Object.fromEntries(
  MIGRATION_STATUSES.map((status) => [status.id, status.color]),
) as Record<MigrationStatus, string>;

export const flowKindLabels = Object.fromEntries(
  FLOW_KINDS.map((kind) => [kind.id, kind.label]),
) as Record<FlowKind, string>;

export const domainLabels = Object.fromEntries(
  DOMAINS.map((domain) => [domain.id, domain.label]),
) as Record<Domain, string>;

export const domainColors = Object.fromEntries(
  DOMAINS.map((domain) => [domain.id, domain.color]),
) as Record<Domain, string>;

/** Chip order in the Data Flows view — follows DOMAINS array order. */
export const domainOrder: Domain[] = DOMAINS.map((domain) => domain.id);
