import { useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { pushToast } from '@/store/uiSlice';

/** Returns `toast(message, variant?)` — variant 'success' | 'error'. */
export function useToast() {
  const dispatch = useDispatch();
  return useCallback((message, variant = 'success') => dispatch(pushToast(message, variant)), [dispatch]);
}

export default useToast;
