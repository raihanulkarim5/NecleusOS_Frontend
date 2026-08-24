import { useEffect, useRef } from 'react';

interface RichNotesEditorProps {
  value: string; // HTML
  onSave: (html: string) => void;
}

// A deliberately small rich-text editor — bold/italic/underline and lists,
// via document.execCommand. It's an old API, but it's supported everywhere
// without pulling in a dependency, and this is exactly the scope "rich
// notes" needs here: light formatting, not a full document editor.
export function RichNotesEditor({ value, onSave }: RichNotesEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastSaved = useRef(value);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
      lastSaved.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string) {
    document.execCommand(command);
    ref.current?.focus();
  }

  function handleBlur() {
    const html = ref.current?.innerHTML ?? '';
    if (html !== lastSaved.current) {
      lastSaved.current = html;
      onSave(html);
    }
  }

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar">
        <button type="button" onClick={() => exec('bold')}><b>B</b></button>
        <button type="button" onClick={() => exec('italic')}><i>I</i></button>
        <button type="button" onClick={() => exec('underline')}><u>U</u></button>
        <button type="button" onClick={() => exec('insertUnorderedList')}>• List</button>
        <button type="button" onClick={() => exec('insertOrderedList')}>1. List</button>
      </div>
      <div
        ref={ref}
        className="rich-editor-content"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        data-placeholder="Freeform notes about this skill…"
      />
    </div>
  );
}
