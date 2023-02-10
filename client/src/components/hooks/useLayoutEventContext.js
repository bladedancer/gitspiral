import { createContext, useContext, useEffect, useState, useCallback } from 'react';


export const LayoutEventContext = createContext({
    move: (x, y) => {},
    resize: (width, height) => {},
    zoomIn: () => {},
    zoomOut: () => {},
    fit: () => {},
    toImage: () => {}
});

export const LayoutEventProvider = LayoutEventContext.Provider;

export function useLayoutEventContext() {
    const context = useContext(LayoutEventContext);
    if (context == null) {
        throw new Error("No context provided: useLayoutEventContext() can only be used in a descendant of <App>");
    }
    return context;
}
