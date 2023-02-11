import React, { useEffect, useState, useRef, useCallback } from 'react';
import { saveAs } from 'file-saver';
import { FiRefreshCw, FiDownload } from 'react-icons/fi';
import './exportcontrol.css';
import { useLayoutEventContext } from '../hooks/useLayoutEventContext';

const ExportControl = () => {
    const [busy, setBusy] = useState(false);
    const { layoutEvent } = useLayoutEventContext();
    const layoutEventRef = useRef(layoutEvent);

    // Update layout ref for the events.
    useEffect(() => {
        layoutEventRef.current = layoutEvent;
    }, [layoutEvent]);

    const exportGraph = useCallback(async () => {
        setBusy(true);

        const dataBlob = await layoutEventRef.current.toImage();
        saveAs(dataBlob, 'commits.png'); // FileSaver.js function
        setBusy(false);
    }, []);

    return (
        <>
            <div className="react-control export-control">
                <button onClick={exportGraph} disabled={busy}>
                    {busy && <FiRefreshCw />}
                    {!busy && <FiDownload />}
                    Export PNG
                </button>
            </div>
        </>
    );
};

export default ExportControl;
