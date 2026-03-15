/**
 * SENTINEL mode state management.
 * Modes control when SENTINEL speaks and what it does autonomously.
 */

export type SentinelMode = 'chat' | 'monitor' | 'scan';

export interface Task {
  id: number;
  description: string;
  condition: {
    type: 'people_count_exceeds' | 'person_entered' | 'lingering_detected' |
          'object_detected' | 'distance_below' | 'perimeter_breach' | 'activity_level';
    threshold?: number;
    searchTerm?: string;
    durationSeconds?: number;
  };
  speakOnTrigger: boolean;
  speakTemplate: string;
  continuous: boolean;
  status: 'active' | 'paused' | 'completed';
  count: number;
  createdAt: Date;
}

// In-memory state (lives on the server process)
let currentMode: SentinelMode = 'chat';
let activeTasks: Task[] = [];
let taskIdCounter = 0;

/** Returns the current operational mode. */
export function getMode(): SentinelMode {
  return currentMode;
}

/** Sets the current operational mode. */
export function setMode(mode: SentinelMode): void {
  currentMode = mode;
}

/** Returns a copy of all active tasks. */
export function getTasks(): Task[] {
  return activeTasks;
}

/**
 * Adds a new task and returns it with server-assigned fields.
 */
export function addTask(task: Omit<Task, 'id' | 'count' | 'createdAt' | 'status'>): Task {
  const newTask: Task = {
    ...task,
    id: ++taskIdCounter,
    count: 0,
    status: 'active',
    createdAt: new Date(),
  };
  activeTasks.push(newTask);
  return newTask;
}

/**
 * Removes a task by id. Returns true if found and removed.
 */
export function removeTask(id: number): boolean {
  const idx = activeTasks.findIndex(t => t.id === id);
  if (idx === -1) return false;
  activeTasks.splice(idx, 1);
  return true;
}

/** Updates the trigger count for a task. */
export function updateTaskCount(id: number, count: number): void {
  const task = activeTasks.find(t => t.id === id);
  if (task) task.count = count;
}

/** Toggles a task between active and paused. */
export function pauseTask(id: number): void {
  const task = activeTasks.find(t => t.id === id);
  if (task) task.status = task.status === 'paused' ? 'active' : 'paused';
}

/**
 * Check active tasks against incoming perception data.
 * Returns tasks whose conditions are met this cycle.
 */
export function checkTasks(perception: Record<string, unknown>): Array<{ task: Task; message: string }> {
  const triggered: Array<{ task: Task; message: string }> = [];
  const localCv = perception.local_cv as Record<string, unknown> | undefined;
  const sensors = perception.sensors as Record<string, unknown> | undefined;
  const distances = sensors?.d as Record<string, number> | undefined;
  const ir = sensors?.ir as number[] | undefined;
  const personCount = (localCv?.person_count as number) ?? 0;

  for (const task of activeTasks) {
    if (task.status !== 'active') continue;

    let met = false;
    switch (task.condition.type) {
      case 'people_count_exceeds':
        met = personCount > (task.condition.threshold ?? 0);
        break;
      case 'person_entered':
        met = personCount > task.count;
        break;
      case 'distance_below':
        met = (distances?.f ?? 999) < (task.condition.threshold ?? 100);
        break;
      case 'perimeter_breach':
        met = ir?.[0] === 1 || ir?.[1] === 1;
        break;
      case 'activity_level': {
        const persons = localCv?.persons as Array<Record<string, unknown>> | undefined;
        met = persons?.some(p => p.activity === 'fast') ?? false;
        break;
      }
    }

    if (met) {
      if (task.condition.type === 'person_entered') {
        task.count = personCount;
      } else {
        task.count++;
      }
      const message = task.speakTemplate
        .replace('{count}', String(task.count))
        .replace('{people}', String(personCount));
      triggered.push({ task, message });

      if (!task.continuous) {
        task.status = 'completed';
      }
    }
  }

  return triggered;
}
