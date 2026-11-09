import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import markup from '@/control-tower/markup.html?raw';
import { initControlTower } from '@/control-tower/legacy-app.js';
import UserBadge from '@/auth/UserBadge';
import type { AppUser } from '@/auth/types';
import '@/control-tower/control-tower.css';
import '@/control-tower/control-tower-fx.css';

interface Props {
  user: AppUser;
  onSignOut?: () => void;
}

function App({ user, onSignOut }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [badgeSlot, setBadgeSlot] = useState<Element | null>(null);

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
    setBadgeSlot(el.querySelector('.top .actions'));
  }, []);

  return (
    <>
      <div ref={root} style={{ display: 'contents' }} />
      {badgeSlot && createPortal(<UserBadge user={user} onSignOut={onSignOut} />, badgeSlot)}
    </>
  );
}

export default App;
