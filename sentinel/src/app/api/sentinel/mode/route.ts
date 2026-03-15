import { NextResponse } from 'next/server';
import { getMode, setMode, getTasks, addTask, removeTask, pauseTask, type SentinelMode } from '@/lib/mode';

/** GET /api/sentinel/mode — returns current mode and task list. */
export async function GET() {
  return NextResponse.json({
    mode: getMode(),
    tasks: getTasks(),
  });
}

/** POST /api/sentinel/mode — switch mode, add/remove/pause tasks. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mode, task, action, taskId } = body;

    // Task management actions — coerce taskId to number for strict equality match
    if (action === 'remove_task' && taskId != null) {
      removeTask(Number(taskId));
      return NextResponse.json({ ok: true, tasks: getTasks() });
    }
    if (action === 'pause_task' && taskId != null) {
      pauseTask(Number(taskId));
      return NextResponse.json({ ok: true, tasks: getTasks() });
    }

    // Mode switch
    if (mode && ['chat', 'monitor', 'scan'].includes(mode)) {
      setMode(mode as SentinelMode);
    }

    // Add task (auto-switches to monitor)
    if (task) {
      const newTask = addTask({
        description: task.description || task.instruction || 'Custom task',
        condition: task.condition || { type: 'people_count_exceeds', threshold: 1 },
        speakOnTrigger: task.speakOnTrigger ?? true,
        speakTemplate: task.speakTemplate || 'Task triggered: {count}',
        continuous: task.continuous ?? true,
      });
      if (getMode() === 'chat') {
        setMode('monitor');
      }
      return NextResponse.json({ ok: true, mode: getMode(), task: newTask, tasks: getTasks() });
    }

    return NextResponse.json({ ok: true, mode: getMode(), tasks: getTasks() });
  } catch (error) {
    console.error('Mode error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
