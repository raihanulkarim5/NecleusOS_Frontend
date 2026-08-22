import { FormEvent, useEffect, useState } from 'react';
import {
  useAddCourse,
  useAddMilestone,
  useAddPracticeTask,
  useAddResource,
  useAddSyllabusItem,
  useAddVideo,
  useSkill,
  useToggleSkillFavorite,
  useToggleSkillMilestone,
  useToggleSyllabusItem,
  useUpdateSkillNotes,
} from '../hooks/useSkills';
import { useTasks } from '../hooks/useTasks';
import type { Skill } from '../types/skill';

interface SkillDetailPageProps {
  skillId: string;
  onBack: () => void;
}

type SectionKey =
  | 'overview'
  | 'syllabus'
  | 'resources'
  | 'courses'
  | 'videos'
  | 'practice'
  | 'notes'
  | 'projects'
  | 'milestones'
  | 'progress';

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
function ProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20V10M12 20V4M20 20v-6" />
    </svg>
  );
}

const SECTIONS: { key: SectionKey; label: string; icon: () => JSX.Element }[] = [
  { key: 'overview', label: 'Overview', icon: OverviewIcon },
  { key: 'syllabus', label: 'Roadmap / Syllabus', icon: SyllabusIcon },
  { key: 'resources', label: 'Resources', icon: ResourceIcon },
  { key: 'courses', label: 'Courses', icon: CourseIcon },
  { key: 'videos', label: 'Videos / Playlists', icon: VideoIcon },
  { key: 'practice', label: 'Practice tasks', icon: PracticeIcon },
  { key: 'notes', label: 'Notes', icon: NotesIcon },
  { key: 'projects', label: 'Projects', icon: ProjectIcon },
  { key: 'milestones', label: 'Milestones', icon: MilestoneIcon },
  { key: 'progress', label: 'Progress tracker', icon: ProgressIcon },
];

