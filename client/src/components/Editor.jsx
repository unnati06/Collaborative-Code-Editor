import React, { useEffect, useRef } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';
import { getLanguageExtension } from './languages'; // Your language helper

// Key Fix: These must be outside the component to persist across re-renders.
const languageCompartment = new Compartment();

const Editor = ({ language, onCodeChange, initialCode }) => {
    const editorRef = useRef(null);
    const viewRef = useRef(null); // Ref to hold the EditorView instance

    // This effect initializes the editor ONCE
    useEffect(() => {
        // Key Fix: Check if the view is already initialized to prevent re-creation
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
                            onCodeChange(update.state.doc.toString());
                        }
                    }),
                ],
            });

            const view = new EditorView({
                state: startState,
                parent: editorRef.current,
            });
            
            // Key Fix: Store the created view instance in our ref
            viewRef.current = view;
        }

        // Cleanup function to destroy the view when the component unmounts
        return () => {
            if (viewRef.current) {
                viewRef.current.destroy();
                viewRef.current = null;
            }
        };
    }, []); // Empty dependency array ensures this runs only ONCE

    // This effect syncs incoming code changes from the server
    useEffect(() => {
        if (viewRef.current && initialCode !== viewRef.current.state.doc.toString()) {
            viewRef.current.dispatch({
                changes: {
                    from: 0,
                    to: viewRef.current.state.doc.length,
                    insert: initialCode,
                },
            });
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

export default Editor;