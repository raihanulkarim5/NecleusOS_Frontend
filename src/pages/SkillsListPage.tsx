import { FormEvent, useMemo, useState } from 'react';
import { useCreateSkill, useSkillRoadmaps, useSkills } from '../hooks/useSkills';
import type { Skill, SkillDraft } from '../types/skill';

type SubTab = 'all' | 'in-progress' | 'roadmap' | 'achievement';
type SortKey = 'updated' | 'name' | 'progress';

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'all', label: 'All skills' },
  { key: 'in-progress', label: 'In progress' },
  { key: 'roadmap', label: 'Roadmap' },
  { key: 'achievement', label: 'Achievement' },
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
        {SUB_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`sub-tab${subTab === tab.key ? ' active' : ''}`}
            onClick={() => setSubTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
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
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [roadmapId, setRoadmapId] = useState('');
  const [tags, setTags] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      category: category.trim() || 'General',
      roadmapId: roadmapId || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
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
            <select id="skill-roadmap" value={roadmapId} onChange={(e) => setRoadmapId(e.target.value)}>
              <option value="">None</option>
              {roadmapOptions.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
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
