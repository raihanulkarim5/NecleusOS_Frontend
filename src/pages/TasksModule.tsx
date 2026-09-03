import { useState } from 'react';
import { TasksListPage } from './TasksListPage';
import { TaskDetailPage } from './TaskDetailPage';

export function TasksModule() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  if (selectedTaskId) {
    return <TaskDetailPage taskId={selectedTaskId} onBack={() => setSelectedTaskId(null)} />;
  }
  return <TasksListPage onOpenTask={setSelectedTaskId} />;
}
