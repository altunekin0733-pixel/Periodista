'use client';

import { useFormStatus } from 'react-dom';

type ConfirmSubmitProps = {
  children: React.ReactNode;
  message: string;
  className?: string;
};

/**
 * Geri alınamaz işlemler için onay soran gönder düğmesi. Onay verilmezse
 * gönderim iptal edilir; JavaScript kapalıysa form yine de çalışır.
 */
export function ConfirmSubmit({ children, message, className }: ConfirmSubmitProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {pending ? '…' : children}
    </button>
  );
}
