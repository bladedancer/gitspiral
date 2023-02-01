import { createContext, useContext, useEffect, useState, useCallback } from 'react';

export const CommitsContext = createContext({
    commits: {},
    setCommits: () => {}
});

export const CommitsProvider = CommitsContext.Provider;

export function useCommitsContext() {
    const context = useContext(CommitsContext);
    if (context == null) {
        throw new Error("No context provided: useCommitsContext() can only be used in a descendant of <App>");
    }
    return context;
}