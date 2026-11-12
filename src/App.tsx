import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import markup from '@/control-tower/markup.html?raw';
import { initControlTower } from '@/control-tower/legacy-app.js';
import UserMenu from '@/auth/UserMenu';
import type { AuthUser } from '@/auth/types';
import '@/control-tower/control-tower.css';
import '@/control-tower/control-tower-fx.css';
import '@/control-tower/control-tower-next.css';

type Props = { user: AuthUser; onSignOut: () => void };

function App({ user, onSignOut }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [userSlot, setUserSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const el = root.current;
    // Markup is injected here (not via React) so a re-render can never wipe the content the legacy script filled in;
    // the data flag keeps StrictMode's double effect from binding listeners twice on the same DOM.
    if (!el) return;
    if (!el.dataset.ready) {
      el.dataset.ready = '1';
      el.innerHTML = markup;
      initControlTower();
    }
    setUserSlot(el.querySelector<HTMLElement>('#userSlot'));
  }, []);

  return (
    <>
      <div ref={root} style={{ display: 'contents' }} />
      {userSlot && createPortal(<UserMenu user={user} onSignOut={onSignOut} />, userSlot)}
    </>
  );
}

export default App;
