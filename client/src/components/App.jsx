import React, { useState, useMemo } from 'react';
import CommitSpiral from './CommitSpiral.jsx';
import CommitSource from './CommitSource.jsx';
import { CommitsProvider } from './hooks/useCommits.js';
import LayoutControl from './controls/LayoutControl.jsx';
import ControlsContainer from './controls/ControlsContainer.jsx';
import { LayoutProvider } from './hooks/useLayout.js';

const App = () => {
    const [commits, setCommits] = useState({
        //repo: "/home/gavin/work/api-server",
        //repo: "/home/gavin/github/envoy",
        repo: "/home/gavin/github/apiserver-viz-v2",
        //folder: "src/native",
        folder: "",
        all: true,
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

    const context = useMemo(() => ({ commits, setCommits }), [commits]);
    const layoutContext = useMemo(() => ({ layout, setLayout }), [layout]);

    return (
        <LayoutProvider value={layoutContext}>
            <CommitsProvider value={context}>
                <CommitSource />
                <CommitSpiral />
                <ControlsContainer position={"bottom-right"}>
                    <LayoutControl />
                </ControlsContainer>
            </CommitsProvider>
        </LayoutProvider>
  );
}

export default App;
