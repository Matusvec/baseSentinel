import type { Db } from 'mongodb';
import type { MissionConfig } from '@/lib/mission-engine';

export type SentinelMode = 'chat' | 'monitor' | 'scan';
export type ToolCategory = 'hardware' | 'analysis' | 'communication' | 'data' | 'system';

export interface ToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
  enum?: string[];
  default?: unknown;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface ToolContext {
  perception: Record<string, unknown> | null;
  frameB64: string | null;
  mission: MissionConfig | null;
  mode: SentinelMode;
  db: Db;
  trackerStats: {
    unique: number;
    visible: number;
    netFlow: number;
    entering: number;
    exiting: number;
    minutesSinceMovement: number;
  };
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  category: ToolCategory;
  execute: (params: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
}
