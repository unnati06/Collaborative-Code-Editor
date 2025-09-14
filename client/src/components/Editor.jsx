import React, { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers, highlightActiveLine } from '@codemirror/view';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { getLanguageExtension } from './languages';

// Create a compartment for the language extension
let languageCompartment = new Compartment();

const Editor = ({ roomId, onCodeChange, initialCode, language }) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  // This effect initializes the editor
  useEffect(() => {
    if (editorRef.current && !viewRef.current) {
      const state = EditorState.create({
        doc: initialCode || '// Start coding here...',
        extensions: [
          lineNumbers(),
          highlightActiveLine(),
          bracketMatching(),
          indentOnInput(),
          closeBrackets(),
          syntaxHighlighting(defaultHighlightStyle),
          languageCompartment.of(getLanguageExtension(language)),
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
        viewRef.current = null;
      };
    }
  }, [editorRef]); // Only run once on mount

  // This effect handles language changes
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: languageCompartment.reconfigure(getLanguageExtension(language)),
      });
    }
  }, [language]);

  // This effect syncs code from the server
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