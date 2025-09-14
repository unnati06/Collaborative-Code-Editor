import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';

// Install these packages:
// npm install @codemirror/lang-python @codemirror/lang-cpp @codemirror/lang-java

export const getLanguageExtension = (language) => {
    switch (language) {
        case 'python':
            return python();
        case 'cpp':
            return cpp();
        case 'java':
            return java();
        case 'javascript':
        default:
            return javascript();
    }
};
