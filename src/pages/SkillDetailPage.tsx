import { ChangeEvent, FormEvent, useState } from 'react';
import {
  useAddCourse,
  useAddMilestone,
  useAddPracticeTask,
  useAddProjectToMilestone,
  useAddProjectToSyllabusItem,
  useAddResource,
  useAddSyllabusItem,
  useAddVideo,
  useLinkSkillProject,
  useRemoveCourse,
  useRemoveMilestone,
  useRemovePracticeTask,
  useRemoveProjectFromMilestone,
  useRemoveProjectFromSyllabusItem,
  useRemoveResource,
  useRemoveSyllabusItem,
  useRemoveVideo,
  useSkill,
  useToggleSkillFavorite,
  useToggleSkillMilestone,
  useToggleSyllabusItem,
  useUnlinkSkillProject,
  useUpdateSkillDescription,
  useUpdateSkillNotes,
  useUpdateSyllabusItemDetails,
} from '../hooks/useSkills';
import { useCreateTask, useTasks, useUpdateTaskStatus } from '../hooks/useTasks';
import { useCreateProject, useProjects } from '../hooks/useProjects';
import { RichNotesEditor } from '../components/RichNotesEditor';
import type { LinkRef } from '../types/link';
import type { Skill, SkillMilestone } from '../types/skill';
import type { Project } from '../types/project';

interface SkillDetailPageProps {
  skillId: string;
  onBack: () => void;
}

type SectionKey = 'overview' | 'syllabus' | 'resources' | 'courses' | 'videos' | 'practice' | 'notes' | 'projects';

function OverviewIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8v.01" />
    </svg>
  );
}
function SyllabusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 6h14M5 12h14M5 18h9" />
      <circle cx="19" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
function ResourceIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1" />
      <path d="M14 11a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1" />
    </svg>
  );
}
function CourseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16z" />
      <path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" />
    </svg>
  );
}
function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function PracticeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 12l2 2 4-4" />
      <rect x="3" y="3" width="18" height="18" rx="4" />
    </svg>
  );
}
function NotesIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
function ProjectIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
    </svg>
  );
}
function MilestoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 3v18" />
      <path d="M5 4h11l-2 3 2 3H5" />
    </svg>
  );
}

const SECTIONS: { key: SectionKey; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: OverviewIcon },
  { key: 'syllabus', label: 'Milestones & Roadmap', icon: MilestoneIcon },
  { key: 'resources', label: 'Resources', icon: ResourceIcon },
  { key: 'courses', label: 'Courses', icon: CourseIcon },
  { key: 'videos', label: 'Videos / Playlists', icon: VideoIcon },
  { key: 'practice', label: 'Practice tasks', icon: PracticeIcon },
  { key: 'notes', label: 'Notes', icon: NotesIcon },
  { key: 'projects', label: 'Projects', icon: ProjectIcon },
];

