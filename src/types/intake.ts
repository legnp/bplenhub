/**
 * BPlen HUB — Intake & Asset Taxonomy
 * Define a classificação institucional de ativos de coleta de dados.
 */

export type EntityKind = "survey" | "form" | "hybrid";

export interface IntakeMetadata {
  kind: EntityKind;
  version: string;
  labels?: string[];
  theme?: string;
}
