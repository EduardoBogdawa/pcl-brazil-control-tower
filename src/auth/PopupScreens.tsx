import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { broadcastResponseToMainFrame } from '@azure/msal-browser/redirect-bridge';
import { runPopupRelay } from '@azure/msal-browser/popup-relay';
import { tr } from '@/control-tower/i18n';
import { authorityOrigin } from '@/auth/msal';
import '@/auth/auth.css';

function MicrosoftMark() {
  return (
    <svg viewBox="0 0 21 21" width="18" height="18" aria-hidden="true">
      <rect x="1" y="1" width="9" height="9" fill="#F25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
      <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
      <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
    </svg>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-screen">
      <section className="auth-card auth-card-sm" aria-live="polite">{children}</section>
    </main>
  );
}

function ErrorNote({ text }: { text: string }) {
  return (
    <div className="auth-note error" role="alert">
      <AlertTriangle size={18} />
      <div>
        <b>{tr('Não foi possível entrar')}</b>
        <p>{text}</p>
      </div>
    </div>
  );
}

// Top-level page opened from the embedded preview; it opens the Microsoft window and relays the answer back.
export function PopupRelayScreen() {
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  const start = () => {
    setFailed(false);
    try {
      // Must run inside the click so the browser allows the Microsoft window to open.
      runPopupRelay({ allowedAuthorityOrigins: [authorityOrigin()] });
      setStarted(true);
    } catch (err) {
      console.warn('[auth] popup relay failed', err);
      setFailed(true);
    }
  };

  return (
    <Shell>
      <h1 className="auth-mini-title">{tr('Entrar com Microsoft')}</h1>
      <p className="auth-lead">{started ? tr('Conclua o login na janela da Microsoft. Esta janela fecha sozinha ao terminar.') : tr('Clique em continuar para abrir o login da Microsoft.')}</p>
      {failed && <ErrorNote text={tr('Feche esta janela e tente novamente.')} />}
      <button type="button" className="auth-btn" onClick={start} disabled={started && !failed}>
        {started && !failed ? <Loader2 size={18} className="auth-spin" /> : <MicrosoftMark />}
        <span>{started && !failed ? tr('Aguardando login...') : tr('Continuar')}</span>
      </button>
    </Shell>
  );
}

// Page Microsoft returns to inside the popup; hands the response to the waiting window and closes.
export function PopupCallbackScreen() {
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    // The bridge consumes the response from the URL, so it must run exactly once (StrictMode runs effects twice).
    if (ran.current) return;
    ran.current = true;
    broadcastResponseToMainFrame().catch((err) => {
      console.warn('[auth] popup callback failed', err);
      setFailed(true);
    });
  }, []);

  return (
    <Shell>
      <h1 className="auth-mini-title">{tr('Entrar com Microsoft')}</h1>
      {failed ? <ErrorNote text={tr('Feche esta janela e tente novamente.')} /> : (
        <p className="auth-lead auth-row"><Loader2 size={18} className="auth-spin" />{tr('Concluindo login...')}</p>
      )}
    </Shell>
  );
}
