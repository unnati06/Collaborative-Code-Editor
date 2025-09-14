import React, { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { getLanguageExtension } from './languages'; // Your language helper

const languageCompartment = new Compartment();

const Editor = ({ language, onCodeChange, initialCode }) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null);
    
    // Good Practice: Use a ref for the callback to avoid stale closures
    const onCodeChangeRef = useRef(onCodeChange);
    useEffect(() => {
        onCodeChangeRef.current = onCodeChange;
    }, [onCodeChange]);

    // This effect initializes the editor ONCE
    useEffect(() => {
        if (editorRef.current && !viewRef.current) {
            const startState = EditorState.create({
                doc: initialCode || '',
                extensions: [
                    keymap.of([...defaultKeymap, ...historyKeymap]),
                    history(),
                    oneDark,
                    languageCompartment.of(getLanguageExtension(language)),
                    EditorView.updateListener.of((update) => {
                        if (update.docChanged) {
                            // Call the latest version of the callback from the ref
                            onCodeChangeRef.current(update.state.doc.toString());
                        }
                    }),
                ],
            });

            const view = new EditorView({
                state: startState,
                parent: editorRef.current,
            });
            
            viewRef.current = view;
        }

        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only ONCE

    // This effect syncs incoming code changes from props (e.g., from a server)
    useEffect(() => {
        const view = viewRef.current;
        if (view && initialCode !== view.state.doc.toString()) {
            // FIX: Use state.update to create a transaction that preserves the cursor position
            const transaction = view.state.update({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: initialCode || '',
                },
                // This is the key part that prevents the cursor from jumping
                selection: view.state.selection, 
                // Optionally, ensure the cursor stays in view
                scrollIntoView: true,
            });
            view.dispatch(transaction);
        }
    }, [initialCode]);

    // This effect handles language changes
    useEffect(() => {
        if (viewRef.current) {
            viewRef.current.dispatch({
                effects: languageCompartment.reconfigure(getLanguageExtension(language)),
            });
        }
    }, [language]);

    return <div ref={editorRef} className="h-full w-full" />;
};
//finish
export default Editor;