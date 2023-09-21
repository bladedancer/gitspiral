import React, { useState, useMemo } from 'react';
import SpiralCanvas from './SpiralCanvas.jsx';
import CommitSource from './CommitSource.jsx';
import { CommitsProvider } from './hooks/useCommits.js';
import LayoutControl from './controls/LayoutControl.jsx';
import ControlsContainer from './controls/ControlsContainer.jsx';
import RepoControl from './controls/RepoControl.jsx';
import { RepoProvider } from './hooks/useRepo.js';
import ExportControl from './controls/ExportControl.jsx';
import { LayoutEventProvider } from './hooks/useLayoutEventContext.js';

const App = () => {
    const [commits, setCommits] = useState({
        counts: {},
        chart: {},
    });
    const commitsContext = useMemo(() => ({ commits, setCommits }), [commits]);

    const [repo, setRepo] = useState({
        repo: '',
        folder: '',
        all: false,
        branch: ''
    });
    const repoContext = useMemo(() => ({ repo, setRepo }), [repo]);

    const [layoutEvent, setLayoutEvent] = useState();
    const layoutEventContext = useMemo(
        () => ({ layoutEvent, setLayoutEvent }),
        [layoutEvent]
    );

    return (
        <LayoutEventProvider value={layoutEventContext}>
            <RepoProvider value={repoContext}>
                <CommitsProvider value={commitsContext}>
                    
                    <CommitSource />
                    <SpiralCanvas />

                    <ControlsContainer position={'top-left'}>
                        <RepoControl />
                        <ExportControl />
                    </ControlsContainer>
                    <ControlsContainer position={'bottom-right'}>
                        <LayoutControl />
                    </ControlsContainer>
                </CommitsProvider>
            </RepoProvider>
        </LayoutEventProvider>
    );
};

export default App;
