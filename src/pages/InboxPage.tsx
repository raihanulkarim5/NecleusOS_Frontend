import { FormEvent, useState } from 'react';
import { useAddInboxItem, useInboxItems, useRemoveInboxItem } from '../hooks/useInbox';
import { useCreateEntry } from '../hooks/useEntries';
import { useCreateTask } from '../hooks/useTasks';
import type { InboxItem } from '../types/inbox';

export function InboxPage() {
  const { data: items, isLoading } = useInboxItems();
  const addItem = useAddInboxItem();
  const removeItem = useRemoveInboxItem();
  const createEntry = useCreateEntry();
  const createTask = useCreateTask();

  const [content, setContent] = useState('');

  function handleCapture(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    addItem.mutate(content.trim());
    setContent('');
  }

  function convertToEntry(item: InboxItem) {
    createEntry.mutate({
      title: item.content,
      description: '',
      type: 'Note',
      priority: 'Medium',
      tags: [],
      dueDate: null,
    });
    removeItem.mutate(item.id);
  }

  function convertToTask(item: InboxItem) {
    createTask.mutate({
      title: item.content,
      description: '',
      priority: 'Medium',
      dueDate: null,
      tags: [],
      effortEstimateHours: null,
      recurring: 'None',
    });
    removeItem.mutate(item.id);
  }

  return (
    <div>
      <h1 className="page-title">Inbox</h1>
      <p className="page-date">Capture first, organize later — triage into Entries or Tasks when ready.</p>

      <form className="entry-quickadd" onSubmit={handleCapture}>
        <input
          type="text"
          placeholder="Quick capture… anything, sort it out later"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" disabled={addItem.isPending || !content.trim()}>
          {addItem.isPending ? 'Adding…' : 'Capture'}
        </button>
      </form>

      {isLoading && <p className="muted-text">Loading inbox…</p>}

      <div className="inbox-list">
        {items?.map((item) => (
          <div className="inbox-item" key={item.id}>
            <span className="inbox-content">{item.content}</span>
            <div className="inbox-actions">
              <button onClick={() => convertToEntry(item)}>→ Entry</button>
              <button onClick={() => convertToTask(item)}>→ Task</button>
              <button className="inbox-discard" onClick={() => removeItem.mutate(item.id)}>Discard</button>
            </div>
          </div>
        ))}
        {!isLoading && items?.length === 0 && <p className="muted-text">Inbox is clear.</p>}
      </div>
    </div>
  );
}
