import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The base contract: behaves exactly like a native <button>. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { type = "button", ...rest },
  ref,
) {
  return <button ref={ref} type={type} {...rest} />;
});

/** ✅ Specialises the look, keeps the whole contract (props, ref, disabled, a11y). */
export const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(function PrimaryButton(
  { className, ...rest },
  ref,
) {
  return <Button ref={ref} className={["btn-primary", className].filter(Boolean).join(" ")} {...rest} />;
});

interface IconButtonProps extends ButtonProps {
  readonly icon: ReactNode;
}

/** ✅ Adds an icon, still a real <button>: substitutable anywhere a Button is. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, children, ...rest },
  ref,
) {
  return (
    <Button ref={ref} {...rest}>
      <span aria-hidden="true">{icon}</span> {children}
    </Button>
  );
});
