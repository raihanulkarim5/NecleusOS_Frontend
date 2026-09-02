import { ChangeEvent, FormEvent, useState } from 'react';
import {
  useAddMilestoneTask,
  useAddProjectFile,
  useAddProjectLinkedItem,
  useAddProjectMilestone,
  useAddProjectResource,
  useMoveProjectMilestone,
  useProject,
  useRemoveMilestoneTask,
  useRemoveProjectFile,
  useRemoveProjectLinkedItem,
  useRemoveProjectMilestone,
  useRemoveProjectResource,
  useToggleMilestone,
  useToggleProjectFavorite,
  useToggleProjectTemplate,
  useUpdateProjectBasicInfo,
  useUpdateProjectNotes,
} from '../hooks/useProjects';
import { useCreateTask, useTasks, useUpdateTaskStatus } from '../hooks/useTasks';
import { useCreateEntry, useEntries } from '../hooks/useEntries';
import { useCreateJournalEntry, useJournalEntries } from '../hooks/useJournal';
import { RichNotesEditor } from '../components/RichNotesEditor';
import { MoveButtons } from '../components/MoveButtons';
import type { LinkRef } from '../types/link';
import type { Project, ProjectLinkCategory, ProjectStatus } from '../types/project';
import type { EntryType } from '../types/entry';

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
}

type SectionKey = 'overview' | 'tasks' | 'notes' | 'decisions' | 'problems' | 'journal' | 'resources' | 'files' | 'progress';

function iconPath(d: string) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d={d} />
    </svg>
  );
}

const SECTIONS: { key: SectionKey; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: () => iconPath('M12 3a9 9 0 100 18 9 9 0 000-18zM12 11v5M12 8v.01') },
  { key: 'tasks', label: 'Tasks', icon: () => iconPath('M9 12l2 2 4-4M3 3h18v18H3z') },
  { key: 'notes', label: 'Notes', icon: () => iconPath('M4 3h16v18H4zM8 8h8M8 12h8M8 16h5') },
  { key: 'decisions', label: 'Decisions', icon: () => iconPath('M12 3v6M8 21h8M9 9l3 3 3-3M6 9a6 6 0 0012 0') },
  { key: 'problems', label: 'Problem & Solution', icon: () => iconPath('M12 9v4M12 17v.01M10.3 4.5 2.9 17a2 2 0 001.7 3h14.8a2 2 0 001.7-3L13.7 4.5a2 2 0 00-3.4 0z') },
  { key: 'journal', label: 'Journal', icon: () => iconPath('M5 4h11a2 2 0 012 2v14l-4-3-4 3-4-3-4 3V6a2 2 0 013-2z') },
  { key: 'resources', label: 'Resources', icon: () => iconPath('M10 13a4 4 0 006 0l3-3a4 4 0 00-6-6l-1 1M14 11a4 4 0 00-6 0l-3 3a4 4 0 006 6l1-1') },
  { key: 'files', label: 'Files', icon: () => iconPath('M6 3h9l5 5v13a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5') },
  { key: 'progress', label: 'Progress / Timeline', icon: () => iconPath('M4 20V10M12 20V4M20 20v-6') },
];

