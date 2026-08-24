import { FormEvent, useMemo, useState } from 'react';
import { useCreateRoadmap, useCreateSkill, useSkillRoadmaps, useSkills } from '../hooks/useSkills';
import type { Skill, SkillDraft } from '../types/skill';

type SubTab = 'all' | 'in-progress' | 'roadmap' | 'achievement';
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

function RouteIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="5" cy="18" r="2.2" />
      <circle cx="19" cy="6" r="2.2" />
      <path d="M7 17c4-1 6-4 6-8s3-6 5-6" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4z" />
      <path d="M8 5H5a3 3 0 0 0 3 4M16 5h3a3 3 0 0 1-3 4" />
      <path d="M10 15h4M12 12v3M9 19h6l-1-2H10l-1 2z" />
    </svg>
  );
}

const SUB_TABS: { key: SubTab; label: string; icon: () => JSX.Element }[] = [
  { key: 'all', label: 'All skills', icon: GridIcon },
  { key: 'in-progress', label: 'In progress', icon: FlameIcon },
  { key: 'roadmap', label: 'Roadmap', icon: RouteIcon },
  { key: 'achievement', label: 'Achievement', icon: TrophyIcon },
];

interface SkillsListPageProps {
  onOpenSkill: (id: string) => void;
}

export function SkillsListPage({ onOpenSkill }: SkillsListPageProps) {
  const { data: skills, isLoading } = useSkills();
  const { data: roadmaps } = useSkillRoadmaps();
  const createSkill = useCreateSkill();

  const [subTab, setSubTab] = useState<SubTab>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortKey, setSortKey] = useState<SortKey>('updated');
  const [modalOpen, setModalOpen] = useState(false);

  const categories = useMemo(() => {
    const set = new Set((skills ?? []).map((s) => s.category));
    return ['All', ...Array.from(set)];
  }, [skills]);

  const filtered = useMemo(() => {
    let list = skills ?? [];
    if (subTab === 'in-progress') list = list.filter((s) => s.status === 'In Progress');
    if (subTab === 'achievement') list = list.filter((s) => s.status === 'Completed');
    if (categoryFilter !== 'All') list = list.filter((s) => s.category === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q)));
    }
    const sorted = [...list];
    if (sortKey === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortKey === 'progress') sorted.sort((a, b) => b.progressPercent - a.progressPercent);
    else sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return sorted;
  }, [skills, subTab, categoryFilter, search, sortKey]);

  return (
    <div>
      <div className="breadcrumb">
        <span className="breadcrumb-current">Skills</span>
      </div>
      <h1 className="page-title">Skills</h1>
      <p className="page-date">Learn. Practice. Master.</p>

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
          placeholder="Search skills or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="updated">Recently updated</option>
          <option value="name">Name (A–Z)</option>
          <option value="progress">Progress</option>
        </select>
        <button className="skills-add-btn" onClick={() => setModalOpen(true)}>+ Add skill</button>
      </div>

      {isLoading && <p className="muted-text">Loading skills…</p>}

      {subTab === 'roadmap' ? (
        <RoadmapView skills={filtered} roadmaps={roadmaps ?? []} onOpenSkill={onOpenSkill} />
      ) : (
        <div className="project-list">
          {filtered.map((skill) => (
            <SkillListCard key={skill.id} skill={skill} onOpen={() => onOpenSkill(skill.id)} />
          ))}
          {!isLoading && filtered.length === 0 && <p className="muted-text">No skills match these filters.</p>}
        </div>
      )}

      {modalOpen && (
        <AddSkillModal
          roadmapOptions={roadmaps ?? []}
          onClose={() => setModalOpen(false)}
          onSubmit={(draft) => {
            createSkill.mutate(draft);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SkillListCard({ skill, onOpen }: { skill: Skill; onOpen: () => void }) {
  const nextStep = skill.syllabus.find((s) => !s.done);
  return (
    <div className="project-card skill-card" onClick={onOpen}>
      <div className="task-card-top">
        <span className="project-card-title">{skill.name}</span>
        <span className="entry-type-badge">{skill.category}</span>
      </div>
      {skill.description && <p className="entry-desc">{skill.description}</p>}
      <div className="project-progress">
        <div className="budget-row-top">
          <span className="budget-cat">{skill.status}</span>
          <span className="budget-amounts">{skill.progressPercent}%</span>
        </div>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${skill.progressPercent}%` }} />
        </div>
      </div>
      {nextStep && <p className="project-next-milestone">Next: {nextStep.title}</p>}
    </div>
  );
}

function RoadmapView({
  skills,
  roadmaps,
  onOpenSkill,
}: {
  skills: Skill[];
  roadmaps: { id: string; name: string }[];
  onOpenSkill: (id: string) => void;
}) {
  const roadmapNames = useMemo(() => new Map(roadmaps.map((r) => [r.id, r.name])), [roadmaps]);

  const grouped = useMemo(() => {
    const withRoadmap = skills.filter((s) => s.roadmapId);
    const without = skills.filter((s) => !s.roadmapId);
    const byRoadmap = new Map<string, Skill[]>();
    for (const skill of withRoadmap) {
      const key = skill.roadmapId!;
      if (!byRoadmap.has(key)) byRoadmap.set(key, []);
      byRoadmap.get(key)!.push(skill);
    }
    return { byRoadmap, without };
  }, [skills]);

  return (
    <div className="kb-groups">
      {Array.from(grouped.byRoadmap.entries()).map(([roadmapId, roadmapSkills]) => (
        <div className="kb-folder" key={roadmapId}>
          <div className="kb-folder-label">{roadmapNames.get(roadmapId) ?? roadmapId}</div>
          <div className="project-list">
            {roadmapSkills.map((skill) => (
              <SkillListCard key={skill.id} skill={skill} onOpen={() => onOpenSkill(skill.id)} />
            ))}
          </div>
        </div>
      ))}
      {grouped.without.length > 0 && (
        <div className="kb-folder">
          <div className="kb-folder-label">No roadmap</div>
          <div className="project-list">
            {grouped.without.map((skill) => (
              <SkillListCard key={skill.id} skill={skill} onOpen={() => onOpenSkill(skill.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AddSkillModal({
  roadmapOptions,
  onClose,
  onSubmit,
}: {
  roadmapOptions: { id: string; name: string }[];
  onClose: () => void;
  onSubmit: (draft: SkillDraft) => void;
}) {
  const createRoadmap = useCreateRoadmap();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [roadmapId, setRoadmapId] = useState('');
  const [tags, setTags] = useState('');
  const [creatingRoadmap, setCreatingRoadmap] = useState(false);
  const [newRoadmapName, setNewRoadmapName] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      roadmapId: roadmapId || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
  }

  async function handleCreateRoadmap() {
    if (!newRoadmapName.trim()) return;
    const roadmap = await createRoadmap.mutateAsync({ name: newRoadmapName.trim(), description: '' });
    setRoadmapId(roadmap.id);
    setNewRoadmapName('');
    setCreatingRoadmap(false);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Add skill</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="skill-name">Name</label>
            <input id="skill-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="skill-description">Brief description (optional)</label>
            <textarea
              id="skill-description"
              rows={2}
              placeholder="What is this skill and why does it matter to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="skill-category">Category</label>
            <input
              id="skill-category"
              type="text"
              placeholder="Backend, Frontend, Mobile…"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="skill-roadmap">Roadmap (optional)</label>
            {!creatingRoadmap ? (
              <div className="roadmap-select-row">
                <select
                  id="skill-roadmap"
                  value={roadmapId}
                  onChange={(e) => setRoadmapId(e.target.value)}
                >
                  <option value="">None</option>
                  {roadmapOptions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <button type="button" className="roadmap-new-btn" onClick={() => setCreatingRoadmap(true)}>
                  + New
                </button>
              </div>
            ) : (
              <div className="roadmap-select-row">
                <input
                  type="text"
                  placeholder="New roadmap name…"
                  value={newRoadmapName}
                  onChange={(e) => setNewRoadmapName(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="roadmap-new-btn"
                  onClick={handleCreateRoadmap}
                  disabled={!newRoadmapName.trim() || createRoadmap.isPending}
                >
                  {createRoadmap.isPending ? 'Creating…' : 'Create'}
                </button>
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={() => {
                    setCreatingRoadmap(false);
                    setNewRoadmapName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            {roadmapId && !creatingRoadmap && (
              <p className="roadmap-selected-hint">
                Assigned to: {roadmapOptions.find((r) => r.id === roadmapId)?.name}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="skill-tags">Tags (comma separated)</label>
            <input id="skill-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>
          <div className="modal-actions">
            <button type="button" className="modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="auth-submit">Add skill</button>
          </div>
        </form>
      </div>
    </div>
  );
}
