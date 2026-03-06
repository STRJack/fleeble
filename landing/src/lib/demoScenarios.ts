import { BubbleScenario } from '@/types';

export const demoScenarios: BubbleScenario[] = [
  {
    id: 'approval-1',
    source: 'claude-code',
    type: 'approval',
    message: '`npm install express`',
    project: 'my-api',
    options: ['Allow', 'Deny'],
  },
  {
    id: 'question-1',
    source: 'cursor',
    type: 'question',
    message: 'Which test framework do you want to use?',
    project: 'frontend-app',
    options: ['Jest', 'Vitest', 'Mocha'],
  },
  {
    id: 'error-1',
    source: 'claude-code',
    type: 'error',
    message: 'Build failed: TypeScript error in `src/index.ts` — Property `name` does not exist on type `{}`.',
    project: 'my-api',
  },
  {
    id: 'info-1',
    source: 'codex',
    type: 'info',
    message: 'Refactoring complete. 12 files updated.',
    project: 'backend',
  },
  {
    id: 'action-1',
    source: 'claude-code',
    type: 'action',
    message: 'Creating 3 new files in `src/components/`',
    project: 'frontend-app',
  },
  {
    id: 'question-2',
    source: 'cursor',
    type: 'question',
    message: 'Update test files to match the new component structure?',
    project: 'frontend-app',
    options: ['Yes', 'No'],
  },
];