export function ProjectDetailPage({ projectId, onBack }: ProjectDetailPageProps) {
  const { data: project, isLoading } = useProject(projectId);
  const updateBasicInfo = useUpdateProjectBasicInfo();
  const toggleTemplate = useToggleProjectTemplate();
  const toggleFavorite = useToggleProjectFavorite();
  const toggleMilestone = useToggleMilestone();
  const addMilestone = useAddProjectMilestone();
  const removeMilestone = useRemoveProjectMilestone();
  const moveMilestone = useMoveProjectMilestone();
  const addMilestoneTask = useAddMilestoneTask();
  const removeMilestoneTask = useRemoveMilestoneTask();
  const addLinkedItem = useAddProjectLinkedItem();
  const removeLinkedItem = useRemoveProjectLinkedItem();
  const addResource = useAddProjectResource();
  const removeResource = useRemoveProjectResource();
  const addFile = useAddProjectFile();
  const removeFile = useRemoveProjectFile();
  const updateNotes = useUpdateProjectNotes();
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const { data: tasks } = useTasks();
  const createEntry = useCreateEntry();
  const { data: entries } = useEntries();
  const createJournalEntry = useCreateJournalEntry();
  const { data: journalEntries } = useJournalEntries();

  const [section, setSection] = useState<SectionKey>('overview');
  const [editingInfo, setEditingInfo] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [statusDraft, setStatusDraft] = useState<ProjectStatus>('Active');
  const [tagsDraft, setTagsDraft] = useState('');

  if (isLoading || !project) {
    return <p className="muted-text">Loading project…</p>;
  }

  const linkedTaskIds = new Set(project.tasks.map((t) => t.id));
  const linkedTaskObjects = (tasks ?? []).filter((t) => linkedTaskIds.has(t.id));
  const unlinkedTasks = (tasks ?? []).filter((t) => !linkedTaskIds.has(t.id));
  const linkedJournalIds = new Set(project.journalEntries.map((j) => j.id));
  const unlinkedJournalEntries = (journalEntries ?? []).filter((j) => !linkedJournalIds.has(j.id));

  function startEditingInfo() {
    setNameDraft(project!.name);
    setDescriptionDraft(project!.description);
    setStatusDraft(project!.status);
    setTagsDraft(project!.tags.join(', '));
    setEditingInfo(true);
  }

  function saveInfo() {
    if (!nameDraft.trim()) return;
    updateBasicInfo.mutate({
      id: project!.id,
      name: nameDraft.trim(),
      description: descriptionDraft.trim(),
      status: statusDraft,
      tags: tagsDraft.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setEditingInfo(false);
  }

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={onBack}>Projects</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{project.name}</span>
      </div>

      <div className="skill-detail-header">
        <div style={{ flex: 1 }}>
          {editingInfo ? (
            <div className="skill-info-edit">
              <input type="text" className="skill-info-name-input" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
              <div className="skill-info-edit-row">
                <input type="text" placeholder="Tags (comma separated)" value={tagsDraft} onChange={(e) => setTagsDraft(e.target.value)} />
                <select value={statusDraft} onChange={(e) => setStatusDraft(e.target.value as ProjectStatus)}>
                  <option value="Active">Active</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <textarea rows={2} placeholder="Description…" value={descriptionDraft} onChange={(e) => setDescriptionDraft(e.target.value)} />
              <div className="modal-actions" style={{ marginTop: 6 }}>
                <button type="button" className="modal-cancel" onClick={() => setEditingInfo(false)}>Cancel</button>
                <button type="button" className="auth-submit" onClick={saveInfo}>Save</button>
              </div>
            </div>
          ) : (
            <div onClick={startEditingInfo} className="skill-info-display">
              <h1 className="page-title">{project.name}</h1>
              <p className="page-date">{project.status}{project.isTemplate ? ' · Template' : ''} <span className="skill-edit-hint">(click to edit)</span></p>
              <p className="skill-brief">{project.description || 'No description yet — click to add one.'}</p>
            </div>
          )}
          <div className="skill-progress-inline">
            <div className="bar-track"><div className="bar-fill" style={{ width: `${project.progressPercent}%` }} /></div>
            <span className="skill-progress-label">{project.progressPercent}%</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
          <button className="skill-delete-btn" onClick={() => toggleTemplate.mutate(project.id)}>
            {project.isTemplate ? 'Unmark template' : 'Mark as template'}
          </button>
          <button className={`entry-fav${project.favorite ? ' active' : ''}`} onClick={() => toggleFavorite.mutate(project.id)} aria-label="Favorite">★</button>
        </div>
      </div>

      <div className="sub-tabs">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.key} className={`sub-tab${section === s.key ? ' active' : ''}`} onClick={() => setSection(s.key)}>
              <span className="sub-tab-icon"><Icon /></span>
              {s.label}
            </button>
          );
        })}
      </div>

      {section === 'overview' && <OverviewSection project={project} />}

      {section === 'tasks' && (
        <div className="stat-card">
          <TaskLinkSection
            existingTasks={unlinkedTasks}
            onLinkExisting={(taskId, taskTitle) => addLinkedItem.mutate({ projectId: project.id, category: 'tasks', ref: { type: 'task', id: taskId, title: taskTitle } })}
            onCreateNew={async (title) => {
              const task = await createTask.mutateAsync({ title, description: '', priority: 'Medium', dueDate: null, tags: [], effortEstimateHours: null, recurring: 'None' });
              addLinkedItem.mutate({ projectId: project.id, category: 'tasks', ref: { type: 'task', id: task.id, title: task.title } });
            }}
          />
          {project.tasks.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No tasks yet.</p>}
          {project.tasks.map((t) => {
            const task = linkedTaskObjects.find((task) => task.id === t.id);
            const done = task?.status === 'Done';
            return (
              <div className="skill-resource-row" key={t.id}>
                <label className="task-checklist-item" style={{ flex: 1 }}>
                  <input type="checkbox" checked={done} onChange={() => task && updateTaskStatus.mutate({ id: task.id, status: done ? 'Open' : 'Done' })} />
                  <span className={done ? 'task-done' : ''}>{t.title}</span>
                </label>
                {task && <span className="entry-type-badge">{task.status}</span>}
                <button className="skill-delete-btn" onClick={() => removeLinkedItem.mutate({ projectId: project.id, category: 'tasks', refId: t.id })}>Remove</button>
              </div>
            );
          })}
        </div>
      )}

      {section === 'notes' && <RichNotesEditor value={project.notes} onSave={(html) => updateNotes.mutate({ projectId: project.id, notes: html })} />}

      {section === 'decisions' && (
        <EntryLinkSection
          entryType="Decision"
          linkedRefs={project.decisions}
          allEntries={entries ?? []}
          onLinkExisting={(ref) => addLinkedItem.mutate({ projectId: project.id, category: 'decisions', ref })}
          onCreateNew={async (title, description) => {
            const entry = await createEntry.mutateAsync({ title, description, type: 'Decision', priority: 'Medium', tags: [], dueDate: null });
            addLinkedItem.mutate({ projectId: project.id, category: 'decisions', ref: { type: 'entry', id: entry.id, title: entry.title } });
          }}
          onRemove={(refId) => removeLinkedItem.mutate({ projectId: project.id, category: 'decisions', refId })}
        />
      )}

      {section === 'problems' && (
        <ProblemSolutionSection
          linkedRefs={project.problems}
          allEntries={(entries ?? []).filter((e) => e.type === 'Problem')}
          onLinkExisting={(ref) => addLinkedItem.mutate({ projectId: project.id, category: 'problems', ref })}
          onCreateNew={async (problem, solutionHtml) => {
            const entry = await createEntry.mutateAsync({ title: problem, description: solutionHtml, type: 'Problem', priority: 'Medium', tags: [], dueDate: null });
            addLinkedItem.mutate({ projectId: project.id, category: 'problems', ref: { type: 'entry', id: entry.id, title: entry.title } });
          }}
          onRemove={(refId) => removeLinkedItem.mutate({ projectId: project.id, category: 'problems', refId })}
        />
      )}

      {section === 'journal' && (
        <div className="stat-card">
          <JournalLinkSection
            existingEntries={unlinkedJournalEntries}
            onLinkExisting={(id, title) => addLinkedItem.mutate({ projectId: project.id, category: 'journal', ref: { type: 'journal', id, title } })}
            onCreateNew={async (contentHtml) => {
              const entry = await createJournalEntry.mutateAsync({ date: new Date().toISOString().slice(0, 10), logType: 'Meeting', content: contentHtml, wins: [], mistakes: [], learnings: [], gratitude: [], mood: 3, tags: [] });
              addLinkedItem.mutate({ projectId: project.id, category: 'journal', ref: { type: 'journal', id: entry.id, title: `${entry.logType} log` } });
            }}
          />
          {project.journalEntries.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No journal entries yet.</p>}
          {project.journalEntries.map((j) => (
            <div className="skill-resource-row" key={j.id}>
              <span style={{ flex: 1 }}>{j.title}</span>
              <button className="skill-delete-btn" onClick={() => removeLinkedItem.mutate({ projectId: project.id, category: 'journal', refId: j.id })}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {section === 'resources' && (
        <div className="stat-card">
          <AddResourceRow onAdd={(title, url) => addResource.mutate({ projectId: project.id, title, url })} />
          {project.resources.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No resources added.</p>}
          {project.resources.map((r) => (
            <div className="skill-resource-row" key={r.id}>
              <a href={r.url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>{r.title}</a>
              <button className="skill-delete-btn" onClick={() => removeResource.mutate({ projectId: project.id, resourceId: r.id })}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {section === 'files' && (
        <div className="stat-card">
          <AddFileRow onAdd={(title, url) => addFile.mutate({ projectId: project.id, title, url })} />
          {project.files.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No files uploaded.</p>}
          {project.files.map((f) => (
            <div className="skill-resource-row" key={f.id}>
              <a href={f.url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>{f.title}</a>
              <span className="skill-upload-tag">{f.uploadedAt}</span>
              <button className="skill-delete-btn" onClick={() => removeFile.mutate({ projectId: project.id, fileId: f.id })}>Remove</button>
            </div>
          ))}
        </div>
      )}

      {section === 'progress' && (
        <div>
          <div className="stat-card">
            <div className="budget-row-top"><span className="budget-cat">Overall progress</span><span className="budget-amounts">{project.progressPercent}%</span></div>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${project.progressPercent}%` }} /></div>
            <p className="skill-progress-note">Created {project.createdAt} · Last updated {project.updatedAt}</p>
          </div>
          <div className="stat-card" style={{ marginTop: 14 }}>
            <InlineAddRow placeholder="Add a milestone…" onAdd={(title) => addMilestone.mutate({ projectId: project.id, title })} />
            {project.milestones.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No milestones yet.</p>}
            {project.milestones.map((m, index) => (
              <MilestoneWithTasks
                key={m.id}
                milestone={m}
                canMoveUp={index > 0}
                canMoveDown={index < project.milestones.length - 1}
                existingTasks={unlinkedTasks}
                allTasks={tasks ?? []}
                onMoveUp={() => moveMilestone.mutate({ projectId: project.id, milestoneId: m.id, direction: 'up' })}
                onMoveDown={() => moveMilestone.mutate({ projectId: project.id, milestoneId: m.id, direction: 'down' })}
                onToggle={() => toggleMilestone.mutate({ projectId: project.id, milestoneId: m.id })}
                onRemove={() => removeMilestone.mutate({ projectId: project.id, milestoneId: m.id })}
                onLinkExistingTask={(taskId, taskTitle) => addMilestoneTask.mutate({ projectId: project.id, milestoneId: m.id, taskId, taskTitle })}
                onCreateNewTask={async (title) => {
                  const task = await createTask.mutateAsync({ title, description: '', priority: 'Medium', dueDate: null, tags: [], effortEstimateHours: null, recurring: 'None' });
                  addMilestoneTask.mutate({ projectId: project.id, milestoneId: m.id, taskId: task.id, taskTitle: task.title });
                }}
                onRemoveTask={(taskId) => removeMilestoneTask.mutate({ projectId: project.id, milestoneId: m.id, taskId })}
                onToggleTaskStatus={(taskId, done) => updateTaskStatus.mutate({ id: taskId, status: done ? 'Open' : 'Done' })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewSection({ project }: { project: Project }) {
  const doneMilestones = project.milestones.filter((m) => m.done).length;
  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card"><div className="stat-label">Progress</div><div className="stat-big glow-cyan">{project.progressPercent}%</div></div>
        <div className="stat-card"><div className="stat-label">Status</div><div className="stat-big glow-violet" style={{ fontSize: 18 }}>{project.status}</div></div>
        <div className="stat-card"><div className="stat-label">Milestones</div><div className="stat-big glow-magenta">{doneMilestones}/{project.milestones.length}</div></div>
        <div className="stat-card"><div className="stat-label">Tasks</div><div className="stat-big glow-cyan">{project.tasks.length}</div></div>
      </div>
      {project.tags.length > 0 && (
        <div className="entry-tags" style={{ marginTop: 16 }}>
          {project.tags.map((tag) => <span key={tag} className="entry-tag">#{tag}</span>)}
        </div>
      )}
    </div>
  );
}

function InlineAddRow({ placeholder, onAdd }: { placeholder: string; onAdd: (value: string) => void }) {
  const [value, setValue] = useState('');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} />
      <button type="submit" disabled={!value.trim()}>+ Add</button>
    </form>
  );
}

function TaskLinkSection({ existingTasks, onLinkExisting, onCreateNew }: {
  existingTasks: { id: string; title: string }[];
  onLinkExisting: (taskId: string, taskTitle: string) => void;
  onCreateNew: (title: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [taskId, setTaskId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'existing') {
      const task = existingTasks.find((t) => t.id === taskId);
      if (!task) return;
      onLinkExisting(task.id, task.title);
      setTaskId('');
    } else {
      if (!newTitle.trim()) return;
      setCreating(true);
      onCreateNew(newTitle.trim()).finally(() => { setCreating(false); setNewTitle(''); });
    }
  }

  return (
    <form className="inline-add-row" style={{ flexDirection: 'column', alignItems: 'stretch' }} onSubmit={handleSubmit}>
      <div className="skill-resource-mode-toggle">
        <button type="button" className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>Create new task</button>
        <button type="button" className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>Link existing</button>
      </div>
      {mode === 'new' ? (
        <div className="inline-add-row" style={{ marginTop: 8 }}>
          <input type="text" placeholder="New task title… (also appears in Tasks)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <button type="submit" disabled={!newTitle.trim() || creating}>{creating ? 'Creating…' : '+ Create'}</button>
        </div>
      ) : (
        <div className="inline-add-row" style={{ marginTop: 8 }}>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            <option value="">Choose an existing task…</option>
            {existingTasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <button type="submit" disabled={!taskId}>+ Link</button>
        </div>
      )}
    </form>
  );
}

function EntryLinkSection({ entryType, linkedRefs, allEntries, onLinkExisting, onCreateNew, onRemove }: {
  entryType: EntryType;
  linkedRefs: LinkRef[];
  allEntries: { id: string; title: string; type: EntryType }[];
  onLinkExisting: (ref: LinkRef) => void;
  onCreateNew: (title: string, description: string) => Promise<void>;
  onRemove: (refId: string) => void;
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [entryId, setEntryId] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [descriptionHtml, setDescriptionHtml] = useState('');
  const [creating, setCreating] = useState(false);
  const linkedIds = new Set(linkedRefs.map((r) => r.id));
  const availableEntries = allEntries.filter((e) => e.type === entryType && !linkedIds.has(e.id));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'existing') {
      const entry = availableEntries.find((en) => en.id === entryId);
      if (!entry) return;
      onLinkExisting({ type: 'entry', id: entry.id, title: entry.title });
      setEntryId('');
    } else {
      if (!newTitle.trim()) return;
      setCreating(true);
      onCreateNew(newTitle.trim(), descriptionHtml).finally(() => { setCreating(false); setNewTitle(''); setDescriptionHtml(''); });
    }
  }

  return (
    <div className="stat-card">
      <form onSubmit={handleSubmit}>
        <div className="skill-resource-mode-toggle">
          <button type="button" className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>Create new {entryType.toLowerCase()}</button>
          <button type="button" className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>Link existing</button>
        </div>
        {mode === 'new' ? (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="text" placeholder={`${entryType} title\u2026 (also appears in Entries)`} value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <RichNotesEditor value={descriptionHtml} onSave={setDescriptionHtml} placeholder="Details\u2026" />
            <button type="submit" disabled={!newTitle.trim() || creating} style={{ alignSelf: 'flex-start' }}>{creating ? 'Creating\u2026' : '+ Create'}</button>
          </div>
        ) : (
          <div className="inline-add-row" style={{ marginTop: 8 }}>
            <select value={entryId} onChange={(e) => setEntryId(e.target.value)}>
              <option value="">Choose an existing {entryType.toLowerCase()}\u2026</option>
              {availableEntries.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <button type="submit" disabled={!entryId}>+ Link</button>
          </div>
        )}
      </form>
      {linkedRefs.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No {entryType.toLowerCase()}s linked yet.</p>}
      {linkedRefs.map((ref) => (
        <div className="skill-resource-row" key={ref.id}>
          <span style={{ flex: 1 }}>{ref.title}</span>
          <button className="skill-delete-btn" onClick={() => onRemove(ref.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function JournalLinkSection({ existingEntries, onLinkExisting, onCreateNew }: {
  existingEntries: { id: string; logType: string; date: string }[];
  onLinkExisting: (id: string, title: string) => void;
  onCreateNew: (contentHtml: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [entryId, setEntryId] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [creating, setCreating] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'existing') {
      const entry = existingEntries.find((en) => en.id === entryId);
      if (!entry) return;
      onLinkExisting(entry.id, `${entry.logType} log (${entry.date})`);
      setEntryId('');
    } else {
      if (!contentHtml.trim()) return;
      setCreating(true);
      onCreateNew(contentHtml).finally(() => { setCreating(false); setContentHtml(''); });
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="skill-resource-mode-toggle">
        <button type="button" className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>Create new entry</button>
        <button type="button" className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>Link existing</button>
      </div>
      {mode === 'new' ? (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <RichNotesEditor value={contentHtml} onSave={setContentHtml} placeholder="Meeting note content\u2026 (also appears in Journal)" />
          <button type="submit" disabled={!contentHtml.trim() || creating} style={{ alignSelf: 'flex-start' }}>{creating ? 'Creating\u2026' : '+ Create'}</button>
        </div>
      ) : (
        <div className="inline-add-row" style={{ marginTop: 8 }}>
          <select value={entryId} onChange={(e) => setEntryId(e.target.value)}>
            <option value="">Choose an existing entry\u2026</option>
            {existingEntries.map((e) => <option key={e.id} value={e.id}>{e.logType} log ({e.date})</option>)}
          </select>
          <button type="submit" disabled={!entryId}>+ Link</button>
        </div>
      )}
    </form>
  );
}

function AddResourceRow({ onAdd }: { onAdd: (title: string, url: string) => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), url.trim() || '#');
    setTitle(''); setUrl('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <input type="text" placeholder="Resource title…" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button type="submit" disabled={!title.trim()}>+ Add</button>
    </form>
  );
}

function AddFileRow({ onAdd }: { onAdd: (title: string, url: string) => void }) {
  const [fileName, setFileName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileUrl(URL.createObjectURL(file));
  }
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fileUrl) return;
    onAdd(fileName, fileUrl);
    setFileName(''); setFileUrl('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      {fileName && <span className="muted-text" style={{ fontSize: 12 }}>{fileName}</span>}
      <button type="submit" disabled={!fileUrl}>+ Add</button>
    </form>
  );
}

function ProblemSolutionSection({ linkedRefs, allEntries, onLinkExisting, onCreateNew, onRemove }: {
  linkedRefs: LinkRef[];
  allEntries: { id: string; title: string }[];
  onLinkExisting: (ref: LinkRef) => void;
  onCreateNew: (problem: string, solutionHtml: string) => Promise<void>;
  onRemove: (refId: string) => void;
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [entryId, setEntryId] = useState('');
  const [problem, setProblem] = useState('');
  const [solutionHtml, setSolutionHtml] = useState('');
  const [creating, setCreating] = useState(false);
  const linkedIds = new Set(linkedRefs.map((r) => r.id));
  const availableEntries = allEntries.filter((e) => !linkedIds.has(e.id));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'existing') {
      const entry = availableEntries.find((en) => en.id === entryId);
      if (!entry) return;
      onLinkExisting({ type: 'entry', id: entry.id, title: entry.title });
      setEntryId('');
    } else {
      if (!problem.trim()) return;
      setCreating(true);
      onCreateNew(problem.trim(), solutionHtml).finally(() => { setCreating(false); setProblem(''); setSolutionHtml(''); });
    }
  }

  return (
    <div className="stat-card">
      <form onSubmit={handleSubmit}>
        <div className="skill-resource-mode-toggle">
          <button type="button" className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>Create new</button>
          <button type="button" className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>Link existing</button>
        </div>
        {mode === 'new' ? (
          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input type="text" placeholder="Problem\u2026 (also appears in Entries)" value={problem} onChange={(e) => setProblem(e.target.value)} />
            <RichNotesEditor value={solutionHtml} onSave={setSolutionHtml} placeholder="Solution \u2014 code can be pasted here\u2026" />
            <button type="submit" disabled={!problem.trim() || creating} style={{ alignSelf: 'flex-start' }}>{creating ? 'Creating\u2026' : '+ Create'}</button>
          </div>
        ) : (
          <div className="inline-add-row" style={{ marginTop: 8 }}>
            <select value={entryId} onChange={(e) => setEntryId(e.target.value)}>
              <option value="">Choose an existing problem\u2026</option>
              {availableEntries.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
            <button type="submit" disabled={!entryId}>+ Link</button>
          </div>
        )}
      </form>
      {linkedRefs.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No problems logged yet.</p>}
      {linkedRefs.map((ref) => (
        <div className="skill-resource-row" key={ref.id}>
          <span style={{ flex: 1 }}>{ref.title}</span>
          <button className="skill-delete-btn" onClick={() => onRemove(ref.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}

function MilestoneWithTasks({
  milestone, canMoveUp, canMoveDown, existingTasks, allTasks,
  onMoveUp, onMoveDown, onToggle, onRemove, onLinkExistingTask, onCreateNewTask, onRemoveTask, onToggleTaskStatus,
}: {
  milestone: { id: string; title: string; done: boolean; tasks: LinkRef[] };
  canMoveUp: boolean; canMoveDown: boolean;
  existingTasks: { id: string; title: string }[];
  allTasks: { id: string; title: string; status: string }[];
  onMoveUp: () => void; onMoveDown: () => void; onToggle: () => void; onRemove: () => void;
  onLinkExistingTask: (taskId: string, taskTitle: string) => void;
  onCreateNewTask: (title: string) => Promise<void>;
  onRemoveTask: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string, currentlyDone: boolean) => void;
}) {
  return (
    <div className="milestone-group" style={{ marginTop: 10 }}>
      <div className="skill-list-row milestone-group-header">
        <MoveButtons canMoveUp={canMoveUp} canMoveDown={canMoveDown} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
        <label className="task-checklist-item" style={{ flex: 1 }}>
          <input type="checkbox" checked={milestone.done} onChange={onToggle} />
          <span className={milestone.done ? 'task-done' : ''}>{milestone.title}</span>
          {milestone.tasks.length > 0 && <span className="milestone-count">{milestone.tasks.length} task{milestone.tasks.length === 1 ? '' : 's'}</span>}
        </label>
        <button className="skill-delete-btn" onClick={onRemove}>Remove</button>
      </div>
      <div className="milestone-syllabus">
        {milestone.tasks.map((t) => {
          const task = allTasks.find((task) => task.id === t.id);
          const done = task?.status === 'Done';
          return (
            <div className="skill-resource-row" key={t.id}>
              <label className="task-checklist-item" style={{ flex: 1 }}>
                <input type="checkbox" checked={done} onChange={() => onToggleTaskStatus(t.id, done)} />
                <span className={done ? 'task-done' : ''}>{t.title}</span>
              </label>
              {task && <span className="entry-type-badge">{task.status}</span>}
              <button className="skill-delete-btn" onClick={() => onRemoveTask(t.id)}>Remove</button>
            </div>
          );
        })}
        <TaskLinkSection existingTasks={existingTasks} onLinkExisting={onLinkExistingTask} onCreateNew={onCreateNewTask} />
      </div>
    </div>
  );
}
