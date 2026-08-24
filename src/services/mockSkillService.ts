import type { SkillService } from './skillService';
import type { LinkRef } from '../types/link';
import type { RoadmapDraft, Skill, SkillDraft, SkillRoadmap } from '../types/skill';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

// Progress is driven by BOTH the syllabus and the milestones together —
// completing either moves the needle, since a milestone can represent a
// bigger checkpoint than any single syllabus step.
function recompute(skill: Skill): Skill {
  const totalItems = skill.syllabus.length + skill.milestones.length;
  const doneItems = skill.syllabus.filter((s) => s.done).length + skill.milestones.filter((m) => m.done).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
  const status: Skill['status'] =
    progressPercent === 0 ? 'Not Started' : progressPercent === 100 ? 'Completed' : 'In Progress';
  return { ...skill, progressPercent, status, updatedAt: today() };
}

let roadmaps: SkillRoadmap[] = [
  {
    id: 'rm1',
    name: 'Backend developer path',
    description: 'Server-side fundamentals through to a production-ready .NET API.',
    skillIds: ['s1', 's4'],
    createdAt: '2026-05-01',
    updatedAt: '2026-08-15',
  },
  {
    id: 'rm2',
    name: 'Frontend developer path',
    description: 'React, TypeScript, and the tooling around a modern SPA.',
    skillIds: ['s2'],
    createdAt: '2026-07-01',
    updatedAt: '2026-08-17',
  },
];

let skills: Skill[] = [
  {
    id: 's1',
    name: 'ASP.NET Core',
    description: 'Building the REST API layer for Personal OS — routing, EF Core, auth, and the middleware pipeline.',
    category: 'Backend',
    status: 'In Progress',
    progressPercent: 80,
    roadmapId: 'rm1',
    syllabus: [
      { id: 'r1', title: 'Web API fundamentals', done: true, projectRef: null },
      { id: 'r2', title: 'EF Core + SQL Server', done: true, projectRef: null },
      { id: 'r3', title: 'Auth (Identity/JWT)', done: true, projectRef: { type: 'project', id: 'p1', title: 'Personal OS' } },
      { id: 'r4', title: 'Middleware pipeline', done: false, projectRef: null },
    ],
    resources: [
      { id: 'res1', title: 'Official ASP.NET Core docs', url: 'https://learn.microsoft.com/aspnet/core', type: 'Link', isUpload: false },
      { id: 'res2', title: 'EF Core in Action (PDF)', url: '#', type: 'PDF', isUpload: false },
    ],
    courses: [{ id: 'c1', title: 'ASP.NET Core Web API Masterclass', provider: 'Udemy', url: 'https://udemy.com' }],
    videos: [{ id: 'v1', title: 'Middleware pipeline explained', url: 'https://youtube.com' }],
    practiceTasks: [{ type: 'task', id: 'tk1', title: 'Build Task module UI' }],
    notes: '<p>Middleware order matters more than I expected — auth has to come before authorization, but logging placement changes what gets captured too.</p>',
    projects: [{ type: 'project', id: 'p1', title: 'Personal OS' }],
    milestones: [
      { id: 'ms1', title: 'Ship first production API endpoint', done: false, projectRef: { type: 'project', id: 'p1', title: 'Personal OS' } },
    ],
    tags: ['backend'],
    favorite: true,
    createdAt: '2026-05-01',
    updatedAt: '2026-08-15',
  },
  {
    id: 's2',
    name: 'React + TypeScript',
    description: 'The frontend stack for Personal OS — components, hooks, and the mock-to-API service pattern.',
    category: 'Frontend',
    status: 'In Progress',
    progressPercent: 60,
    roadmapId: 'rm2',
    syllabus: [
      { id: 'r5', title: 'Hooks and component patterns', done: true, projectRef: null },
      { id: 'r6', title: 'TanStack Query', done: true, projectRef: null },
      { id: 'r7', title: 'Testing (RTL)', done: false, projectRef: null },
    ],
    resources: [{ id: 'res3', title: 'React docs (beta)', url: 'https://react.dev', type: 'Link', isUpload: false }],
    courses: [{ id: 'c2', title: 'React + TypeScript: The Complete Guide', provider: 'Frontend Masters', url: 'https://frontendmasters.com' }],
    videos: [{ id: 'v2', title: 'TanStack Query crash course', url: 'https://youtube.com' }],
    practiceTasks: [{ type: 'task', id: 'tk2', title: 'Design Finance module schema' }],
    notes: '<p>The service-abstraction pattern (interface + mock + real) is doing a lot of work — worth reusing outside Personal OS too.</p>',
    projects: [{ type: 'project', id: 'p1', title: 'Personal OS' }],
    milestones: [],
    tags: ['frontend'],
    favorite: false,
    createdAt: '2026-07-15',
    updatedAt: '2026-08-17',
  },
  {
    id: 's3',
    name: 'Flutter',
    description: 'Parked until the Personal OS API exists — will consume the same endpoints as the web app.',
    category: 'Mobile',
    status: 'Not Started',
    progressPercent: 0,
    roadmapId: null,
    syllabus: [{ id: 'r8', title: 'Dart basics', done: false, projectRef: null }],
    resources: [{ id: 'res4', title: 'Flutter docs', url: 'https://docs.flutter.dev', type: 'Link', isUpload: false }],
    courses: [{ id: 'c3', title: 'Flutter & Dart: The Complete Guide', provider: 'Udemy', url: 'https://udemy.com' }],
    videos: [],
    practiceTasks: [],
    notes: '',
    projects: [],
    milestones: [],
    tags: ['mobile', 'later'],
    favorite: false,
    createdAt: '2026-08-16',
    updatedAt: '2026-08-16',
  },
  {
    id: 's4',
    name: 'SQL Server performance tuning',
    description: 'Query optimization skills sharpened while fixing slow Crystal Reports at work.',
    category: 'Backend',
    status: 'Completed',
    progressPercent: 100,
    roadmapId: 'rm1',
    syllabus: [
      { id: 'r9', title: 'Execution plans', done: true, projectRef: null },
      { id: 'r10', title: 'Indexing strategy', done: true, projectRef: null },
    ],
    resources: [{ id: 'res5', title: 'SQL Server execution plans (PDF)', url: '#', type: 'PDF', isUpload: false }],
    courses: [],
    videos: [{ id: 'v3', title: 'Reading execution plans', url: 'https://youtube.com' }],
    practiceTasks: [{ type: 'task', id: 'tk5', title: 'Fix Bug #142 in Crystal Report export' }],
    notes: '<p>Learned most of this on the job fixing Crystal Report query timeouts.</p>',
    projects: [{ type: 'project', id: 'p2', title: 'ERP System' }],
    milestones: [{ id: 'ms2', title: 'Cut report query time by 50%', done: true, projectRef: { type: 'project', id: 'p2', title: 'ERP System' } }],
    tags: ['sql'],
    favorite: false,
    createdAt: '2026-02-01',
    updatedAt: '2026-06-01',
  },
];