export function SkillDetailPage({ skillId, onBack }: SkillDetailPageProps) {
  const { data: skill, isLoading } = useSkill(skillId);
  const toggleSyllabusItem = useToggleSyllabusItem();
  const addSyllabusItem = useAddSyllabusItem();
  const removeSyllabusItem = useRemoveSyllabusItem();
  const addProjectToSyllabusItem = useAddProjectToSyllabusItem();
  const removeProjectFromSyllabusItem = useRemoveProjectFromSyllabusItem();
  const updateSyllabusItemDetails = useUpdateSyllabusItemDetails();
  const toggleMilestone = useToggleSkillMilestone();
  const addMilestone = useAddMilestone();
  const removeMilestone = useRemoveMilestone();
  const addProjectToMilestone = useAddProjectToMilestone();
  const removeProjectFromMilestone = useRemoveProjectFromMilestone();
  const addResource = useAddResource();
  const removeResource = useRemoveResource();
  const addCourse = useAddCourse();
  const removeCourse = useRemoveCourse();
  const addVideo = useAddVideo();
  const removeVideo = useRemoveVideo();
  const addPracticeTask = useAddPracticeTask();
  const removePracticeTask = useRemovePracticeTask();
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const linkProject = useLinkSkillProject();
  const unlinkProject = useUnlinkSkillProject();
  const createProject = useCreateProject();
  const toggleFavorite = useToggleSkillFavorite();
  const updateNotes = useUpdateSkillNotes();
  const updateDescription = useUpdateSkillDescription();
  const { data: tasks } = useTasks();
  const { data: allProjects } = useProjects();

  const [section, setSection] = useState<SectionKey>('overview');
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');

  if (isLoading || !skill) {
    return <p className="muted-text">Loading skill…</p>;
  }

  const linkedTaskIds = new Set(skill.practiceTasks.map((t) => t.id));
  const linkedTaskObjects = (tasks ?? []).filter((t) => linkedTaskIds.has(t.id));
  const unlinkedTasks = (tasks ?? []).filter((t) => !linkedTaskIds.has(t.id));
  const linkedProjectIds = new Set(skill.projects.map((p) => p.id));
  const unlinkedProjects = (allProjects ?? []).filter((p) => !linkedProjectIds.has(p.id));
  const projectById = new Map((allProjects ?? []).map((p) => [p.id, p]));
  const nextStep = skill.milestones.flatMap((m) => m.syllabus).find((s) => !s.done);

  function startEditingDescription() {
    setDescriptionDraft(skill!.description);
    setEditingDescription(true);
  }

  function saveDescription() {
    updateDescription.mutate({ id: skill!.id, description: descriptionDraft.trim() });
    setEditingDescription(false);
  }

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={onBack}>Skills</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{skill.name}</span>
      </div>

      <div className="skill-detail-header">
        <div style={{ flex: 1 }}>
          <h1 className="page-title">{skill.name}</h1>
          <p className="page-date">{skill.category} · {skill.status}</p>

          {editingDescription ? (
            <div className="skill-description-edit">
              <textarea
                rows={2}
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                autoFocus
              />
              <div className="modal-actions" style={{ marginTop: 6 }}>
                <button type="button" className="modal-cancel" onClick={() => setEditingDescription(false)}>Cancel</button>
                <button type="button" className="auth-submit" onClick={saveDescription}>Save</button>
              </div>
            </div>
          ) : (
            <p className="skill-brief" onClick={startEditingDescription}>
              {skill.description || 'No description yet — click to add one.'}
            </p>
          )}

          <div className="skill-progress-inline">
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${skill.progressPercent}%` }} />
            </div>
            <span className="skill-progress-label">{skill.progressPercent}%</span>
          </div>
        </div>
        <button
          className={`entry-fav${skill.favorite ? ' active' : ''}`}
          onClick={() => toggleFavorite.mutate(skill.id)}
          aria-label={skill.favorite ? 'Unfavorite' : 'Favorite'}
        >
          ★
        </button>
      </div>

      <div className="sub-tabs">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              className={`sub-tab${section === s.key ? ' active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              <span className="sub-tab-icon"><Icon /></span>
              {s.label}
            </button>
          );
        })}
      </div>

      {section === 'overview' && <OverviewSection skill={skill} nextStepTitle={nextStep?.title} />}

      {section === 'syllabus' && (
        <div>
          <InlineAddRow
            placeholder="Add a milestone…"
            onAdd={(title) => addMilestone.mutate({ skillId: skill.id, title })}
          />
          {skill.milestones.length === 0 && <p className="muted-text" style={{ marginTop: 10 }}>No milestones yet.</p>}
          <div style={{ marginTop: 12 }}>
            {skill.milestones.map((m) => (
              <MilestoneGroup
                key={m.id}
                milestone={m}
                projects={allProjects ?? []}
                onToggleMilestone={() => toggleMilestone.mutate({ skillId: skill.id, milestoneId: m.id })}
                onRemoveMilestone={() => removeMilestone.mutate({ skillId: skill.id, milestoneId: m.id })}
                onAddMilestoneProject={(ref) => addProjectToMilestone.mutate({ skillId: skill.id, milestoneId: m.id, projectRef: ref })}
                onRemoveMilestoneProject={(projectId) =>
                  removeProjectFromMilestone.mutate({ skillId: skill.id, milestoneId: m.id, projectId })
                }
                onToggleItem={(itemId) => toggleSyllabusItem.mutate({ skillId: skill.id, milestoneId: m.id, itemId })}
                onAddItem={(title) => addSyllabusItem.mutate({ skillId: skill.id, milestoneId: m.id, title })}
                onRemoveItem={(itemId) => removeSyllabusItem.mutate({ skillId: skill.id, milestoneId: m.id, itemId })}
                onSetItemDetails={(itemId, details) =>
                  updateSyllabusItemDetails.mutate({ skillId: skill.id, milestoneId: m.id, itemId, details })
                }
                onAddItemProject={(itemId, ref) =>
                  addProjectToSyllabusItem.mutate({ skillId: skill.id, milestoneId: m.id, itemId, projectRef: ref })
                }
                onRemoveItemProject={(itemId, projectId) =>
                  removeProjectFromSyllabusItem.mutate({ skillId: skill.id, milestoneId: m.id, itemId, projectId })
                }
              />
            ))}
          </div>
        </div>
      )}

      {section === 'resources' && (
        <div className="stat-card">
          {skill.resources.length === 0 && <p className="muted-text">No resources added.</p>}
          {skill.resources.map((r) => (
            <div className="skill-resource-row" key={r.id}>
              <span className="entry-type-badge">{r.type}</span>
              {r.url && r.url !== '#' ? (
                <a href={r.url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>{r.title}</a>
              ) : (
                <span style={{ flex: 1 }}>{r.title}</span>
              )}
              {r.isUpload && <span className="skill-upload-tag">uploaded</span>}
              <button className="skill-delete-btn" onClick={() => removeResource.mutate({ skillId: skill.id, resourceId: r.id })}>Remove</button>
            </div>
          ))}
          <AddResourceRow
            onAdd={(title, url, type, isUpload) =>
              addResource.mutate({ skillId: skill.id, title, url, type, isUpload })
            }
          />
        </div>
      )}

      {section === 'courses' && (
        <div className="stat-card">
          {skill.courses.length === 0 && <p className="muted-text">No courses added.</p>}
          {skill.courses.map((c) => (
            <div className="skill-resource-row" key={c.id}>
              {c.url && c.url !== '#' ? (
                <a href={c.url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>{c.title}</a>
              ) : (
                <span style={{ flex: 1 }}>{c.title}</span>
              )}
              <span className="muted-text">{c.provider}</span>
              <button className="skill-delete-btn" onClick={() => removeCourse.mutate({ skillId: skill.id, courseId: c.id })}>Remove</button>
            </div>
          ))}
          <AddCourseRow onAdd={(title, provider, url) => addCourse.mutate({ skillId: skill.id, title, provider, url })} />
        </div>
      )}

      {section === 'videos' && (
        <div className="stat-card">
          {skill.videos.length === 0 && <p className="muted-text">No videos added.</p>}
          {skill.videos.map((v) => (
            <div className="skill-resource-row" key={v.id}>
              {v.url && v.url !== '#' ? (
                <a href={v.url} target="_blank" rel="noreferrer" style={{ flex: 1 }}>{v.title}</a>
              ) : (
                <span style={{ flex: 1 }}>{v.title}</span>
              )}
              <button className="skill-delete-btn" onClick={() => removeVideo.mutate({ skillId: skill.id, videoId: v.id })}>Remove</button>
            </div>
          ))}
          <AddVideoRow onAdd={(title, url) => addVideo.mutate({ skillId: skill.id, title, url })} />
        </div>
      )}

      {section === 'practice' && (
        <div className="stat-card">
          {skill.practiceTasks.length === 0 && <p className="muted-text">No practice tasks yet.</p>}
          {skill.practiceTasks.map((t) => {
            const task = linkedTaskObjects.find((task) => task.id === t.id);
            const done = task?.status === 'Done';
            return (
              <div className="skill-resource-row" key={t.id}>
                <label className="task-checklist-item" style={{ flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() =>
                      task && updateTaskStatus.mutate({ id: task.id, status: done ? 'Open' : 'Done' })
                    }
                  />
                  <span className={done ? 'task-done' : ''}>{t.title}</span>
                </label>
                {task && <span className="entry-type-badge">{task.status}</span>}
                <button className="skill-delete-btn" onClick={() => removePracticeTask.mutate({ skillId: skill.id, taskId: t.id })}>Remove</button>
              </div>
            );
          })}
          <PracticeTaskRow
            existingTasks={unlinkedTasks}
            onLinkExisting={(taskId, taskTitle) => addPracticeTask.mutate({ skillId: skill.id, taskId, taskTitle })}
            onCreateNew={async (title) => {
              const task = await createTask.mutateAsync({
                title,
                description: '',
                priority: 'Medium',
                dueDate: null,
                tags: [],
                effortEstimateHours: null,
                recurring: 'None',
              });
              addPracticeTask.mutate({ skillId: skill.id, taskId: task.id, taskTitle: task.title });
            }}
          />
        </div>
      )}

      {section === 'notes' && (
        <RichNotesEditor
          value={skill.notes}
          onSave={(html) => updateNotes.mutate({ id: skill.id, notes: html })}
        />
      )}

      {section === 'projects' && (
        <div>
          <div className="project-list">
            {skill.projects.map((ref) => {
              const project = projectById.get(ref.id);
              return (
                <div className="project-card" key={ref.id}>
                  <div className="task-card-top">
                    <span className="project-card-title">{ref.title}</span>
                    <button className="skill-unlink-btn" onClick={() => unlinkProject.mutate({ skillId: skill.id, projectId: ref.id })}>
                      Remove
                    </button>
                  </div>
                  {project?.description && <p className="entry-desc">{project.description}</p>}
                  {project && (
                    <div className="project-progress">
                      <div className="budget-row-top">
                        <span className="budget-cat">{project.status}</span>
                        <span className="budget-amounts">{project.progressPercent}%</span>
                      </div>
                      <div className="bar-track">
                        <div className="bar-fill" style={{ width: `${project.progressPercent}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {skill.projects.length === 0 && <p className="muted-text">No projects yet.</p>}
          <LinkOrCreateProjectRow
            existingProjects={unlinkedProjects}
            onLinkExisting={(ref) => linkProject.mutate({ skillId: skill.id, projectRef: ref })}
            onCreateNew={async (name, description) => {
              const project = await createProject.mutateAsync({ name, description, tags: [] });
              linkProject.mutate({ skillId: skill.id, projectRef: { type: 'project', id: project.id, title: project.name } });
            }}
          />
        </div>
      )}
    </div>
  );
}

function OverviewSection({ skill, nextStepTitle }: { skill: Skill; nextStepTitle?: string }) {
  const doneMilestones = skill.milestones.filter((m) => m.done).length;
  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Progress</div>
          <div className="stat-big glow-cyan">{skill.progressPercent}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-big glow-violet" style={{ fontSize: 18 }}>{skill.status}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Milestones</div>
          <div className="stat-big glow-magenta">{doneMilestones}/{skill.milestones.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Next step</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>{nextStepTitle ?? 'All caught up'}</div>
        </div>
      </div>
      {skill.tags.length > 0 && (
        <div className="entry-tags" style={{ marginTop: 16 }}>
          {skill.tags.map((tag) => (
            <span key={tag} className="entry-tag">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectMultiLink({
  projectRefs,
  projects,
  onAdd,
  onRemove,
}: {
  projectRefs: LinkRef[];
  projects: Project[];
  onAdd: (ref: LinkRef) => void;
  onRemove: (projectId: string) => void;
}) {
  const [picking, setPicking] = useState(false);
  const [choice, setChoice] = useState('');
  const linkedIds = new Set(projectRefs.map((p) => p.id));
  const available = projects.filter((p) => !linkedIds.has(p.id));

  return (
    <span className="skill-mini-link-group">
      {projectRefs.map((ref) => (
        <span className="skill-mini-badge" key={ref.id}>
          {ref.title}
          <button onClick={() => onRemove(ref.id)} aria-label="Remove project">×</button>
        </span>
      ))}
      {picking ? (
        <span className="skill-mini-picker">
          <select value={choice} onChange={(e) => setChoice(e.target.value)}>
            <option value="">Choose project…</option>
            {available.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            disabled={!choice}
            onClick={() => {
              const project = available.find((p) => p.id === choice);
              if (project) onAdd({ type: 'project', id: project.id, title: project.name });
              setPicking(false);
              setChoice('');
            }}
          >
            Link
          </button>
        </span>
      ) : (
        available.length > 0 && (
          <button className="skill-mini-link-btn" onClick={() => setPicking(true)}>+ project</button>
        )
      )}
    </span>
  );
}

function MilestoneGroup({
  milestone,
  projects,
  onToggleMilestone,
  onRemoveMilestone,
  onAddMilestoneProject,
  onRemoveMilestoneProject,
  onToggleItem,
  onAddItem,
  onRemoveItem,
  onSetItemDetails,
  onAddItemProject,
  onRemoveItemProject,
}: {
  milestone: SkillMilestone;
  projects: Project[];
  onToggleMilestone: () => void;
  onRemoveMilestone: () => void;
  onAddMilestoneProject: (ref: LinkRef) => void;
  onRemoveMilestoneProject: (projectId: string) => void;
  onToggleItem: (itemId: string) => void;
  onAddItem: (title: string) => void;
  onRemoveItem: (itemId: string) => void;
  onSetItemDetails: (itemId: string, details: string) => void;
  onAddItemProject: (itemId: string, ref: LinkRef) => void;
  onRemoveItemProject: (itemId: string, projectId: string) => void;
}) {
  const doneCount = milestone.syllabus.filter((i) => i.done).length;

  return (
    <div className="milestone-group">
      <div className="skill-list-row milestone-group-header">
        <label className="task-checklist-item" style={{ flex: 1 }}>
          <input type="checkbox" checked={milestone.done} onChange={onToggleMilestone} />
          <span className={milestone.done ? 'task-done' : ''}>{milestone.title}</span>
          {milestone.syllabus.length > 0 && (
            <span className="milestone-count">{doneCount}/{milestone.syllabus.length}</span>
          )}
        </label>
        <ProjectMultiLink
          projectRefs={milestone.projectRefs}
          projects={projects}
          onAdd={onAddMilestoneProject}
          onRemove={onRemoveMilestoneProject}
        />
        <button className="skill-delete-btn" onClick={onRemoveMilestone}>Remove</button>
      </div>

      <div className="milestone-syllabus">
        {milestone.syllabus.map((item) => (
          <SyllabusPointRow
            key={item.id}
            item={item}
            projects={projects}
            onToggle={() => onToggleItem(item.id)}
            onRemove={() => onRemoveItem(item.id)}
            onSetDetails={(details) => onSetItemDetails(item.id, details)}
            onAddProject={(ref) => onAddItemProject(item.id, ref)}
            onRemoveProject={(projectId) => onRemoveItemProject(item.id, projectId)}
          />
        ))}
        <InlineAddRow placeholder="Add a point/task to this milestone…" onAdd={onAddItem} />
      </div>
    </div>
  );
}

function SyllabusPointRow({
  item,
  projects,
  onToggle,
  onRemove,
  onSetDetails,
  onAddProject,
  onRemoveProject,
}: {
  item: { id: string; title: string; details: string; done: boolean; projectRefs: LinkRef[] };
  projects: Project[];
  onToggle: () => void;
  onRemove: () => void;
  onSetDetails: (details: string) => void;
  onAddProject: (ref: LinkRef) => void;
  onRemoveProject: (projectId: string) => void;
}) {
  const [editingDetails, setEditingDetails] = useState(false);
  const [draft, setDraft] = useState(item.details);

  function save() {
    onSetDetails(draft.trim());
    setEditingDetails(false);
  }

  return (
    <div className="syllabus-point">
      <div className="skill-list-row">
        <label className="task-checklist-item" style={{ flex: 1 }}>
          <input type="checkbox" checked={item.done} onChange={onToggle} />
          <span className={item.done ? 'task-done' : ''}>{item.title}</span>
        </label>
        <ProjectMultiLink projectRefs={item.projectRefs} projects={projects} onAdd={onAddProject} onRemove={onRemoveProject} />
        <button className="skill-delete-btn" onClick={onRemove}>Remove</button>
      </div>
      {editingDetails ? (
        <div className="syllabus-point-details-edit">
          <textarea rows={2} value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus />
          <div className="modal-actions" style={{ marginTop: 6 }}>
            <button type="button" className="modal-cancel" onClick={() => setEditingDetails(false)}>Cancel</button>
            <button type="button" className="auth-submit" onClick={save}>Save</button>
          </div>
        </div>
      ) : (
        <p className="syllabus-point-details" onClick={() => { setDraft(item.details); setEditingDetails(true); }}>
          {item.details || 'Add details…'}
        </p>
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

function AddResourceRow({
  onAdd,
}: {
  onAdd: (title: string, url: string, type: 'Link' | 'PDF', isUpload: boolean) => void;
}) {
  const [mode, setMode] = useState<'link' | 'upload'>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'Link' | 'PDF'>('Link');
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
    if (mode === 'upload') {
      if (!fileUrl) return;
      onAdd(title.trim() || fileName, fileUrl, 'PDF', true);
      setFileName('');
      setFileUrl('');
      setTitle('');
    } else {
      if (!title.trim()) return;
      onAdd(title.trim(), url.trim() || '#', type, false);
      setTitle('');
      setUrl('');
    }
  }

  return (
    <form className="inline-add-row" style={{ flexDirection: 'column', alignItems: 'stretch' }} onSubmit={handleSubmit}>
      <div className="skill-resource-mode-toggle">
        <button type="button" className={mode === 'link' ? 'active' : ''} onClick={() => setMode('link')}>Link</button>
        <button type="button" className={mode === 'upload' ? 'active' : ''} onClick={() => setMode('upload')}>Upload file</button>
      </div>
      {mode === 'link' ? (
        <div className="inline-add-row" style={{ marginTop: 8 }}>
          <input type="text" placeholder="Resource title…" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
          <select value={type} onChange={(e) => setType(e.target.value as 'Link' | 'PDF')}>
            <option value="Link">Link</option>
            <option value="PDF">PDF</option>
          </select>
          <button type="submit" disabled={!title.trim()}>+ Add</button>
        </div>
      ) : (
        <div className="inline-add-row" style={{ marginTop: 8 }}>
          <input type="file" accept="application/pdf,.doc,.docx,.txt,.md" onChange={handleFileChange} />
          {fileName && <span className="muted-text" style={{ fontSize: 12 }}>{fileName}</span>}
          <button type="submit" disabled={!fileUrl}>+ Add</button>
        </div>
      )}
    </form>
  );
}

function AddCourseRow({ onAdd }: { onAdd: (title: string, provider: string, url: string) => void }) {
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  const [url, setUrl] = useState('');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), provider.trim() || 'Self-paced', url.trim() || '#');
    setTitle('');
    setProvider('');
    setUrl('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <input type="text" placeholder="Course title…" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} style={{ maxWidth: 110 }} />
      <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button type="submit" disabled={!title.trim()}>+ Add</button>
    </form>
  );
}

function AddVideoRow({ onAdd }: { onAdd: (title: string, url: string) => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), url.trim() || '#');
    setTitle('');
    setUrl('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <input type="text" placeholder="Video title…" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button type="submit" disabled={!title.trim()}>+ Add</button>
    </form>
  );
}

function PracticeTaskRow({
  existingTasks,
  onLinkExisting,
  onCreateNew,
}: {
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
      onCreateNew(newTitle.trim()).finally(() => {
        setCreating(false);
        setNewTitle('');
      });
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
          <input
            type="text"
            placeholder="New task title… (also appears in Tasks)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button type="submit" disabled={!newTitle.trim() || creating}>{creating ? 'Creating…' : '+ Create'}</button>
        </div>
      ) : (
        <div className="inline-add-row" style={{ marginTop: 8 }}>
          <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            <option value="">Choose an existing task…</option>
            {existingTasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <button type="submit" disabled={!taskId}>+ Link</button>
        </div>
      )}
    </form>
  );
}

function LinkOrCreateProjectRow({
  existingProjects,
  onLinkExisting,
  onCreateNew,
}: {
  existingProjects: Project[];
  onLinkExisting: (ref: LinkRef) => void;
  onCreateNew: (name: string, description: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<'existing' | 'new'>('new');
  const [projectId, setProjectId] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === 'existing') {
      const project = existingProjects.find((p) => p.id === projectId);
      if (!project) return;
      onLinkExisting({ type: 'project', id: project.id, title: project.name });
      setProjectId('');
    } else {
      if (!newName.trim()) return;
      setCreating(true);
      onCreateNew(newName.trim(), newDescription.trim()).finally(() => {
        setCreating(false);
        setNewName('');
        setNewDescription('');
      });
    }
  }

  return (
    <form className="inline-add-row" style={{ flexDirection: 'column', alignItems: 'stretch', marginTop: 12 }} onSubmit={handleSubmit}>
      <div className="skill-resource-mode-toggle">
        <button type="button" className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>Create new project</button>
        <button type="button" className={mode === 'existing' ? 'active' : ''} onClick={() => setMode('existing')}>Link existing</button>
      </div>
      {mode === 'new' ? (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            type="text"
            placeholder="New project name… (also appears in Projects)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <textarea
            rows={2}
            placeholder="Project details (optional)…"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="skill-project-desc-input"
          />
          <button type="submit" disabled={!newName.trim() || creating} style={{ alignSelf: 'flex-start' }}>
            {creating ? 'Creating…' : '+ Create'}
          </button>
        </div>
      ) : (
        <div className="inline-add-row" style={{ marginTop: 8 }}>
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
            <option value="">Choose an existing project…</option>
            {existingProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="submit" disabled={!projectId}>+ Link</button>
        </div>
      )}
    </form>
  );
}
