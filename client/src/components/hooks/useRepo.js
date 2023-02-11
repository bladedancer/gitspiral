import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react';

export const RepoContext = createContext({
    repo: '',
    folder: '',
    all: false,
});

export const RepoProvider = RepoContext.Provider;

export function useRepoContext() {
    const context = useContext(RepoContext);
    if (context == null) {
        throw new Error(
            'No context provided: useRepoContext() can only be used in a descendant of <App>'
        );
    }
    return context;
}
