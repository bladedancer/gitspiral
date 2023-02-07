import React, { useState, useMemo } from 'react';
import CommitSpiral from './CommitSpiral.jsx';
import CommitSource from './CommitSource.jsx';
import { CommitsProvider } from './hooks/useCommits.js';
import ZoomControl from './controls/ZoomControl.jsx';
import ControlsContainer from './controls/ControlsContainer.jsx';

const App = () => {
    const [commits, setCommits] = useState({
        //repo: "/home/gavin/work/api-server",
        //repo: "/home/gavin/github/envoy",
        repo: "/home/gavin/work/vordel",
        //folder: "src/native",
        folder: "",
        counts: {}
    });
    const context = useMemo(() => ({ commits, setCommits }), [commits]);

    return (
        <CommitsProvider value={context}>
            <CommitSource />
            <CommitSpiral config={{width: 4000, height: 4000, 
                margin: {top: 10, right: 10, bottom: 10, left: 10}}}>
            </CommitSpiral>
            <ControlsContainer position={"bottom-right"}>
                <ZoomControl />
            </ControlsContainer>
        </CommitsProvider>
  );
}

export default App;
