import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The base contract: behaves exactly like a native <button>. */
export function Button(props: ButtonProps) {
  return <button type="button" {...props} />;
}

/**
 * ❌ LSP violation: it claims to accept ButtonProps, so callers expect a drop-in
 * replacement, but it renders a <div>: `disabled` is ignored, it is not
 * focusable and keyboard users cannot activate it.
 */
export function IconButton({ onClick, children, icon }: ButtonProps & { icon: ReactNode }) {
  return (
    <div className="icon-button" onClick={onClick as never}>
      {icon} {children}
    </div>
  );
}
