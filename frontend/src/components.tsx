import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { AlertCircle, X, CalendarDays, LoaderCircle } from "lucide-react";
export function Logo() {
  return (
    <span className="logo">
      <span className="brand-icon">
        <CalendarDays size={21} />
      </span>
      slotwise<span className="brand-dot">.</span>
    </span>
  );
}
export function ErrorBox({ error }: { error: Error | null }) {
  return error ? (
    <div className="error-box" role="alert">
      <AlertCircle size={18} />
      <span>{error.message}</span>
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <LoaderCircle className="spin" size={22} /> Carregando sua agenda…
    </div>
  );
}
export function Modal({
  title,
  subtitle,
  close,
  children,
}: {
  title: string;
  subtitle: string;
  close: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <div className="modal-head">
          <div>
            <h2 id="modal-title">{title}</h2>
            <p>{subtitle}</p>
          </div>
          <button className="icon-button" aria-label="Fechar" onClick={close}>
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <CalendarDays size={30} />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
export function Avatar({ name, index = 0 }: { name: string; index?: number }) {
  return (
    <span className={`avatar color-${index % 4}`}>
      {name
        .split(" ")
        .map((x) => x[0])
        .slice(0, 2)
        .join("")}
    </span>
  );
}
