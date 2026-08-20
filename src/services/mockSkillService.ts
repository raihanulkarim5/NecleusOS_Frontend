import type { SkillService } from './skillService';
import type { Skill, SkillDraft, SkillRoadmap } from '../types/skill';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

function computeProgress(syllabus: { done: boolean }[]): number {
  if (syllabus.length === 0) return 0;
  return Math.round((syllabus.filter((s) => s.done).length / syllabus.length) * 100);
}

function statusFromProgress(pct: number): Skill['status'] {
  if (pct === 0) return 'Not Started';
  if (pct === 100) return 'Completed';
  return 'In Progress';
}

const roadmaps: SkillRoadmap[] = [
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
    category: 'Backend',
    status: 'In Progress',
    progressPercent: 80,
    roadmapId: 'rm1',
    syllabus: [
      { id: 'r1', title: 'Web API fundamentals', done: true },
      { id: 'r2', title: 'EF Core + SQL Server', done: true },
      { id: 'r3', title: 'Auth (Identity/JWT)', done: true },
      { id: 'r4', title: 'Middleware pipeline', done: false },
    ],
    resources: [
      { id: 'res1', title: 'Official ASP.NET Core docs', url: 'https://learn.microsoft.com/aspnet/core', type: 'Link' },
      { id: 'res2', title: 'EF Core in Action (PDF)', url: '#', type: 'PDF' },
    ],
    courses: [{ id: 'c1', title: 'ASP.NET Core Web API Masterclass', provider: 'Udemy', url: '#' }],
    videos: [{ id: 'v1', title: 'Middleware pipeline explained', url: '#' }],
    practiceTasks: [{ type: 'task', id: 'tk1', title: 'Build Task module UI' }],
    notes: 'Middleware order matters more than I expected — auth has to come before authorization, obviously, but logging placement changes what gets captured too.',
    projects: [{ type: 'project', id: 'p1', title: 'Personal OS' }],
    milestones: [
      { id: 'ms1', title: 'Ship first production API endpoint', done: false },
    ],
    tags: ['backend'],
    favorite: true,
    createdAt: '2026-05-01',
    updatedAt: '2026-08-15',
  },
  {
    id: 's2',
    name: 'React + TypeScript',
    category: 'Frontend',
    status: 'In Progress',
    progressPercent: 60,
    roadmapId: 'rm2',
    syllabus: [
      { id: 'r5', title: 'Hooks and component patterns', done: true },
      { id: 'r6', title: 'TanStack Query', done: true },
      { id: 'r7', title: 'Testing (RTL)', done: false },
    ],
    resources: [{ id: 'res3', title: 'React docs (beta)', url: 'https://react.dev', type: 'Link' }],
    courses: [{ id: 'c2', title: 'React + TypeScript: The Complete Guide', provider: 'Frontend Masters', url: '#' }],
    videos: [{ id: 'v2', title: 'TanStack Query crash course', url: '#' }],
    practiceTasks: [{ type: 'task', id: 'tk2', title: 'Design Finance module schema' }],
    notes: 'The service-abstraction pattern (interface + mock + real) is doing a lot of work — worth reusing outside Personal OS too.',
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
    category: 'Mobile',
    status: 'Not Started',
    progressPercent: 0,
    roadmapId: null,
    syllabus: [{ id: 'r8', title: 'Dart basics', done: false }],
    resources: [{ id: 'res4', title: 'Flutter docs', url: 'https://docs.flutter.dev', type: 'Link' }],
    courses: [{ id: 'c3', title: 'Flutter & Dart: The Complete Guide', provider: 'Udemy', url: '#' }],
    videos: [],
    practiceTasks: [],
    notes: 'Parked until the Personal OS API exists — Flutter will consume the same endpoints as the web app.',
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
    category: 'Backend',
    status: 'Completed',
    progressPercent: 100,
    roadmapId: 'rm1',
    syllabus: [
      { id: 'r9', title: 'Execution plans', done: true },
      { id: 'r10', title: 'Indexing strategy', done: true },
    ],
    resources: [{ id: 'res5', title: 'SQL Server execution plans (PDF)', url: '#', type: 'PDF' }],
    courses: [],
    videos: [{ id: 'v3', title: 'Reading execution plans', url: '#' }],
    practiceTasks: [{ type: 'task', id: 'tk5', title: 'Fix Bug #142 in Crystal Report export' }],
    notes: 'Learned most of this on the job fixing Crystal Report query timeouts.',
    projects: [{ type: 'project', id: 'p2', title: 'ERP System' }],
    milestones: [{ id: 'ms2', title: 'Cut report query time by 50%', done: true }],
    tags: ['sql'],
    favorite: false,
    createdAt: '2026-02-01',
    updatedAt: '2026-06-01',
  },
];

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

  async toggleSyllabusItem(skillId: string, itemId: string): Promise<Skill> {
    await delay(200);
    skills = skills.map((s) => {
      if (s.id !== skillId) return s;
      const syllabus = s.syllabus.map((item) => (item.id === itemId ? { ...item, done: !item.done } : item));
      const progressPercent = computeProgress(syllabus);
      return { ...s, syllabus, progressPercent, status: statusFromProgress(progressPercent), updatedAt: today() };
    });
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async addSyllabusItem(skillId: string, title: string): Promise<Skill> {
    await delay(250);
    skills = skills.map((s) => {
      if (s.id !== skillId) return s;
      const syllabus = [...s.syllabus, { id: `sy${Date.now()}`, title, done: false }];
      const progressPercent = computeProgress(syllabus);
      return { ...s, syllabus, progressPercent, status: statusFromProgress(progressPercent), updatedAt: today() };
    });
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async toggleMilestone(skillId: string, milestoneId: string): Promise<Skill> {
    await delay(200);
    skills = skills.map((s) => {
      if (s.id !== skillId) return s;
      const milestones = s.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
      return { ...s, milestones, updatedAt: today() };
    });
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async addMilestone(skillId: string, title: string): Promise<Skill> {
    await delay(250);
    skills = skills.map((s) =>
      s.id === skillId
        ? { ...s, milestones: [...s.milestones, { id: `ms${Date.now()}`, title, done: false }], updatedAt: today() }
        : s,
    );
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async addResource(skillId: string, title: string, url: string, type: 'Link' | 'PDF'): Promise<Skill> {
    await delay(250);
    skills = skills.map((s) =>
      s.id === skillId
        ? { ...s, resources: [...s.resources, { id: `res${Date.now()}`, title, url, type }], updatedAt: today() }
        : s,
    );
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async addCourse(skillId: string, title: string, provider: string, url: string): Promise<Skill> {
    await delay(250);
    skills = skills.map((s) =>
      s.id === skillId
        ? { ...s, courses: [...s.courses, { id: `c${Date.now()}`, title, provider, url }], updatedAt: today() }
        : s,
    );
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async addVideo(skillId: string, title: string, url: string): Promise<Skill> {
    await delay(250);
    skills = skills.map((s) =>
      s.id === skillId
        ? { ...s, videos: [...s.videos, { id: `v${Date.now()}`, title, url }], updatedAt: today() }
        : s,
    );
    const updated = skills.find((s) => s.id === skillId);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },

  async addPracticeTask(skillId: string, taskId: string, taskTitle: string): Promise<Skill> {
    await delay(250);
    skills = skills.map((s) =>
      s.id === skillId
        ? { ...s, practiceTasks: [...s.practiceTasks, { type: 'task', id: taskId, title: taskTitle }], updatedAt: today() }
        : s,
    );
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

  async updateNotes(id: string, notes: string): Promise<Skill> {
    await delay(250);
    skills = skills.map((s) => (s.id === id ? { ...s, notes, updatedAt: today() } : s));
    const updated = skills.find((s) => s.id === id);
    if (!updated) throw new Error('Skill not found');
    return updated;
  },
};
