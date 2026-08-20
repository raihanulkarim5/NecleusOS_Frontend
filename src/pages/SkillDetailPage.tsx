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

interface SkillDetailPageProps {
  skillId: string;
  onBack: () => void;
}

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

      <section>
        <h2 className="section-title">Progress tracker</h2>
        <div className="stat-card">
          <div className="budget-row-top">
            <span className="budget-cat">Overall progress</span>
            <span className="budget-amounts">{skill.progressPercent}%</span>
          </div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${skill.progressPercent}%` }} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Roadmap / syllabus</h2>
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
      </section>

      <section>
        <h2 className="section-title">Milestones</h2>
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
      </section>

      <div className="skill-detail-grid">
        <section>
          <h2 className="section-title">Resources</h2>
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
        </section>

        <section>
          <h2 className="section-title">Courses</h2>
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
        </section>

        <section>
          <h2 className="section-title">Videos / playlists</h2>
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
        </section>

        <section>
          <h2 className="section-title">Practice tasks</h2>
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
        </section>
      </div>

      <section>
        <h2 className="section-title">Projects</h2>
        {skill.projects.length === 0 ? (
          <p className="muted-text">No linked projects.</p>
        ) : (
          <div className="project-links">
            {skill.projects.map((p) => (
              <span key={p.id} className="project-link-badge">{p.type}: {p.title}</span>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="section-title">Notes</h2>
        <textarea
          className="skill-notes"
          rows={4}
          value={notesDraft}
          placeholder="Freeform notes about this skill…"
          onChange={(e) => setNotesDraft(e.target.value)}
          onBlur={() => {
            if (notesDraft !== skill.notes) updateNotes.mutate({ id: skill.id, notes: notesDraft });
          }}
        />
      </section>
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
