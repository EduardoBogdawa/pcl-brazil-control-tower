import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthGate, ConfigNotice } from '@/auth/AuthGate';
import { isAuthPopup } from '@/auth/msal';
import { missingDataConfig } from '@/lib/public-config';

// A Microsoft popup that ends up on the app URL must stay inert so the opener can read the response and close it.
if (!isAuthPopup()) {
  const root = createRoot(document.getElementById('root')!);
  const missing = missingDataConfig();

  if (missing.length) {
    root.render(
      <ConfigNotice title="Configuração incompleta">
        Defina {missing.join(' e ')} no ambiente do servidor para carregar os dados do Control Tower.
      </ConfigNotice>,
    );
  } else {
    // Loaded only once data settings exist: the database client is created when this module is evaluated.
    import('./App.tsx')
      .then(({ default: App }) =>
        root.render(
          <StrictMode>
            <AuthGate>{(session) => <App session={session} />}</AuthGate>
          </StrictMode>,
        ),
      )
      .catch(() =>
        root.render(
          <ConfigNotice title="Falha ao carregar">Não foi possível carregar o Control Tower. Recarregue a página.</ConfigNotice>,
        ),
      );
  }
}
