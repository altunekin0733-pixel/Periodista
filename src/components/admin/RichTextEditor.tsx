'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  Link2Off,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Undo2,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import styles from './RichTextEditor.module.css';

type RichTextEditorProps = {
  name: string;
  defaultValue: string;
  onPlainTextChange?: (text: string) => void;
};

type ToolButton = {
  key: string;
  label: string;
  icon: typeof Bold;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
};

const TOOLS: ToolButton[] = [
  {
    key: 'bold',
    label: 'Kalın',
    icon: Bold,
    action: (editor) => editor.chain().focus().toggleBold().run(),
    isActive: (editor) => editor.isActive('bold'),
  },
  {
    key: 'italic',
    label: 'İtalik',
    icon: Italic,
    action: (editor) => editor.chain().focus().toggleItalic().run(),
    isActive: (editor) => editor.isActive('italic'),
  },
  {
    key: 'strike',
    label: 'Üstü çizili',
    icon: Strikethrough,
    action: (editor) => editor.chain().focus().toggleStrike().run(),
    isActive: (editor) => editor.isActive('strike'),
  },
  {
    key: 'h2',
    label: 'Ara başlık',
    icon: Heading2,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
  },
  {
    key: 'h3',
    label: 'Alt başlık',
    icon: Heading3,
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
  },
  {
    key: 'bullet',
    label: 'Madde listesi',
    icon: List,
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
    isActive: (editor) => editor.isActive('bulletList'),
  },
  {
    key: 'ordered',
    label: 'Numaralı liste',
    icon: ListOrdered,
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
    isActive: (editor) => editor.isActive('orderedList'),
  },
  {
    key: 'quote',
    label: 'Alıntı',
    icon: Quote,
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
    isActive: (editor) => editor.isActive('blockquote'),
  },
  {
    key: 'hr',
    label: 'Ayraç',
    icon: Minus,
    action: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

export function RichTextEditor({ name, defaultValue, onPlainTextChange }: RichTextEditorProps) {
  const [html, setHtml] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const editor = useEditor({
    // Sunucuda render edilmez; hydration uyuşmazlığını engeller.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true, protocols: ['http', 'https', 'mailto'] }),
      Image.configure({ inline: false }),
      Placeholder.configure({ placeholder: 'Haber metnini buraya yazın…' }),
    ],
    content: defaultValue,
    onUpdate: ({ editor: instance }) => {
      setHtml(instance.getHTML());
      onPlainTextChange?.(instance.getText());
    },
  });

  useEffect(() => {
    if (editor) onPlainTextChange?.(editor.getText());
  }, [editor, onPlainTextChange]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previous = editor.getAttributes('link').href ?? '';
    const url = window.prompt('Bağlantı adresi', previous);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    if (!/^https?:\/\/|^mailto:/i.test(url)) {
      window.alert('Bağlantı http://, https:// veya mailto: ile başlamalı.');
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const insertImage = useCallback(async () => {
    if (!editor) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploading(true);
      setUploadError('');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/yukle', { method: 'POST', body: formData });
        const payload = await response.json();

        if (!response.ok) {
          setUploadError(payload.error ?? 'Görsel yüklenemedi.');
          return;
        }

        const alt = window.prompt('Görsel açıklaması (erişilebilirlik için)') ?? '';
        editor.chain().focus().setImage({ src: payload.url, alt }).run();
      } catch {
        setUploadError('Görsel yüklenirken bağlantı hatası oluştu.');
      } finally {
        setUploading(false);
      }
    };

    input.click();
  }, [editor]);

  if (!editor) {
    return <div className={styles.loading}>Editör yükleniyor…</div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar} role="toolbar" aria-label="Metin biçimlendirme">
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          const active = tool.isActive?.(editor) ?? false;

          return (
            <button
              key={tool.key}
              type="button"
              className={`${styles.tool} ${active ? styles.toolActive : ''}`}
              onClick={() => tool.action(editor)}
              title={tool.label}
              aria-label={tool.label}
              aria-pressed={active}
            >
              <Icon size={15} aria-hidden="true" />
            </button>
          );
        })}

        <span className={styles.divider} aria-hidden="true" />

        <button
          type="button"
          className={`${styles.tool} ${editor.isActive('link') ? styles.toolActive : ''}`}
          onClick={setLink}
          title="Bağlantı ekle"
          aria-label="Bağlantı ekle"
        >
          <Link2 size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.tool}
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive('link')}
          title="Bağlantıyı kaldır"
          aria-label="Bağlantıyı kaldır"
        >
          <Link2Off size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.tool}
          onClick={insertImage}
          disabled={uploading}
          title="Görsel ekle"
          aria-label="Görsel ekle"
        >
          <ImagePlus size={15} aria-hidden="true" />
        </button>

        <span className={styles.divider} aria-hidden="true" />

        <button
          type="button"
          className={styles.tool}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Geri al"
          aria-label="Geri al"
        >
          <Undo2 size={15} aria-hidden="true" />
        </button>

        <button
          type="button"
          className={styles.tool}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="İleri al"
          aria-label="İleri al"
        >
          <Redo2 size={15} aria-hidden="true" />
        </button>

        {uploading && <span className={styles.status}>Görsel yükleniyor…</span>}
      </div>

      <EditorContent editor={editor} className={styles.editor} />

      {uploadError && (
        <p className="admin-error" role="alert">
          {uploadError}
        </p>
      )}

      {/* Gerçek form değeri; sunucuda ayrıca sanitize edilir. */}
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}
