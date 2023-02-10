import React, { useState, useMemo } from 'react';
import CommitSpiral from './CommitSpiral.jsx';
import CommitSource from './CommitSource.jsx';
import { CommitsProvider } from './hooks/useCommits.js';
import LayoutControl from './controls/LayoutControl.jsx';
import ControlsContainer from './controls/ControlsContainer.jsx';
import { LayoutProvider } from './hooks/useLayout.js';
import RepoControl from './controls/RepoControl.jsx';
import { RepoProvider } from './hooks/useRepo.js';

const App = () => {
    const [commits, setCommits] = useState({
        counts: {}
    });

    const { innerWidth: width, innerHeight: height } = window;
    const [layout, setLayout] = useState({
        width,
        height,
        center: {
          x: width / 2,
          y: height / 2
        },
        zoom: 1
    });

    const [repo, setRepo] = useState({
        repo: "",
        folder: "",
        all: false,
    });

    const context = useMemo(() => ({ commits, setCommits }), [commits]);
    const layoutContext = useMemo(() => ({ layout, setLayout }), [layout]);
    const repoContext = useMemo(() => ({ repo, setRepo }), [repo]);

    return (
        <LayoutProvider value={layoutContext}>
            <RepoProvider value={repoContext}>
                <CommitsProvider value={context}>
                    <CommitSource />
                    <CommitSpiral />

                    <ControlsContainer position={"top-left"}>
                        <RepoControl />
                    </ControlsContainer>
                    <ControlsContainer position={"bottom-right"}>
                        <LayoutControl />
                    </ControlsContainer>
                </CommitsProvider>
            </RepoProvider>
        </LayoutProvider>
  );
}

export default App;
