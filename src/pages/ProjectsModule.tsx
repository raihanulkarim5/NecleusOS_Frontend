import { useState } from 'react';
import { ProjectsListPage } from './ProjectsListPage';
import { ProjectDetailPage } from './ProjectDetailPage';

export function ProjectsModule() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  if (selectedProjectId) {
    return <ProjectDetailPage projectId={selectedProjectId} onBack={() => setSelectedProjectId(null)} />;
  }
  return <ProjectsListPage onOpenProject={setSelectedProjectId} />;
}
