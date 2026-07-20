import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmContext = createContext(null);

/**
 * Imperative confirm dialog. `const confirm = useConfirm();`
 * `await confirm({ title, message, okLabel, danger })` resolves true/false.
 */
export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, opts: {} });
  const resolver = useRef(null);

  const confirm = useCallback(
    (opts = {}) =>
      new Promise((resolve) => {
        resolver.current = resolve;
        setState({ open: true, opts });
      }),
    []
  );

  const close = (value) => {
    setState((s) => ({ ...s, open: false }));
    resolver.current?.(value);
  };

  const { title = 'Are you sure?', message, okLabel = 'Confirm', danger } = state.opts;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={state.open}
        onClose={() => close(false)}
        title={title}
        footer={
          <>
            <Button variant="ghost" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button variant={danger ? 'danger' : 'primary'} onClick={() => close(true)}>
              {okLabel}
            </Button>
          </>
        }
      >
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>{message}</p>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
