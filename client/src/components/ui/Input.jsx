import { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

// Labelled text input (or textarea with as="textarea") with an inline error message.
const Input = forwardRef(function Input(
  { label, error, hint, required, as = 'input', className = '', id, ...rest },
  ref
) {
  const autoId = useId();
  const inputId = id || autoId;
  const Tag = as;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={inputId} className="field-label">
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}
      <Tag
        id={inputId}
        ref={ref}
        className={`control ${as === 'textarea' ? 'control-textarea' : ''} ${error ? 'is-invalid' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={describedBy}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-error`} className="field-error">
          <AlertCircle size={13} /> {error}
        </p>
      ) : (
        hint && (
          <p id={`${inputId}-hint`} className="field-hint">
            {hint}
          </p>
        )
      )}
    </div>
  );
});

export default Input;
