import { FormEvent, useState } from 'react';
import { useCreateSkill, useSkills, useToggleRoadmapItem, useToggleSkillFavorite } from '../hooks/useSkills';
import type { Skill } from '../types/skill';

export function SkillsPage() {
  const { data: skills, isLoading } = useSkills();
  const createSkill = useCreateSkill();
  const toggleFavorite = useToggleSkillFavorite();
  const toggleRoadmapItem = useToggleRoadmapItem();

  const [newName, setNewName] = useState('');

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    createSkill.mutate({ name: newName.trim(), tags: [] });
    setNewName('');
  }

  return (
    <div>
      <h1 className="page-title">Skills</h1>
      <p className="page-date">Learn. Practice. Master. — roadmap and progress per skill.</p>

      <form className="entry-quickadd" onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="New skill…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" disabled={createSkill.isPending || !newName.trim()}>
          {createSkill.isPending ? 'Adding…' : 'Add'}
        </button>
      </form>

      {isLoading && <p className="muted-text">Loading skills…</p>}

      <div className="project-list">
        {skills?.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onToggleFavorite={() => toggleFavorite.mutate(skill.id)}
            onToggleRoadmapItem={(itemId) => toggleRoadmapItem.mutate({ skillId: skill.id, itemId })}
          />
        ))}
      </div>
    </div>
  );
}

function SkillCard({
  skill,
  onToggleFavorite,
  onToggleRoadmapItem,
}: {
  skill: Skill;
  onToggleFavorite: () => void;
  onToggleRoadmapItem: (itemId: string) => void;
}) {
  const nextStep = skill.roadmap.find((r) => !r.done);

  return (
    <div className="project-card">
      <div className="task-card-top">
        <span className="project-card-title">{skill.name}</span>
        <button
          className={`entry-fav${skill.favorite ? ' active' : ''}`}
          onClick={onToggleFavorite}
          aria-label={skill.favorite ? 'Unfavorite' : 'Favorite'}
        >
          ★
        </button>
      </div>

      <div className="project-progress">
        <div className="budget-row-top">
          <span className="budget-cat">Progress</span>
          <span className="budget-amounts">{skill.progressPercent}%</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${skill.progressPercent}%` }} />
        </div>
      </div>

      {skill.roadmap.length > 0 && (
        <div className="task-checklist">
          {skill.roadmap.map((r) => (
            <label key={r.id} className="task-checklist-item">
              <input type="checkbox" checked={r.done} onChange={() => onToggleRoadmapItem(r.id)} />
              <span className={r.done ? 'task-done' : ''}>{r.title}</span>
            </label>
          ))}
        </div>
      )}

      {nextStep && <p className="project-next-milestone">Next: {nextStep.title}</p>}

      {skill.resources.length > 0 && (
        <div className="project-links">
          {skill.resources.map((res) => (
            <span key={res} className="project-link-badge">{res}</span>
          ))}
        </div>
      )}
    </div>
  );
}
