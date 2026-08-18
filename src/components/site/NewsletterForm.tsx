'use client';

import { ArrowRight, Check, LoaderCircle } from 'lucide-react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { NEWSLETTER_INITIAL_STATE } from '@/server/actions/form-state';
import { subscribeToNewsletter } from '@/server/actions/newsletter';

import styles from './NewsletterForm.module.css';

function SubmitButton({ done }: { done: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending || done}>
      {pending ? (
        <LoaderCircle size={16} className={styles.spinner} aria-hidden="true" />
      ) : done ? (
        <Check size={16} aria-hidden="true" />
      ) : (
        <ArrowRight size={16} aria-hidden="true" />
      )}
      <span className="visually-hidden">Bültene kaydol</span>
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeToNewsletter, NEWSLETTER_INITIAL_STATE);
  const done = state.status === 'success';

  return (
    <form action={formAction} className={styles.form}>
      <label htmlFor="newsletter-email" className={styles.label}>
        Günlük bülten
      </label>
      <p className={styles.hint}>Günün özeti her sabah e-postanızda.</p>

      <div className={styles.row}>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="ornek@eposta.com"
          className={styles.input}
          disabled={done}
          aria-describedby={state.message ? 'newsletter-status' : undefined}
          aria-invalid={state.status === 'error'}
        />
        <SubmitButton done={done} />
      </div>

      {/* Bot tuzağı — ekran okuyucudan ve klavyeden gizli. */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="newsletter-website">Web sitesi</label>
        <input id="newsletter-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state.message && (
        <p
          id="newsletter-status"
          role="status"
          className={state.status === 'error' ? styles.error : styles.success}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
