import { useEffect, useState } from 'react';
import {
  useSkill,
  useToggleSkillFavorite,
  useToggleSkillMilestone,
  useToggleSyllabusItem,
  useUpdateSkillNotes,
} from '../hooks/useSkills';

interface SkillDetailPageProps {
  skillId: string;
  onBack: () => void;
}

export function SkillDetailPage({ skillId, onBack }: SkillDetailPageProps) {
  const { data: skill, isLoading } = useSkill(skillId);
  const toggleSyllabusItem = useToggleSyllabusItem();
  const toggleMilestone = useToggleSkillMilestone();
  const toggleFavorite = useToggleSkillFavorite();
  const updateNotes = useUpdateSkillNotes();

  const [notesDraft, setNotesDraft] = useState('');

  useEffect(() => {
    if (skill) setNotesDraft(skill.notes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill?.id]);

  if (isLoading || !skill) {
    return <p className="muted-text">Loading skill…</p>;
  }

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
