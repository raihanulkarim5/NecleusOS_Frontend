import type { SkillService } from './skillService';
import type { Skill, SkillDraft } from '../types/skill';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

function computeProgress(roadmap: { done: boolean }[]): number {
  if (roadmap.length === 0) return 0;
  return Math.round((roadmap.filter((r) => r.done).length / roadmap.length) * 100);
}

let skills: Skill[] = [
  {
    id: 's1',
    name: 'ASP.NET Core',
    progressPercent: 80,
    roadmap: [
      { id: 'r1', title: 'Web API fundamentals', done: true },
      { id: 'r2', title: 'EF Core + SQL Server', done: true },
      { id: 'r3', title: 'Auth (Identity/JWT)', done: true },
      { id: 'r4', title: 'Middleware pipeline', done: false },
    ],
    resources: ['Official docs', 'EF Core in Action'],
    tags: ['backend'],
    favorite: true,
    createdAt: '2026-05-01',
    updatedAt: '2026-08-15',
  },
  {
    id: 's2',
    name: 'React + TypeScript',
    progressPercent: 60,
    roadmap: [
      { id: 'r5', title: 'Hooks and component patterns', done: true },
      { id: 'r6', title: 'TanStack Query', done: true },
      { id: 'r7', title: 'Testing (RTL)', done: false },
    ],
    resources: ['React docs (beta)', 'TanStack Query docs'],
    tags: ['frontend'],
    favorite: false,
    createdAt: '2026-07-15',
    updatedAt: '2026-08-17',
  },
  {
    id: 's3',
    name: 'Flutter',
    progressPercent: 0,
    roadmap: [{ id: 'r8', title: 'Dart basics', done: false }],
    resources: [],
    tags: ['mobile', 'later'],
    favorite: false,
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16',
  },
];

export const mockSkillService: SkillService = {
  async getSkills(): Promise<Skill[]> {
    await delay(400);
    return [...skills].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async createSkill(draft: SkillDraft): Promise<Skill> {
    await delay(400);
    const now = today();
    const skill: Skill = { id: `s${Date.now()}`, ...draft, progressPercent: 0, roadmap: [], resources: [], favorite: false, createdAt: now, updatedAt: now };
    skills = [skill, ...skills];
    return skill;
  },

  async toggleRoadmapItem(skillId: string, itemId: string): Promise<Skill> {
    await delay(200);
    skills = skills.map((s) => {
      if (s.id !== skillId) return s;
      const roadmap = s.roadmap.map((r) => (r.id === itemId ? { ...r, done: !r.done } : r));
      return { ...s, roadmap, progressPercent: computeProgress(roadmap), updatedAt: today() };
    });
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async toggleFavorite(id: string): Promise<Skill> {
    await delay(200);
    skills = skills.map((s) => (s.id === id ? { ...s, favorite: !s.favorite } : s));
    const updated = skills.find((s) => s.id === id);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },
};
