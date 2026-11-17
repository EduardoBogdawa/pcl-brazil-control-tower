import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, UserRound } from 'lucide-react';
import markup from '@/control-tower/markup.html?raw';
import { initControlTower } from '@/control-tower/legacy-app.js';
import type { Session } from '@/auth/AuthGate';
import '@/control-tower/control-tower.css';
import '@/control-tower/control-tower-fx.css';
import '@/control-tower/control-tower-next.css';

function App({ session }: { session: Session }) {
  const root = useRef<HTMLDivElement>(null);
  const [userSlot, setUserSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    // Markup is injected here (not via React) so a re-render can never wipe the content the legacy script filled in;
    // the data flag keeps StrictMode's double effect from binding listeners twice on the same DOM.
    if (!el || el.dataset.ready) return;
    el.dataset.ready = '1';
    el.innerHTML = markup;
    initControlTower();
    const slot = document.createElement('div');
    el.querySelector('.top .actions')?.prepend(slot);
    setUserSlot(slot);
  }, []);

  const { user } = session;

  return (
    <>
      <div ref={root} style={{ display: 'contents' }} />
      {userSlot && createPortal(
        <div className="user-chip" title={user.username}>
          <UserRound size={16} aria-hidden="true" />
          <span className="user-chip-name"><b>{user.name}</b><small>{user.username}</small></span>
          {session.signOut && (
            <button type="button" className="user-chip-out" onClick={session.signOut} aria-label="Sair" title="Sair">
              <LogOut aria-hidden="true" />
            </button>
          )}
        </div>,
        userSlot,
      )}
    </>
  );
}

export default App;
