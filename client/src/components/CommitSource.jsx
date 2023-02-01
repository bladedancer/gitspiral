import React, { useState, useEffect, useMemo } from "react";
import { useCommitsContext } from "./hooks/useCommits";

const CommitSource = ({ children }) => {
    const { commits, setCommits } = useCommitsContext();

    // Load Commits
    useEffect(async () => {
        const response = await fetch(`/api/data?repo=${commits.repo}&folder=${commits.folder}`);
        // TODO error handling
        
        console.log(response);
        // Fill in the gaps
        let counts = await response.json();

        if (Object.keys(counts) !== 0) {
            // Zero out the missing dates.
            let first = Object.keys(counts).map(Date.parse).reduce((pre, cur) => {
                return pre > cur ? cur : pre;
            });
            let last = Object.keys(counts).map(Date.parse).reduce((pre, cur) => {
                return pre < cur ? cur : pre;
            });
            
            let d = new Date(first);
            for (let d = new Date(first); d.getTime() <= last; d.setDate(d.getDate() + 1)) {
                let dateStr = d.toISOString().split('T')[0]
                if (!counts[dateStr]) {
                    counts[dateStr] = 0;
                }
            }
        }
        const update = {
            ...commits,
            counts
        };
        setCommits(update);        
    }, [setCommits]); // TODO SEPARATE STATE


    // TODO - render path/folder edit controls.
  return (
    <>{children}</>
  );
};

export default CommitSource;
