'use client';

import { LoaderCircle, Send } from 'lucide-react';
import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { submitComment } from '@/server/actions/comments';
import { COMMENT_INITIAL_STATE } from '@/server/actions/form-state';

import styles from './CommentForm.module.css';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={styles.submit} disabled={pending}>
      {pending ? (
        <LoaderCircle size={15} className={styles.spinner} aria-hidden="true" />
      ) : (
        <Send size={15} aria-hidden="true" />
      )}
      {pending ? 'Gönderiliyor…' : 'Yorumu gönder'}
    </button>
  );
}

type CommentFormProps = {
  articleId: string;
  moderated: boolean;
};

export function CommentForm({ articleId, moderated }: CommentFormProps) {
  const [state, formAction] = useActionState(submitComment, COMMENT_INITIAL_STATE);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className={styles.form}>
      <input type="hidden" name="articleId" value={articleId} />

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="comment-name" className={styles.label}>
            Adınız
          </label>
          <input
            id="comment-name"
            name="authorName"
            type="text"
            required
            minLength={2}
            maxLength={60}
            autoComplete="name"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="comment-email" className={styles.label}>
            E-posta <span className={styles.optional}>(yayınlanmaz, isteğe bağlı)</span>
          </label>
          <input
            id="comment-email"
            name="authorEmail"
            type="email"
            autoComplete="email"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="comment-body" className={styles.label}>
          Yorumunuz
        </label>
        <textarea
          id="comment-body"
          name="body"
          required
          minLength={4}
          maxLength={2000}
          rows={4}
          className={styles.textarea}
          placeholder="Görüşünüzü paylaşın…"
        />
      </div>

      {/* Bot tuzağı */}
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="comment-website">Web sitesi</label>
        <input id="comment-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className={styles.footer}>
        <p className={styles.note}>
          {moderated
            ? 'Yorumlar editör onayından sonra yayınlanır.'
            : 'Yorumunuz anında yayınlanır.'}
        </p>
        <SubmitButton />
      </div>

      {state.message && (
        <p role="status" className={state.status === 'error' ? styles.error : styles.success}>
          {state.message}
        </p>
      )}
    </form>
  );
}
