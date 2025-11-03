/**
 * Agent orchestrator - state machine for the build process
 */

export type AgentState =
  | 'idle'
  | 'deriving_spec'
  | 'planning'
  | 'implementing'
  | 'verifying'
  | 'previewing'
  | 'refining'
  | 'done'
  | 'error';

export interface AgentContext {
  state: AgentState;
  spec?: any;
  plan?: any;
  currentStep?: number;
  totalSteps?: number;
  error?: string;
  logs: string[];
  todos: TodoItem[];
}

export interface TodoItem {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export class AgentOrchestrator {
  private context: AgentContext;
  private listeners: Array<(context: AgentContext) => void> = [];

  constructor() {
    this.context = {
      state: 'idle',
      logs: [],
      todos: [],
    };
  }

  getContext(): AgentContext {
    return { ...this.context };
  }

  subscribe(listener: (context: AgentContext) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.getContext()));
  }

  private addLog(message: string) {
    this.context.logs.push(`[${new Date().toISOString()}] ${message}`);
    this.notify();
  }

  private updateTodos(todos: TodoItem[]) {
    this.context.todos = todos;
    this.notify();
  }

  setState(state: AgentState) {
    this.context.state = state;
    this.addLog(`State changed to: ${state}`);
  }

  setSpec(spec: any) {
    this.context.spec = spec;
    this.addLog('Specification derived');
  }

  setPlan(plan: any) {
    this.context.plan = plan;

    // Create todos from plan steps
    const todos: TodoItem[] = plan.steps.map((step: string, index: number) => ({
      id: `step-${index}`,
      description: step,
      status: 'pending' as const,
    }));

    this.context.totalSteps = todos.length;
    this.updateTodos(todos);
    this.addLog(`Plan created with ${todos.length} steps`);
  }

  startImplementation() {
    this.context.currentStep = 0;
    this.setState('implementing');
  }

  completeStep(stepIndex: number) {
    const todos = [...this.context.todos];
    if (todos[stepIndex]) {
      todos[stepIndex].status = 'completed';
      this.updateTodos(todos);
      this.addLog(`Completed step ${stepIndex + 1}/${this.context.totalSteps}`);
    }

    this.context.currentStep = stepIndex + 1;

    // Check if all steps are done
    if (this.context.currentStep >= (this.context.totalSteps || 0)) {
      this.setState('done');
    }
  }

  markStepInProgress(stepIndex: number) {
    const todos = [...this.context.todos];
    if (todos[stepIndex]) {
      todos[stepIndex].status = 'in_progress';
      this.updateTodos(todos);
    }
  }

  setError(error: string) {
    this.context.error = error;
    this.setState('error');
    this.addLog(`Error: ${error}`);
  }

  reset() {
    this.context = {
      state: 'idle',
      logs: [],
      todos: [],
    };
    this.notify();
  }

  getLogs(): string[] {
    return [...this.context.logs];
  }

  getTodos(): TodoItem[] {
    return [...this.context.todos];
  }
}

// Global singleton
export const orchestrator = new AgentOrchestrator();
