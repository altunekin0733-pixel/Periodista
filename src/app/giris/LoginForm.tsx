'use client';

import { Eye, EyeOff, LoaderCircle, LogIn } from 'lucide-react';
import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { login } from '@/server/actions/auth';
import { LOGIN_INITIAL_STATE } from '@/server/actions/form-state';

import styles from './page.module.css';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? (
        <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
      ) : (
        <LogIn size={16} aria-hidden="true" />
      )}
      {pending ? 'Giriş yapılıyor…' : 'Giriş yap'}
    </button>
  );
}

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState(login, LOGIN_INITIAL_STATE);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className={styles.field}>
        <label htmlFor="username" className={styles.label}>
          Kullanıcı adı
        </label>
        <input
          id="username"
          name="username"
          type="text"
          required
          autoComplete="username"
          autoFocus
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="password" className={styles.label}>
          Şifre
        </label>
        <div className={styles.passwordRow}>
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className={styles.reveal}
            aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
          >
            {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
