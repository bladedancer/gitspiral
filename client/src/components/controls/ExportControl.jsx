import React, { useEffect, useState, useRef, useCallback } from "react";
import { saveAs } from 'file-saver';
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import * as d3 from "d3";
import './exportcontrol.css';
import { useLayoutContext } from "../hooks/useLayout";


// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString(svgNode) {
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    var cssStyleText = getCSSStyles(svgNode);
    appendCSS(cssStyleText, svgNode);

    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix
    return svgString;

    function getCSSStyles(parentElement) {
        var selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push('#' + parentElement.id);
        for (var c = 0; c < parentElement.classList.length; c++)
            if (!contains('.' + parentElement.classList[c], selectorTextArr))
                selectorTextArr.push('.' + parentElement.classList[c]);

        // Add Children element Ids and Classes to the list
        var nodes = parentElement.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
            var id = nodes[i].id;
            if (!contains('#' + id, selectorTextArr))
                selectorTextArr.push('#' + id);

            var classes = nodes[i].classList;
            for (var c = 0; c < classes.length; c++)
                if (!contains('.' + classes[c], selectorTextArr))
                    selectorTextArr.push('.' + classes[c]);
        }

        // Extract CSS Rules
        var extractedCSSText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
            var s = document.styleSheets[i];

            try {
                if (!s.cssRules) continue;
            } catch (e) {
                if (e.name !== 'SecurityError') throw e; // for Firefox
                continue;
            }

            var cssRules = s.cssRules;
            for (var r = 0; r < cssRules.length; r++) {
                if (contains(cssRules[r].selectorText, selectorTextArr))
                    extractedCSSText += cssRules[r].cssText;
            }
        }


        return extractedCSSText;

        function contains(str, arr) {
            return arr.indexOf(str) === -1 ? false : true;
        }

    }

    function appendCSS(cssText, element) {
        var styleElement = document.createElement("style");
        styleElement.setAttribute("type", "text/css");
        styleElement.innerHTML = cssText;
        var refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore(styleElement, refNode);
    }
}


function svgString2Image(svgString, bbox, format, callback) {
    var format = format ? format : 'png';

    var imgsrc = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    // Increase dpi to 300
    var scaleFactor = 300 / 96;
    canvas.width = Math.ceil(bbox.width * scaleFactor);
    canvas.height = Math.ceil(bbox.height * scaleFactor);
    context.scale(scaleFactor, scaleFactor);

    var image = new Image();
    image.onload = function () {
        context.clearRect(0, 0, bbox.width, bbox.height);
        context.drawImage(image, bbox.x, bbox.y, bbox.width, bbox.height,
            0, 0, bbox.width, bbox.height);

        canvas.toBlob((blob) => {
            var filesize = Math.round(blob.length / 1024) + ' KB';
            callback && callback(blob, filesize);
        });
    };

    image.src = imgsrc;
}


const ExportControl = () => {
    const [busy, setBusy] = useState(false);
    const { layout, setLayout } = useLayoutContext();
    const layoutRef = useRef(layout);

    // Update layout ref for the events.
    useEffect(() => {
        layoutRef.current = layout;
    }, [layout]);

    const exportGraph = useCallback(async () => {
        setBusy(true);

        const svg = d3.select('svg.spiral').node();
        const bbox = svg.getBBox();
        svg.setAttribute("viewBox", `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);

        var svgString = getSVGString(svg);
        svgString2Image( svgString, bbox, 'png', save ); // passes Blob and filesize String to the callback
    
        function save( dataBlob, filesize ){
            saveAs( dataBlob, 'commits.png' ); // FileSaver.js function
        }

        // Trigger re-layout after above resizings
        setLayout({
            ...layoutRef.current
        })
        setBusy(false);
    }, [setLayout, setBusy]);

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
    )
}

export default ExportControl;