/**
 * Form durum tipleri ve başlangıç değerleri.
 *
 * Bu modül bilinçli olarak `'use server'` taşımaz: bir server action dosyası
 * yalnızca async fonksiyon dışa aktarabilir, sabit veya nesne aktaramaz.
 * `useActionState` başlangıç değerlerini buradan alır.
 */

export type ArticleFormState = {
  status: 'idle' | 'error';
  message: string;
  fieldErrors: Record<string, string>;
};

export const ARTICLE_INITIAL_STATE: ArticleFormState = {
  status: 'idle',
  message: '',
  fieldErrors: {},
};

export type CategoryFormState = {
  status: 'idle' | 'error' | 'success';
  message: string;
  fieldErrors: Record<string, string>;
};

export const CATEGORY_INITIAL_STATE: CategoryFormState = {
  status: 'idle',
  message: '',
  fieldErrors: {},
};

export type CommentState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export const COMMENT_INITIAL_STATE: CommentState = { status: 'idle', message: '' };

export type NewsletterState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export const NEWSLETTER_INITIAL_STATE: NewsletterState = { status: 'idle', message: '' };

export type SettingsState = {
  status: 'idle' | 'error' | 'success';
  message: string;
};

export const SETTINGS_INITIAL_STATE: SettingsState = { status: 'idle', message: '' };

export type LoginState = {
  error: string;
};

export const LOGIN_INITIAL_STATE: LoginState = { error: '' };

export type PanelsState = {
  status: 'idle' | 'error' | 'success';
  message: string;
};

export const PANELS_INITIAL_STATE: PanelsState = { status: 'idle', message: '' };

export type PageFormState = {
  status: 'idle' | 'error' | 'success';
  message: string;
};

export const PAGE_INITIAL_STATE: PageFormState = { status: 'idle', message: '' };
