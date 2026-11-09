import { LogOut } from 'lucide-react';
import type { AppUser } from '@/auth/types';
import '@/auth/auth.css';

interface Props {
  user: AppUser;
  onSignOut?: () => void;
}

function initials(name: string) {
  return name.split(/[\s.@]+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join('');
}

export default function UserBadge({ user, onSignOut }: Props) {
  return (
    <div className="auth-user">
      <span className="auth-avatar" aria-hidden="true">{initials(user.name)}</span>
      <span className="auth-meta">
        <b title={user.name}>{user.name}</b>
        <small title={user.email}>{user.email}</small>
      </span>
      {user.devMode && <span className="auth-dev" title="Modo de desenvolvimento">DEV</span>}
      {onSignOut && (
        <button type="button" className="auth-out" onClick={onSignOut} aria-label="Sair" title="Sair">
          <LogOut size={16} />
        </button>
      )}
    </div>
  );
}
