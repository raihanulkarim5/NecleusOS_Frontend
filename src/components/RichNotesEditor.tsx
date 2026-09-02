import { useEffect, useRef } from 'react';

interface RichNotesEditorProps {
  value: string;
  onSave: (html: string) => void;
  placeholder?: string;
}

export function RichNotesEditor({ value, onSave, placeholder }: RichNotesEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastSaved = useRef(value);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value;
      lastSaved.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg);
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
        <button type="button" onClick={() => exec('formatBlock', 'pre')} title="Code block">{'</>'}</button>
      </div>
      <div
        ref={ref}
        className="rich-editor-content"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleBlur}
        data-placeholder={placeholder ?? 'Freeform notes…'}
      />
    </div>
  );
}
