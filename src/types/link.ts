// Every module (Entries, Task, Journal, Project, Skill, Knowledge...) has
// its own concrete type and table, but they all stay connected through
// this shared, cross-cutting Link concept — this is what the "Everything
// Connected" relationships layer in the product diagram actually is.
export type LinkableType = 'entry' | 'task' | 'journal' | 'project' | 'skill' | 'knowledge';

export interface LinkRef {
  type: LinkableType;
  id: string;
  title: string;
}

export interface Link {
  id: string;
  from: LinkRef;
  to: LinkRef;
}
