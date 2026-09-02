import type { ProjectService } from './projectService';
import type { LinkRef } from '../types/link';
import type { Project, ProjectDraft, ProjectLinkCategory, ProjectStatus } from '../types/project';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const today = () => new Date().toISOString().slice(0, 10);

function computeProgress(milestones: { done: boolean }[]): number {
  if (milestones.length === 0) return 0;
  return Math.round((milestones.filter((m) => m.done).length / milestones.length) * 100);
}

function moveInArray<T>(arr: T[], index: number, direction: 'up' | 'down'): T[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= arr.length) return arr;
  const next = [...arr];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}

let projects: Project[] = [
  {
    id: 'p1',
    name: 'Personal OS',
    description: 'React frontend, .NET Core API, SQL Server — module by module against dummy data first.',
    status: 'Active',
    progressPercent: 60,
    isTemplate: false,
    milestones: [
      { id: 'm1', title: 'Auth + Dashboard shell', done: true , tasks: [] },
      { id: 'm2', title: 'Entries, Tasks, Journal, Finance', done: true , tasks: [{ type: 'task', id: 'tk1', title: 'Build Task module UI' }] },
      { id: 'm3', title: 'Projects, Skills, Knowledge Base', done: false , tasks: [] },
      { id: 'm4', title: '.NET Core API + real auth', done: false , tasks: [] },
      { id: 'm5', title: 'Flutter mobile', done: false , tasks: [] },
    ],
    tasks: [{ type: 'task', id: 'tk1', title: 'Build Task module UI' }],
    decisions: [{ type: 'entry', id: 'e3', title: 'Should Entries be the base type for Tasks too?' }],
    problems: [{ type: 'entry', id: 'e5', title: 'Bootstrap-only styling might clash with the galaxy theme' }],
    journalEntries: [{ type: 'journal', id: 'j3', title: 'Reviewed the Entries vs. module-specific decision' }],
    resources: [{ id: 'res1', title: 'Vite Codespaces port-forwarding docs', url: 'https://vitejs.dev' }],
    files: [],
    notes: '<p>Module order so far has followed daily-use frequency more than architectural dependency — worked out fine.</p>',
    tags: ['flagship'],
    favorite: true,
    createdAt: '2026-07-20',
    updatedAt: today(),
  },
  {
    id: 'p2',
    name: 'ERP System',
    description: 'GrsSimp — internal ERP with Crystal Reports and Razor Pages.',
    status: 'Active',
    progressPercent: 80,
    isTemplate: false,
    milestones: [
      { id: 'm6', title: 'Core modules', done: true , tasks: [] },
      { id: 'm7', title: 'Reporting layer', done: true , tasks: [] },
      { id: 'm8', title: 'Middleware refactor', done: false , tasks: [] },
    ],
    tasks: [{ type: 'task', id: 'tk5', title: 'Fix Bug #142 in Crystal Report export' }],
    decisions: [],
    problems: [],
    journalEntries: [],
    resources: [],
    files: [],
    notes: '',
    tags: ['work'],
    favorite: false,
    createdAt: '2025-11-01',
    updatedAt: '2026-08-14',
  },
  {
    id: 'p3',
    name: 'AI Assistant',
    description: 'Exploring an optional AI plug-in layer for Personal OS — bring-your-own API key.',
    status: 'Active',
    progressPercent: 10,
    isTemplate: false,
    milestones: [{ id: 'm9', title: 'Scope the plug-in interface', done: false , tasks: [] }],
    tasks: [],
    decisions: [],
    problems: [],
    journalEntries: [],
    resources: [],
    files: [],
    notes: '',
    tags: ['research'],
    favorite: false,
    createdAt: '2026-08-05',
    updatedAt: '2026-08-05',
  },
  {
    id: 'p4',
    name: 'New Module Kickoff',
    description: 'Standard milestone skeleton for starting any new Personal OS module.',
    status: 'Active',
    progressPercent: 0,
    isTemplate: true,
    milestones: [
      { id: 'm10', title: 'Design types + mock service', done: false , tasks: [] },
      { id: 'm11', title: 'Build list + detail pages', done: false , tasks: [] },
      { id: 'm12', title: 'Wire into nav + App.tsx', done: false , tasks: [] },
      { id: 'm13', title: 'Ship and push', done: false , tasks: [] },
    ],
    tasks: [],
    decisions: [],
    problems: [],
    journalEntries: [],
    resources: [],
    files: [],
    notes: '',
    tags: ['template'],
    favorite: false,
    createdAt: '2026-08-20',
    updatedAt: '2026-08-20',
  },
];

