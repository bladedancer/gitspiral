import { createContext, useContext, useEffect, useState, useCallback } from 'react';


export const LayoutContext = createContext({
    width: 0,
    height: 0,
    center: {
      x: 0,
      y: 0
    },
    zoom: 1
});

export const LayoutProvider = LayoutContext.Provider;

export function useLayoutContext() {
    const context = useContext(LayoutContext);
    if (context == null) {
        throw new Error("No context provided: useLayoutContext() can only be used in a descendant of <App>");
    }
    return context;
}
