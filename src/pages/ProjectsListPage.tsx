import { FormEvent, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCreateProject, useCreateProjectFromTemplate, useProjects } from '../hooks/useProjects';
import type { Project, ProjectDraft } from '../types/project';

type SubTab = 'all' | 'active' | 'archived' | 'templates';
type SortKey = 'updated' | 'name' | 'progress';

function GridIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="8" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
      <rect x="13" y="13" width="8" height="8" rx="1.5" />
    </svg>
  );
}
function FlameIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c1 1 2 3 2 5a5 5 0 0 1-10 0c0-4 3-6 3-9 0-1.5 1-3 2-4z" />
    </svg>
  );
}
function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="5" rx="1.2" />
      <path d="M5 9v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9M10 13h4" />
    </svg>
  );
}
function TemplateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 9v12" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'all', label: 'All projects', icon: GridIcon },
  { key: 'active', label: 'Active', icon: FlameIcon },
  { key: 'archived', label: 'Archived', icon: ArchiveIcon },
  { key: 'templates', label: 'Templates', icon: TemplateIcon },
];

interface ProjectsListPageProps {
  onOpenProject: (id: string) => void;
}

export function ProjectsListPage({ onOpenProject }: ProjectsListPageProps) {
  const { data: projects, isLoading } = useProjects();
  const createProject = useCreateProject();
  const createFromTemplate = useCreateProjectFromTemplate();

  const [subTab, setSubTab] = useState<SubTab>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = projects ?? [];
    if (subTab === 'active') list = list.filter((p) => p.status === 'Active' && !p.isTemplate);
    else if (subTab === 'archived') list = list.filter((p) => p.status === 'Archived');
    else if (subTab === 'templates') list = list.filter((p) => p.isTemplate);
    else list = list.filter((p) => !p.isTemplate);

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
    }
    const sorted = [...list];
    if (sortKey === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === 'progress') sorted.sort((a, b) => b.progressPercent - a.progressPercent);
    else sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sorted;
  }, [projects, subTab, search, sortKey]);

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-current">Projects</span>
      </div>
      <h1 className="page-title">Projects</h1>
      <p className="page-date">Context for work — ties Tasks, Notes, Decisions, Problems, Solutions, and Journal together.</p>

      <div className="sub-tabs">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              className={`sub-tab${subTab === tab.key ? ' active' : ''}`}
              onClick={() => setSubTab(tab.key)}
            >
              <span className="sub-tab-icon"><Icon /></span>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="skills-toolbar">
        <input
          type="text"
          placeholder="Search projects or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="updated">Recently updated</option>
          <option value="name">Name (A–Z)</option>
          <option value="progress">Progress</option>
        </select>
        <button className="skills-add-btn" onClick={() => setModalOpen(true)}>+ Add project</button>
      </div>

      {isLoading && <p className="muted-text">Loading projects…</p>}

      <div className="project-list">
        {filtered.map((project) =>
          subTab === 'templates' ? (
            <TemplateCard
              key={project.id}
              project={project}
              onUse={(name) => createFromTemplate.mutate({ templateId: project.id, name })}
              onOpen={() => onOpenProject(project.id)}
            />
          ) : (
            <ProjectListCard key={project.id} project={project} onOpen={() => onOpenProject(project.id)} />
          ),
        )}
        {!isLoading && filtered.length === 0 && <p className="muted-text">Nothing here yet.</p>}
      </div>

      {modalOpen && (
        <AddProjectModal
          onClose={() => setModalOpen(false)}
          onSubmit={(draft) => {
            createProject.mutate(draft);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function ProjectListCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <div className="project-card skill-card" onClick={onOpen}>
      <div className="task-card-top">
        <span className="project-card-title">{project.name}</span>
        {project.status === 'Archived' && <span className="entry-type-badge">Archived</span>}
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
      {project.tags.length > 0 && (
        <div className="entry-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="entry-tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  project,
  onUse,
  onOpen,
}: {
  project: Project;
  onUse: (name: string) => void;
  onOpen: () => void;
}) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');

  return (
    <div className="project-card skill-card">
      <div className="task-card-top" onClick={onOpen} style={{ cursor: 'pointer' }}>
        <span className="project-card-title">{project.name}</span>
        <span className="entry-type-badge">Template</span>
      </div>
      {project.description && <p className="entry-desc">{project.description}</p>}
      <p className="muted-text" style={{ fontSize: 12 }}>{project.milestones.length} milestone skeleton{project.milestones.length === 1 ? '' : 's'}</p>
      {naming ? (
        <form
          className="inline-add-row"
          style={{ marginTop: 8 }}
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            if (!name.trim()) return;
            onUse(name.trim());
            setNaming(false);
            setName('');
          }}
        >
          <input type="text" placeholder="New project name…" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <button type="submit" disabled={!name.trim()}>Create</button>
        </form>
      ) : (
        <button className="skills-add-btn" style={{ marginTop: 8 }} onClick={() => setNaming(true)}>Use this template</button>
      )}
    </div>
  );
}

function AddProjectModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (draft: ProjectDraft) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isTemplate, setIsTemplate] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      isTemplate,
    });
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add project</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="project-name">Name</label>
            <input id="project-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="project-description">Description (optional)</label>
            <textarea
              id="project-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="project-tags">Tags (comma separated)</label>
            <input id="project-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="field">
            <label className="task-checklist-item" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={isTemplate} onChange={(e) => setIsTemplate(e.target.checked)} />
              <span>Save as a reusable template</span>
            </label>
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="auth-submit">Add project</button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