function updateProject(id: string, updater: (p: Project) => Project): Project {
  projects = projects.map((p) => (p.id === id ? updater(p) : p));
  const updated = projects.find((p) => p.id === id);
  if (!updated) throw new Error('Project not found');
  return updated;
}

const CATEGORY_FIELD: Record<ProjectLinkCategory, keyof Project> = {
  tasks: 'tasks',
  decisions: 'decisions',
  problems: 'problems',
  journal: 'journalEntries',
};

function linkArrayFor(project: Project, category: ProjectLinkCategory): LinkRef[] {
  return project[CATEGORY_FIELD[category]] as LinkRef[];
}

function withLinkArray(project: Project, category: ProjectLinkCategory, next: LinkRef[]): Project {
  return { ...project, [CATEGORY_FIELD[category]]: next };
}

export const mockProjectService: ProjectService = {
  async getProjects(): Promise<Project[]> {
    await delay(400);
    return [...projects].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async getProject(id: string): Promise<Project | null> {
    await delay(250);
    return projects.find((p) => p.id === id) ?? null;
  },

  async createProject(draft: ProjectDraft): Promise<Project> {
    await delay(400);
    const now = today();
    const project: Project = {
      id: `p${Date.now()}`,
      name: draft.name,
      description: draft.description,
      tags: draft.tags,
      isTemplate: draft.isTemplate ?? false,
      status: 'Active',
      progressPercent: 0,
      milestones: [],
      tasks: [],
      decisions: [],
      problems: [],
      journalEntries: [],
      resources: [],
      files: [],
      notes: '',
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    projects = [project, ...projects];
    return project;
  },

  async createFromTemplate(templateId: string, name: string): Promise<Project> {
    await delay(400);
    const template = projects.find((p) => p.id === templateId);
    if (!template) throw new Error('Template not found');
    const now = today();
    const project: Project = {
      ...template,
      id: `p${Date.now()}`,
      name,
      isTemplate: false,
      status: 'Active',
      milestones: template.milestones.map((m, i) => ({ ...m, id: `m${Date.now()}-${i}`, done: false, tasks: [] })),
      progressPercent: 0,
      tasks: [],
      decisions: [],
      problems: [],
      journalEntries: [],
      resources: [],
      files: [],
      notes: '',
      favorite: false,
      createdAt: now,
      updatedAt: now,
    };
    projects = [project, ...projects];
    return project;
  },

  async updateBasicInfo(
    id: string,
    info: { name: string; description: string; status: ProjectStatus; tags: string[] },
  ): Promise<Project> {
    await delay(250);
    return updateProject(id, (p) => ({ ...p, ...info, updatedAt: today() }));
  },

  async toggleTemplate(id: string): Promise<Project> {
    await delay(200);
    return updateProject(id, (p) => ({ ...p, isTemplate: !p.isTemplate, updatedAt: today() }));
  },

  async toggleFavorite(id: string): Promise<Project> {
    await delay(200);
    return updateProject(id, (p) => ({ ...p, favorite: !p.favorite }));
  },

  async toggleMilestone(projectId: string, milestoneId: string): Promise<Project> {
    await delay(200);
    return updateProject(projectId, (p) => {
      const milestones = p.milestones.map((m) => (m.id === milestoneId ? { ...m, done: !m.done } : m));
      return { ...p, milestones, progressPercent: computeProgress(milestones), updatedAt: today() };
    });
  },

  async addMilestone(projectId: string, title: string): Promise<Project> {
    await delay(250);
    return updateProject(projectId, (p) => {
      const milestones = [...p.milestones, { id: `m${Date.now()}`, title, done: false, tasks: [] }];
      return { ...p, milestones, progressPercent: computeProgress(milestones), updatedAt: today() };
    });
  },

  async removeMilestone(projectId: string, milestoneId: string): Promise<Project> {
    await delay(200);
    return updateProject(projectId, (p) => {
      const milestones = p.milestones.filter((m) => m.id !== milestoneId);
      return { ...p, milestones, progressPercent: computeProgress(milestones), updatedAt: today() };
    });
  },

  async moveMilestone(projectId: string, milestoneId: string, direction: 'up' | 'down'): Promise<Project> {
    await delay(150);
    return updateProject(projectId, (p) => {
      const index = p.milestones.findIndex((m) => m.id === milestoneId);
      return { ...p, milestones: moveInArray(p.milestones, index, direction), updatedAt: today() };
    });
  },

  async addMilestoneTask(projectId: string, milestoneId: string, taskId: string, taskTitle: string): Promise<Project> {
    await delay(250);
    return updateProject(projectId, (p) => ({
      ...p,
      milestones: p.milestones.map((m) =>
        m.id === milestoneId ? { ...m, tasks: [...m.tasks, { type: 'task', id: taskId, title: taskTitle }] } : m,
      ),
      updatedAt: today(),
    }));
  },

  async removeMilestoneTask(projectId: string, milestoneId: string, taskId: string): Promise<Project> {
    await delay(200);
    return updateProject(projectId, (p) => ({
      ...p,
      milestones: p.milestones.map((m) =>
        m.id === milestoneId ? { ...m, tasks: m.tasks.filter((t) => t.id !== taskId) } : m,
      ),
      updatedAt: today(),
    }));
  },

  async addLinkedItem(projectId: string, category: ProjectLinkCategory, ref: LinkRef): Promise<Project> {
    await delay(250);
    return updateProject(projectId, (p) => ({
      ...withLinkArray(p, category, [...linkArrayFor(p, category), ref]),
      updatedAt: today(),
    }));
  },

  async removeLinkedItem(projectId: string, category: ProjectLinkCategory, refId: string): Promise<Project> {
    await delay(200);
    return updateProject(projectId, (p) => ({
      ...withLinkArray(p, category, linkArrayFor(p, category).filter((r) => r.id !== refId)),
      updatedAt: today(),
    }));
  },

  async addResource(projectId: string, title: string, url: string): Promise<Project> {
    await delay(250);
    return updateProject(projectId, (p) => ({
      ...p,
      resources: [...p.resources, { id: `res${Date.now()}`, title, url }],
      updatedAt: today(),
    }));
  },

  async removeResource(projectId: string, resourceId: string): Promise<Project> {
    await delay(200);
    return updateProject(projectId, (p) => ({
      ...p,
      resources: p.resources.filter((r) => r.id !== resourceId),
      updatedAt: today(),
    }));
  },

  async addFile(projectId: string, title: string, url: string): Promise<Project> {
    await delay(250);
    return updateProject(projectId, (p) => ({
      ...p,
      files: [...p.files, { id: `file${Date.now()}`, title, url, uploadedAt: today() }],
      updatedAt: today(),
    }));
  },

  async removeFile(projectId: string, fileId: string): Promise<Project> {
    await delay(200);
    return updateProject(projectId, (p) => ({
      ...p,
      files: p.files.filter((f) => f.id !== fileId),
      updatedAt: today(),
    }));
  },

  async updateNotes(projectId: string, notes: string): Promise<Project> {
    await delay(250);
    return updateProject(projectId, (p) => ({ ...p, notes, updatedAt: today() }));
  },
};
