import { FormEvent, useState } from 'react';
import {
  useCreateProject,
  useProjects,
  useToggleMilestone,
  useToggleProjectFavorite,
  useUpdateProjectStatus,
} from '../hooks/useProjects';
import type { Project } from '../types/project';

export function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateStatus = useUpdateProjectStatus();
  const toggleFavorite = useToggleProjectFavorite();
  const toggleMilestone = useToggleMilestone();

  const [newName, setNewName] = useState('');

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createProject.mutate({ name: newName.trim(), description: '', tags: [] });
    setNewName('');
  }

  return (
    <div>
      <h1 className="page-title">Projects</h1>
      <p className="page-date">Context for work — ties Tasks, Journal, and Entries together via shared links.</p>

      <form className="entry-quickadd" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New project…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" disabled={createProject.isPending || !newName.trim()}>
          {createProject.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>

      {isLoading && <p className="muted-text">Loading projects…</p>}

      <div className="project-list">
        {projects?.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onArchiveToggle={() =>
              updateStatus.mutate({ id: project.id, status: project.status === 'Active' ? 'Archived' : 'Active' })
            }
            onToggleFavorite={() => toggleFavorite.mutate(project.id)}
            onToggleMilestone={(milestoneId) => toggleMilestone.mutate({ projectId: project.id, milestoneId })}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onArchiveToggle,
  onToggleFavorite,
  onToggleMilestone,
}: {
  project: Project;
  onArchiveToggle: () => void;
  onToggleFavorite: () => void;
  onToggleMilestone: (milestoneId: string) => void;
}) {
  const nextMilestone = project.milestones.find((m) => !m.done);

  return (
    <div className="project-card">
      <div className="task-card-top">
        <div className="task-title-row">
          <span className="project-card-title">{project.name}</span>
          {project.status === 'Archived' && <span className="entry-type-badge">Archived</span>}
        </div>
        <button
          className={`entry-fav${project.favorite ? ' active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={project.favorite ? 'Unfavorite' : 'Favorite'}
        >
          ★
        </button>
      </div>

      {project.description && <p className="entry-desc">{project.description}</p>}

      <div className="project-progress">
        <div className="budget-row-top">
          <span className="budget-cat">Progress</span>
          <span className="budget-amounts">{project.progressPercent}%</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${project.progressPercent}%` }} />
        </div>
      </div>

      {project.milestones.length > 0 && (
        <div className="task-checklist">
          {project.milestones.map((m) => (
            <label key={m.id} className="task-checklist-item">
              <input type="checkbox" checked={m.done} onChange={() => onToggleMilestone(m.id)} />
              <span className={m.done ? 'task-done' : ''}>{m.title}</span>
            </label>
          ))}
        </div>
      )}

      {nextMilestone && <p className="project-next-milestone">Next: {nextMilestone.title}</p>}

      {project.links.length > 0 && (
        <div className="project-links">
          {project.links.map((link) => (
            <span key={`${link.type}-${link.id}`} className="project-link-badge">
              {link.type}: {link.title}
            </span>
          ))}
        </div>
      )}

      <div className="entry-card-bottom">
        <button className="entry-status-badge status-open" onClick={onArchiveToggle}>
          {project.status === 'Active' ? 'Archive' : 'Reactivate'}
        </button>
        {project.tags.map((tag) => (
          <span key={tag} className="entry-tag">#{tag}</span>
        ))}
      </div>
    </div>
  );
}