function updateSkill(id: string, updater: (s: Skill) => Skill): Skill {
  skills = skills.map((s) => (s.id === id ? updater(s) : s));
  const updated = skills.find((s) => s.id === id);
  if (!updated) throw new Error('Skill not found');
  return updated;
}

export const mockSkillService: SkillService = {
  async getSkills(): Promise<Skill[]> {
    await delay(400);
    return [...skills].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getSkill(id: string): Promise<Skill | null> {
    await delay(250);
    return skills.find((s) => s.id === id) ?? null;
  },

  async getRoadmaps(): Promise<SkillRoadmap[]> {
    await delay(300);
    return roadmaps;
  },

  async createRoadmap(draft: RoadmapDraft): Promise<SkillRoadmap> {
    await delay(300);
    const now = today();
    const roadmap: SkillRoadmap = { id: `rm${Date.now()}`, ...draft, skillIds: [], createdAt: now, updatedAt: now };
    roadmaps = [...roadmaps, roadmap];
    return roadmap;
  },

  async createSkill(draft: SkillDraft): Promise<Skill> {
    await delay(400);
    const now = today();
    const skill: Skill = {
      id: `s${Date.now()}`,
      ...draft,
      status: 'Not Started',
      progressPercent: 0,
      syllabus: [],
      resources: [],
      courses: [],
      videos: [],
      practiceTasks: [],
      notes: '',
      projects: [],
      milestones: [],
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    skills = [skill, ...skills];
    if (draft.roadmapId) {
      const roadmap = roadmaps.find((r) => r.id === draft.roadmapId);
      if (roadmap) roadmap.skillIds.push(skill.id);
    }
    return skill;
  },

  async updateDescription(id: string, description: string): Promise<Skill> {
    await delay(250);
    return updateSkill(id, (s) => ({ ...s, description, updatedAt: today() }));
  },

  async toggleSyllabusItem(skillId: string, itemId: string): Promise<Skill> {
    await delay(200);
    return updateSkill(skillId, (s) =>
      recompute({ ...s, syllabus: s.syllabus.map((i) => (i.id === itemId ? { ...i, done: !i.done } : i)) }),
    );
  },

  async addSyllabusItem(skillId: string, title: string): Promise<Skill> {
    await delay(250);
    return updateSkill(skillId, (s) =>
      recompute({ ...s, syllabus: [...s.syllabus, { id: `sy${Date.now()}`, title, done: false, projectRef: null }] }),
    );
  },

  async setSyllabusItemProject(skillId: string, itemId: string, projectRef: LinkRef | null): Promise<Skill> {
    await delay(200);
    return updateSkill(skillId, (s) => ({
      ...s,
      syllabus: s.syllabus.map((i) => (i.id === itemId ? { ...i, projectRef } : i)),
      updatedAt: today(),
    }));
  },

  async toggleMilestone(skillId: string, milestoneId: string): Promise<Skill> {
    await delay(200);
    return updateSkill(skillId, (s) =>
      recompute({ ...s, milestones: s.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m)) }),
    );
  },

  async addMilestone(skillId: string, title: string): Promise<Skill> {
    await delay(250);
    return updateSkill(skillId, (s) =>
      recompute({ ...s, milestones: [...s.milestones, { id: `ms${Date.now()}`, title, done: false, projectRef: null }] }),
    );
  },

  async setMilestoneProject(skillId: string, milestoneId: string, projectRef: LinkRef | null): Promise<Skill> {
    await delay(200);
    return updateSkill(skillId, (s) => ({
      ...s,
      milestones: s.milestones.map((m) => (m.id === milestoneId ? { ...m, projectRef } : m)),
      updatedAt: today(),
    }));
  },

  async addResource(skillId: string, title: string, url: string, type: 'Link' | 'PDF', isUpload: boolean): Promise<Skill> {
    await delay(250);
    return updateSkill(skillId, (s) => ({
      ...s,
      resources: [...s.resources, { id: `res${Date.now()}`, title, url, type, isUpload }],
      updatedAt: today(),
    }));
  },

  async addCourse(skillId: string, title: string, provider: string, url: string): Promise<Skill> {
    await delay(250);
    return updateSkill(skillId, (s) => ({
      ...s,
      courses: [...s.courses, { id: `c${Date.now()}`, title, provider, url }],
      updatedAt: today(),
    }));
  },

  async addVideo(skillId: string, title: string, url: string): Promise<Skill> {
    await delay(250);
    return updateSkill(skillId, (s) => ({
      ...s,
      videos: [...s.videos, { id: `v${Date.now()}`, title, url }],
      updatedAt: today(),
    }));
  },

  async addPracticeTask(skillId: string, taskId: string, taskTitle: string): Promise<Skill> {
    await delay(250);
    return updateSkill(skillId, (s) => ({
      ...s,
      practiceTasks: [...s.practiceTasks, { type: 'task', id: taskId, title: taskTitle }],
      updatedAt: today(),
    }));
  },

  async linkProject(skillId: string, projectRef: LinkRef): Promise<Skill> {
    await delay(250);
    return updateSkill(skillId, (s) => ({ ...s, projects: [...s.projects, projectRef], updatedAt: today() }));
  },

  async unlinkProject(skillId: string, projectId: string): Promise<Skill> {
    await delay(200);
    return updateSkill(skillId, (s) => ({
      ...s,
      projects: s.projects.filter((p) => p.id !== projectId),
      updatedAt: today(),
    }));
  },

  async toggleFavorite(id: string): Promise<Skill> {
    await delay(200);
    return updateSkill(id, (s) => ({ ...s, favorite: !s.favorite }));
  },

  async updateNotes(id: string, notes: string): Promise<Skill> {
    await delay(250);
    return updateSkill(id, (s) => ({ ...s, notes, updatedAt: today() }));
  },
};
