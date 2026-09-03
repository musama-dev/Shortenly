import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import "./input.css";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  adornment?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, adornment, className = "", id, ...rest }, ref,
) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={`field ${className}`}>
      {label && <label className="field__label" htmlFor={inputId}>{label}</label>}
      <div className={`field__control ${error ? "field__control--error" : ""} ${adornment ? "field__control--prefixed" : ""}`}>
        {adornment && <span className="field__prefix">{adornment}</span>}
        <input ref={ref} id={inputId} className="field__input" aria-invalid={!!error} {...rest} />
      </div>
      {error
        ? <p className="field__error" role="alert">{error}</p>
        : hint && <p className="field__hint">{hint}</p>}
    </div>
  );
});
