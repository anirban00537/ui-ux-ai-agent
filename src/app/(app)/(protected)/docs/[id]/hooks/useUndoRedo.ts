import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { selectCanUndo, selectCanRedo } from '@/store/slices/cardsSlice';

/**
 * Hook for undo/redo functionality with keyboard shortcuts
 * 
 * Features:
 * - Cmd/Ctrl+Z for undo
 * - Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y for redo
 * - Provides undo/redo functions and state
 */
export function useUndoRedo() {
  const dispatch = useDispatch();
  const canUndo = useSelector(selectCanUndo);
  const canRedo = useSelector(selectCanRedo);

  const undo = useCallback(() => {
    if (canUndo) {
      dispatch(ActionCreators.undo());
    }
  }, [dispatch, canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      dispatch(ActionCreators.redo());
    }
  }, [dispatch, canRedo]);

  const clearHistory = useCallback(() => {
    dispatch(ActionCreators.clearHistory());
  }, [dispatch]);

  const jumpToPast = useCallback((index: number) => {
    dispatch(ActionCreators.jumpToPast(index));
  }, [dispatch]);

  const jumpToFuture = useCallback((index: number) => {
    dispatch(ActionCreators.jumpToFuture(index));
  }, [dispatch]);

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    jumpToPast,
    jumpToFuture,
  };
}

/**
 * Hook to add keyboard shortcuts for undo/redo
 * Call this hook in your editor component to enable Cmd/Ctrl+Z and Cmd/Ctrl+Shift+Z
 */
export function useUndoRedoKeyboardShortcuts() {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input or textarea (except for ProseMirror)
      const target = e.target as HTMLElement;
      const isInProseMirror = target.closest('.ProseMirror');
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      // Allow undo/redo in ProseMirror, but not in regular inputs
      // (regular inputs have their own undo/redo)
      if (isInInput && !isInProseMirror) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Undo: Cmd/Ctrl + Z (without Shift)
      if (modKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
        }
        return;
      }

      // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
      if (modKey && ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        if (canRedo) {
          redo();
        }
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  return { undo, redo, canUndo, canRedo };
}
