import React, { useState, useMemo } from 'react';
import CommitSpiral from './CommitSpiral.jsx';
import CommitSource from './CommitSource.jsx';
import { CommitsProvider } from './hooks/useCommits.js';

const App = () => {
    const [commits, setCommits] = useState({
        //repo: "/home/gavin/github/apiserver-viz-v2",
        //repo: "/home/gavin/github/envoy",
        repo: "/home/gavin/work/vordel",
        //folder: "src/native",
        folder: ".",
        counts: {}
    });
    const context = useMemo(() => ({ commits, setCommits }), [commits]);

    return (
        <CommitsProvider value={context}>
            <CommitSource></CommitSource>
            <CommitSpiral config={{width: 4000, height: 4000, 
                margin: {top: 10, right: 10, bottom: 10, left: 10}}}>

            </CommitSpiral>
        </CommitsProvider>
  );
}

export default App;
