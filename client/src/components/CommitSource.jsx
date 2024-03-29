import React, { useEffect } from 'react';
import { useCommitsContext } from './hooks/useCommits';
import { useRepoContext } from './hooks/useRepo';

const CommitSource = ({ children }) => {
    const { commits, setCommits } = useCommitsContext();
    const { repo, setRepo } = useRepoContext();

    // Load Commits
    useEffect(async () => {
        const update = { ...commits };
        if (repo.repo) {
            const response = await fetch(
                `/api/data?repo=${repo.repo}&folder=${repo.folder}&branch=${repo.branch}&all=${
                    repo.all ? 'true' : 'false'
                }`
            );

            if (response.status !== 200) {
                // TODO: Message banner
                console.error(response);
                console.error(await response.text());
            } else {
                // Fill in the gaps - so that there is data for every day
                let counts = await response.json();

                if (Object.keys(counts) !== 0) {
                    // Zero out the missing dates.
                    let first = Object.keys(counts)
                        .map(Date.parse)
                        .reduce((pre, cur) => {
                            return pre > cur ? cur : pre;
                        });
                    let last = Object.keys(counts)
                        .map(Date.parse)
                        .reduce((pre, cur) => {
                            return pre < cur ? cur : pre;
                        });

                    let d = new Date(first);
                    for (
                        let d = new Date(first);
                        d.getTime() <= last;
                        d.setDate(d.getDate() + 1)
                    ) {
                        let dateStr = d.toISOString().split('T')[0];
                        if (!counts[dateStr]) {
                            counts[dateStr] = 0;
                        }
                    }
                }
                update.counts = counts;
            }
        }
        setCommits(update);
    }, [repo, setCommits]);

    return <>{children}</>;
};

export default CommitSource;
