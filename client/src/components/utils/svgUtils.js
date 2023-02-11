function getCSSStyles(parentElement) {
    let selectorTextArr = [];

    // Add Parent element Id and Classes to the list
    selectorTextArr.push('#' + parentElement.id);
    for (let c = 0; c < parentElement.classList.length; c++)
        if (!contains('.' + parentElement.classList[c], selectorTextArr))
            selectorTextArr.push('.' + parentElement.classList[c]);

    // Add Children element Ids and Classes to the list
    let nodes = parentElement.getElementsByTagName('*');
    for (let i = 0; i < nodes.length; i++) {
        let id = nodes[i].id;
        if (!contains('#' + id, selectorTextArr))
            selectorTextArr.push('#' + id);

        let classes = nodes[i].classList;
        for (let c = 0; c < classes.length; c++)
            if (!contains('.' + classes[c], selectorTextArr))
                selectorTextArr.push('.' + classes[c]);
    }

    // Extract CSS Rules
    let extractedCSSText = '';
    for (let i = 0; i < document.styleSheets.length; i++) {
        let s = document.styleSheets[i];

        try {
            if (!s.cssRules) continue;
        } catch (e) {
            if (e.name !== 'SecurityError') throw e; // for Firefox
            continue;
        }

        let cssRules = s.cssRules;
        for (let r = 0; r < cssRules.length; r++) {
            if (contains(cssRules[r].selectorText, selectorTextArr))
                extractedCSSText += cssRules[r].cssText;
        }
    }

    return extractedCSSText;
}

function appendCSS(cssText, element) {
    let styleElement = document.createElement('style');
    styleElement.setAttribute('type', 'text/css');
    styleElement.innerHTML = cssText;
    let refNode = element.hasChildNodes() ? element.children[0] : null;
    element.insertBefore(styleElement, refNode);
}

function contains(str, arr) {
    return arr.indexOf(str) === -1 ? false : true;
}

// Get the SVG node as a string with embedded styles.
export const getSVGString = (svgNode) => {
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    let cssStyleText = getCSSStyles(svgNode);
    appendCSS(cssStyleText, svgNode);

    let serializer = new XMLSerializer();
    let svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix
    return svgString;

};

// Returns a promise that when resolved returns the image src as a blob
export const svgString2Image = (svgString, bbox, format) => {
    format = format || 'png';

    let imgsrc =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(svgString))); // Convert SVG string to data URL

    let canvas = document.createElement('canvas');
    let context = canvas.getContext('2d');

    // Increase dpi to 300
    let scaleFactor = 300 / 96;
    canvas.width = Math.ceil(bbox.width * scaleFactor);
    canvas.height = Math.ceil(bbox.height * scaleFactor);
    context.scale(scaleFactor, scaleFactor);

    let image = new Image();
    const contentPromise = new Promise((resolve, reject) => {
        image.onload = function () {
            context.clearRect(0, 0, bbox.width, bbox.height);
            context.drawImage(
                image,
                bbox.x,
                bbox.y,
                bbox.width,
                bbox.height,
                0,
                0,
                bbox.width,
                bbox.height
            );
            canvas.toBlob(resolve);
        };

        image.src = imgsrc;
    });

    return contentPromise;
}

export const toPng = (svg) => {
    let svgString = getSVGString(svg);
    const bbox = svg.getBBox();
    return svgString2Image(svgString, bbox, 'png');
}
