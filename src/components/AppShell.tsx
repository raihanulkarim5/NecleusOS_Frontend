import { useEffect, useRef, useState } from 'react';
import { StarfieldBackground } from './StarfieldBackground';
import { Logo } from './Logo';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'entries', label: 'Entries' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'journal', label: 'Journal' },
  { key: 'finance', label: 'Finance' },
  { key: 'projects', label: 'Projects' },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]['key'];

interface AppShellProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

export function AppShell({ active, onNavigate, onSignOut, children }: AppShellProps) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = itemRefs.current[active];
    if (el) setPillStyle({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return (
    <div className="shell">
      <StarfieldBackground />

      <header className="shell-nav">
        <div className="shell-logo">
          <Logo />
        </div>

        <nav className="shell-tabs">
          <div className="shell-pill" style={{ left: pillStyle.left, width: pillStyle.width }} />
          {NAV_ITEMS.map((item) => (
            <div
              key={item.key}
              ref={(el) => (itemRefs.current[item.key] = el)}
              className={`shell-tab${active === item.key ? ' active' : ''}`}
              aria-current={active === item.key ? 'page' : undefined}
              onClick={() => onNavigate(item.key)}
            >
              {item.label}
            </div>
          ))}
        </nav>

        <button className="shell-signout" onClick={onSignOut}>Sign out</button>
      </header>

      <main className="shell-content">{children}</main>
    </div>
  );
}
