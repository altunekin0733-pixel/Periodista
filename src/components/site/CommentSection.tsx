import { MessageSquare } from 'lucide-react';

import { formatRelativeTime, toIsoString } from '@/lib/format';
import { getApprovedComments } from '@/server/queries';

import { CommentForm } from './CommentForm';
import styles from './CommentSection.module.css';

type CommentSectionProps = {
  articleId: string;
  moderated: boolean;
};

export async function CommentSection({ articleId, moderated }: CommentSectionProps) {
  const comments = await getApprovedComments(articleId);

  return (
    <section className={styles.section} aria-labelledby="yorumlar">
      <header className={styles.header}>
        <MessageSquare size={16} className={styles.icon} aria-hidden="true" />
        <h2 id="yorumlar" className="label-caps">
          Yorumlar ({comments.length})
        </h2>
      </header>

      <CommentForm articleId={articleId} moderated={moderated} />

      {comments.length === 0 ? (
        <p className={styles.empty}>Bu habere henüz yorum yapılmamış. İlk yorumu siz yazın.</p>
      ) : (
        <ol className={styles.list}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.comment}>
              <div className={styles.commentHead}>
                <span className={styles.author}>{comment.authorName}</span>
                <time dateTime={toIsoString(comment.createdAt)} className={styles.time}>
                  {formatRelativeTime(comment.createdAt)}
                </time>
              </div>
              <p className={styles.body}>{comment.body}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
