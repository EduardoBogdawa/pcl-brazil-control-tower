import { useEffect, useRef } from 'react';
import markup from '@/control-tower/markup.html?raw';
import { initControlTower } from '@/control-tower/legacy-app.js';
import '@/control-tower/control-tower.css';
import '@/control-tower/control-tower-fx.css';
import '@/control-tower/control-tower-next.css';

function App() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    // Markup is injected here (not via React) so a re-render can never wipe the content the legacy script filled in;
    // the data flag keeps StrictMode's double effect from binding listeners twice on the same DOM.
    if (!el || el.dataset.ready) return;
    el.dataset.ready = '1';
    el.innerHTML = markup;
    initControlTower();
  }, []);

  return <div ref={root} style={{ display: 'contents' }} />;
}

export default App;
