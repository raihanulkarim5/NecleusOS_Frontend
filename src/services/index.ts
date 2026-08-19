import { mockAuthService } from './mockAuthService';
import { mockDashboardService } from './mockDashboardService';
import { mockEntryService } from './mockEntryService';
import { mockTaskService } from './mockTaskService';
import { mockJournalService } from './mockJournalService';
import { mockFinanceService } from './mockFinanceService';
import { mockProjectService } from './mockProjectService';
import { mockInboxService } from './mockInboxService';
import { mockSkillService } from './mockSkillService';
import { mockKnowledgeService } from './mockKnowledgeService';
import type { AuthService } from './authService';
import type { DashboardService } from './dashboardService';
import type { EntryService } from './entryService';
import type { TaskService } from './taskService';
import type { JournalService } from './journalService';
import type { FinanceService } from './financeService';
import type { ProjectService } from './projectService';
import type { InboxService } from './inboxService';
import type { SkillService } from './skillService';
import type { KnowledgeService } from './knowledgeService';

// Swap these single lines to the api* implementation once the .NET Core API
// exists. No component or hook needs to change when that day comes.
export const authService: AuthService = mockAuthService;
export const dashboardService: DashboardService = mockDashboardService;
export const entryService: EntryService = mockEntryService;
export const taskService: TaskService = mockTaskService;
export const journalService: JournalService = mockJournalService;
export const financeService: FinanceService = mockFinanceService;
export const projectService: ProjectService = mockProjectService;
export const inboxService: InboxService = mockInboxService;
export const skillService: SkillService = mockSkillService;
export const knowledgeService: KnowledgeService = mockKnowledgeService;
