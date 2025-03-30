import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers, highlightActiveLine } from '@codemirror/view';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';

const Editor = ({ roomId, onCodeChange, initialCode }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const state = EditorState.create({
        doc: initialCode || '// Start coding here...',
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          bracketMatching(),
          indentOnInput(),
          closeBrackets(),
          syntaxHighlighting(defaultHighlightStyle),
          javascript(),
          oneDark,
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newCode = update.state.doc.toString();
              onCodeChange(newCode); // Notify parent of changes
            }
          }),
        ],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });

      viewRef.current = view;

      return () => {
        view.destroy();
      };
    }
  }, []); // Empty dependency array to mount only once

  // Update editor when initialCode changes (e.g., from socket)
  useEffect(() => {
    if (viewRef.current && initialCode !== viewRef.current.state.doc.toString()) {
      viewRef.current.dispatch({
        changes: { from: 0, to: viewRef.current.state.doc.length, insert: initialCode },
      });
    }
  }, [initialCode]);

  return <div ref={editorRef} className="h-full" style={{ border: 'none' }} />;
};

export default Editor;