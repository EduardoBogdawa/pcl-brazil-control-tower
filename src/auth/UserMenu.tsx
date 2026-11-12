import { useEffect, useRef, useState } from 'react';
import { FlaskConical, Loader2, LogOut } from 'lucide-react';
import { tr } from '@/control-tower/i18n.js';
import type { AuthUser } from '@/auth/types';

type Props = { user: AuthUser; onSignOut: () => void };

const initials = (name: string) =>
  name.split(/[\s.@]+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('') || '?';

function UserMenu({ user, onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="user-menu" ref={wrap}>
      <button
        type="button"
        className="user-chip"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={tr('Conta de {0}', user.name)}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={'user-avatar' + (user.dev ? ' dev' : '')}>
          {user.dev ? <FlaskConical size={14} aria-hidden="true" /> : initials(user.name)}
        </span>
        <span className="user-name">{user.dev ? tr('Modo dev') : user.name.split(' ')[0]}</span>
      </button>
      {open && (
        <div className="user-pop" role="menu">
          <div className="user-pop-head">
            <b>{user.name}</b>
            <small>{user.email}</small>
          </div>
          {user.dev ? (
            <p className="user-pop-note">{tr('Login da Microsoft desativado neste ambiente.')}</p>
          ) : (
            <button
              type="button"
              role="menuitem"
              className="user-pop-item"
              disabled={leaving}
              onClick={() => { setLeaving(true); onSignOut(); }}
            >
              {leaving ? <Loader2 className="auth-spin" size={16} aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}
              <span>{leaving ? tr('Saindo...') : tr('Sair da conta')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default UserMenu;
