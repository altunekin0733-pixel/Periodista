type AdminTopbarProps = {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
};

export function AdminTopbar({ eyebrow, title, children }: AdminTopbarProps) {
  return (
    <header className="admin-topbar">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h1 className="admin-title">{title}</h1>
      </div>
      {children && <div className="admin-toolbar is-inline">{children}</div>}
    </header>
  );
}
