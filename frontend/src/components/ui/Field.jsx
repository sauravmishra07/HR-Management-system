import { forwardRef } from 'react';

/** Labeled field wrapper with error text. Use for RHF-registered inputs. */
export function Field({ label, error, children, full, className = '' }) {
  return (
    <div className={`fld ${full ? 'full' : ''} ${className}`}>
      {label && <label>{label}</label>}
      {children}
      {error && <span style={{ color: '#b3261e', fontSize: 11.5, fontWeight: 600, marginTop: 4, display: 'block' }}>{error}</span>}
    </div>
  );
}

export const TextInput = forwardRef(function TextInput(props, ref) {
  return <input ref={ref} className="input" {...props} />;
});

export const TextArea = forwardRef(function TextArea(props, ref) {
  return <textarea ref={ref} className="input" {...props} />;
});

export const Select = forwardRef(function Select({ children, ...props }, ref) {
  return (
    <select ref={ref} className="input" {...props}>
      {children}
    </select>
  );
});

export default Field;