export function SkillDetailPage({ skillId, onBack }: SkillDetailPageProps) {
  const { data: skill, isLoading } = useSkill(skillId);
  const toggleSyllabusItem = useToggleSyllabusItem();
  const addSyllabusItem = useAddSyllabusItem();
  const toggleMilestone = useToggleSkillMilestone();
  const addMilestone = useAddMilestone();
  const addResource = useAddResource();
  const addCourse = useAddCourse();
  const addVideo = useAddVideo();
  const addPracticeTask = useAddPracticeTask();
  const toggleFavorite = useToggleSkillFavorite();
  const updateNotes = useUpdateSkillNotes();
  const { data: tasks } = useTasks();

  const [section, setSection] = useState<SectionKey>('overview');
  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (skill) setNotesDraft(skill.notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill?.id]);

  if (isLoading || !skill) {
    return <p className="muted-text">Loading skill…</p>;
  }

  const linkedTaskIds = new Set(skill.practiceTasks.map((t) => t.id));
  const unlinkedTasks = (tasks ?? []).filter((t) => !linkedTaskIds.has(t.id));
  const nextStep = skill.syllabus.find((s) => !s.done);

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-link" onClick={onBack}>Skills</span>
        <span className="breadcrumb-sep">/</span>
        <span className="breadcrumb-current">{skill.name}</span>
      </div>

      <div className="skill-detail-header">
        <div>
          <h1 className="page-title">{skill.name}</h1>
          <p className="page-date">{skill.category} · {skill.status}</p>
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
        <div className="stat-card">
          {skill.syllabus.length === 0 && <p className="muted-text">No syllabus steps yet.</p>}
          {skill.syllabus.map((item) => (
            <label key={item.id} className="task-checklist-item">
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleSyllabusItem.mutate({ skillId: skill.id, itemId: item.id })}
              />
              <span className={item.done ? 'task-done' : ''}>{item.title}</span>
            </label>
          ))}
          <InlineAddRow
            placeholder="Add a syllabus step…"
            onAdd={(title) => addSyllabusItem.mutate({ skillId: skill.id, title })}
          />
        </div>
      )}

      {section === 'resources' && (
        <div className="stat-card">
          {skill.resources.length === 0 && <p className="muted-text">No resources added.</p>}
          {skill.resources.map((r) => (
            <div className="skill-resource-row" key={r.id}>
              <span className="entry-type-badge">{r.type}</span>
              <span>{r.title}</span>
            </div>
          ))}
          <AddResourceRow onAdd={(title, url, type) => addResource.mutate({ skillId: skill.id, title, url, type })} />
        </div>
      )}

      {section === 'courses' && (
        <div className="stat-card">
          {skill.courses.length === 0 && <p className="muted-text">No courses added.</p>}
          {skill.courses.map((c) => (
            <div className="skill-resource-row" key={c.id}>
              <span>{c.title}</span>
              <span className="muted-text">{c.provider}</span>
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
              <span>{v.title}</span>
            </div>
          ))}
          <InlineAddRow
            placeholder="Add a video title…"
            onAdd={(title) => addVideo.mutate({ skillId: skill.id, title, url: '#' })}
          />
        </div>
      )}

      {section === 'practice' && (
        <div className="stat-card">
          {skill.practiceTasks.length === 0 && <p className="muted-text">No linked tasks.</p>}
          {skill.practiceTasks.map((t) => (
            <div className="project-link-badge" key={t.id} style={{ marginBottom: 6, display: 'inline-block' }}>
              {t.type}: {t.title}
            </div>
          ))}
          {unlinkedTasks.length > 0 && (
            <LinkTaskRow
              tasks={unlinkedTasks}
              onLink={(taskId, taskTitle) => addPracticeTask.mutate({ skillId: skill.id, taskId, taskTitle })}
            />
          )}
        </div>
      )}

      {section === 'notes' && (
        <textarea
          className="skill-notes"
          rows={8}
          value={notesDraft}
          placeholder="Freeform notes about this skill…"
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={() => {
            if (notesDraft !== skill.notes) updateNotes.mutate({ id: skill.id, notes: notesDraft });
          }}
        />
      )}

      {section === 'projects' &&
        (skill.projects.length === 0 ? (
          <p className="muted-text">No linked projects.</p>
        ) : (
          <div className="project-links">
            {skill.projects.map((p) => (
              <span key={p.id} className="project-link-badge">{p.type}: {p.title}</span>
            ))}
          </div>
        ))}

      {section === 'milestones' && (
        <div className="stat-card">
          {skill.milestones.length === 0 && <p className="muted-text">No milestones set.</p>}
          {skill.milestones.map((m) => (
            <label key={m.id} className="task-checklist-item">
              <input
                type="checkbox"
                checked={m.done}
                onChange={() => toggleMilestone.mutate({ skillId: skill.id, milestoneId: m.id })}
              />
              <span className={m.done ? 'task-done' : ''}>{m.title}</span>
            </label>
          ))}
          <InlineAddRow
            placeholder="Add a milestone…"
            onAdd={(title) => addMilestone.mutate({ skillId: skill.id, title })}
          />
        </div>
      )}

      {section === 'progress' && (
        <div className="stat-card">
          <div className="budget-row-top">
            <span className="budget-cat">Overall progress</span>
            <span className="budget-amounts">{skill.progressPercent}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${skill.progressPercent}%` }} />
          </div>
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

function AddResourceRow({ onAdd }: { onAdd: (title: string, url: string, type: 'Link' | 'PDF') => void }) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'Link' | 'PDF'>('Link');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), url.trim() || '#', type);
    setTitle('');
    setUrl('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <input type="text" placeholder="Resource title…" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select value={type} onChange={(e) => setType(e.target.value as 'Link' | 'PDF')}>
        <option value="Link">Link</option>
        <option value="PDF">PDF</option>
      </select>
      <button type="submit" disabled={!title.trim()}>+ Add</button>
    </form>
  );
}

function AddCourseRow({ onAdd }: { onAdd: (title: string, provider: string, url: string) => void }) {
  const [title, setTitle] = useState('');
  const [provider, setProvider] = useState('');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), provider.trim() || 'Self-paced', '#');
    setTitle('');
    setProvider('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <input type="text" placeholder="Course title…" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input type="text" placeholder="Provider" value={provider} onChange={(e) => setProvider(e.target.value)} style={{ maxWidth: 120 }} />
      <button type="submit" disabled={!title.trim()}>+ Add</button>
    </form>
  );
}

function LinkTaskRow({
  tasks,
  onLink,
}: {
  tasks: { id: string; title: string }[];
  onLink: (taskId: string, taskTitle: string) => void;
}) {
  const [taskId, setTaskId] = useState('');
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    onLink(task.id, task.title);
    setTaskId('');
  }
  return (
    <form className="inline-add-row" onSubmit={handleSubmit}>
      <select value={taskId} onChange={(e) => setTaskId(e.target.value)}>
        <option value="">Link a task…</option>
        {tasks.map((t) => (
          <option key={t.id} value={t.id}>{t.title}</option>
        ))}
      </select>
      <button type="submit" disabled={!taskId}>+ Link</button>
    </form>
  );
}
