import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useCommitsContext } from './hooks/useCommits';
import { useLayoutEventContext } from './hooks/useLayoutEventContext';
import { toPng } from './utils/svgUtils';
import { drawSpiral } from './utils/svgSpiral';
import './spiralcanvas.css';

const SpiralCanvas = ({ children }) => {
    const svgRef = useRef(null);
    const { commits, setCommits } = useCommitsContext();
    const { innerWidth: width, innerHeight: height } = window;
    const [layout, setLayout] = useState({
        width,
        height,
        center: {
            x: width / 2,
            y: height / 2,
        },
        zoom: 1,
    });
    const layoutRef = useRef(layout);
    const { layoutEvent, setLayoutEvent } = useLayoutEventContext();

    useEffect(() => {
        layoutRef.current = layout;
    }, [layout]);

    // Bind the layout events
    useEffect(async () => {
        setLayoutEvent({
            move: (x, y) => {
                setLayout({
                    ...layoutRef.current,
                    center: {
                        x: layoutRef.current.center.x + x,
                        y: layoutRef.current.center.y + y,
                    },
                });
            },
            resize: (width, height) => {
                setLayout({ ...layoutRef.current, width, height });
            },
            zoomIn: () => {
                const zoom = Math.max(layoutRef.current.zoom - 0.1, 0.1);
                setLayout({
                    ...layoutRef.current,
                    zoom,
                });
            },
            zoomOut: () => {
                const zoom = Math.min(layoutRef.current.zoom + 0.1, 2);
                setLayout({
                    ...layoutRef.current,
                    zoom,
                });
            },
            fit: () => {
                const svg = d3.select(svgRef.current).node();
                const bbox = svg.getBBox();

                setLayout({
                    ...layoutRef.current,
                    center: {
                        x: layoutRef.current.width / 2,
                        y: layoutRef.current.height / 2,
                    },
                    zoom: Math.max(
                        Math.ceil((bbox.width / layoutRef.current.width) * 5) /
                            5,
                        Math.ceil(
                            (bbox.height / layoutRef.current.height) * 5
                        ) / 5
                    ),
                });
            },
            toImage: async () => {
                const svg = d3.select(svgRef.current).node();
                return toPng(svg);
            },
        });
    }, [svgRef]);

    // Draw the spiral
    useEffect(async () => {
        const svgEl = d3.select(svgRef.current);
        svgEl.selectAll('*').remove(); // Clear svg content before adding new elements
        var svg = svgEl
            .append('g')
            .attr(
                'transform',
                'translate(' + layout.center.x + ',' + layout.center.y + ')'
            );

        if (Object.keys(commits.counts).length) {
            drawSpiral(svg, commits);
        }
    }, [commits]);

    // Update layout
    useEffect(async () => {
        const svgEl = d3.select(svgRef.current);

        const scaledWidth = layout.width * layout.zoom;
        const scaledHeight = layout.height * layout.zoom;
        const offsetX = (layout.width - scaledWidth) / 2;
        const offsetY = (layout.height - scaledHeight) / 2;

        svgEl
            .attr('width', layout.width)
            .attr('height', layout.height)
            .attr(
                'viewBox',
                `${offsetX} ${offsetY} ${scaledWidth} ${scaledHeight}`
            );

        svgEl
            .select('g')
            .attr(
                'transform',
                'translate(' + layout.center.x + ',' + layout.center.y + ')'
            );
    }, [layout]);

    return (
        <svg
            ref={svgRef}
            className="spiral"
            viewBox={`${0} ${0} ${layout.width} ${layout.height}`}
            width={layout.width}
            height={layout.height}
        />
    );
};

export default SpiralCanvas;
