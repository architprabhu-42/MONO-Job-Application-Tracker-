import { forwardRef, useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

// options: array of strings or { value, label }
const Select = forwardRef(function Select(
  { label, error, hint, required, options = [], placeholder, className = '', id, ...rest },
  ref
) {
  const autoId = useId();
  const selectId = id || autoId;

  return (
    <div className={`field ${className}`}>
      {label && (
        <label htmlFor={selectId} className="field-label">
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
      )}
      <div className="select-wrap">
        <select
          id={selectId}
          ref={ref}
          className={`control control-select ${error ? 'is-invalid' : ''}`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...rest}
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value;
            const text = typeof opt === 'string' ? opt : opt.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDown size={16} className="select-chevron" aria-hidden="true" />
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="field-error">
          <AlertCircle size={13} /> {error}
        </p>
      ) : (
        hint && <p className="field-hint">{hint}</p>
      )}
    </div>
  );
});

export default Select;
