import React, { useEffect, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { lineNumbers, highlightActiveLine } from '@codemirror/view';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { closeBrackets } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';


const CodeEditor = () => {
  const editorRef = useRef(null);
  let viewRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      const state = EditorState.create({
        doc: 'console.log("Hello, CodeMirror 6!");',
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
  }, []);

  return <div ref={editorRef} style={{ border: 'none', minHeight: '300px' }} />;
};

export default CodeEditor;
