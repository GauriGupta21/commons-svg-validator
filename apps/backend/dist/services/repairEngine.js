"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repairSVG = repairSVG;
const svgo_1 = require("svgo");
function applyFix(content, pattern, replacement, label, fixes) {
    const next = content.replace(pattern, replacement);
    if (next !== content && !fixes.includes(label))
        fixes.push(label);
    return next;
}
function removeScripts(svg, fixes) {
    return applyFix(svg, /<script[\s\S]*?>[\s\S]*?<\/script\s*>/gi, "", "Removed script tags", fixes);
}
function removeForeignObject(svg, fixes) {
    return applyFix(svg, /<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject\s*>/gi, "", "Removed foreignObject tags", fixes);
}
function removeIframes(svg, fixes) {
    return applyFix(svg, /<iframe[\s\S]*?>[\s\S]*?<\/iframe\s*>/gi, "", "Removed iframe tags", fixes);
}
function removeEmbeds(svg, fixes) {
    return applyFix(svg, /<embed[\s\S]*?\/?>/gi, "", "Removed embed tags", fixes);
}
function removeObjects(svg, fixes) {
    return applyFix(svg, /<object[\s\S]*?>[\s\S]*?<\/object\s*>/gi, "", "Removed object tags", fixes);
}
function removeMetadataTags(svg, fixes) {
    return applyFix(svg, /<metadata[\s\S]*?>[\s\S]*?<\/metadata\s*>/gi, "", "Removed metadata tags", fixes);
}
function removeEditorMetadata(svg, fixes) {
    let next = svg
        .replace(/<inkscape:[^>]*>[\s\S]*?<\/inkscape:[^>]*>/gi, "")
        .replace(/<sodipodi:[^>]*>[\s\S]*?<\/sodipodi:[^>]*>/gi, "")
        .replace(/\s+xmlns:inkscape="[^"]*"/gi, "")
        .replace(/\s+xmlns:sodipodi="[^"]*"/gi, "")
        .replace(/\s+xmlns:adobe="[^"]*"/gi, "")
        .replace(/\s+xmlns:dc="[^"]*"/gi, "")
        .replace(/\s+xmlns:cc="[^"]*"/gi, "")
        .replace(/\s+xmlns:rdf="[^"]*"/gi, "")
        .replace(/\s+inkscape:[a-z-]+="[^"]*"/gi, "")
        .replace(/\s+sodipodi:[a-z-]+="[^"]*"/gi, "");
    if (next !== svg)
        fixes.push("Removed editor metadata (Inkscape/Sodipodi/Adobe)");
    return next;
}
function removeExternalReferences(svg, fixes) {
    let next = svg.replace(/\s+xlink:href="(?!#)[^"]*"/gi, "");
    next = next.replace(/(<(?!image)[a-z]+[^>]*)\s+href="(?!#)[^"]*"/gi, "$1");
    if (next !== svg)
        fixes.push("Removed external URL references");
    return next;
}
function removeDangerousHandlers(svg, fixes) {
    return applyFix(svg, /\s+on[a-z]+="[^"]*"/gi, "", "Removed inline event handlers", fixes);
}
function addViewBox(svg, fixes) {
    if (/viewBox\s*=/i.test(svg))
        return svg;
    const wMatch = svg.match(/<svg[^>]*\s+width\s*=\s*["']?([\d.]+)/i);
    const hMatch = svg.match(/<svg[^>]*\s+height\s*=\s*["']?([\d.]+)/i);
    if (!wMatch || !hMatch)
        return svg;
    const w = wMatch[1];
    const h = hMatch[1];
    const next = svg.replace(/(<svg\b[^>]*)(>)/i, `$1 viewBox="0 0 ${w} ${h}"$2`);
    if (next !== svg)
        fixes.push(`Added viewBox (0 0 ${w} ${h})`);
    return next;
}
function removeEmptyGroups(svg, fixes) {
    let current = svg;
    for (let i = 0; i < 10; i++) {
        const next = current.replace(/<g(\s[^>]*)?\s*>\s*<\/g>/gi, "");
        if (next === current)
            break;
        current = next;
    }
    if (current !== svg)
        fixes.push("Removed empty groups");
    return current;
}
function removeComments(svg, fixes) {
    return applyFix(svg, /<!--[\s\S]*?-->/g, "", "Removed comments", fixes);
}
function minify(svg, fixes) {
    // Skip SVGO entirely if SVG appears malformed (no closing tag)
    if (!/<\/svg\s*>/i.test(svg))
        return svg;
    try {
        const result = (0, svgo_1.optimize)(svg, {
            multipass: true,
            plugins: [
                "cleanupAttrs",
                "removeUselessDefs",
                "removeEmptyAttrs",
                "removeUselessStrokeAndFill",
                "convertColors",
                "convertTransform",
                "mergePaths",
                "sortAttrs",
            ],
        });
        if (result.data !== svg)
            fixes.push("Minified SVG");
        return result.data;
    }
    catch {
        // SVGO failed — return unminified, don't crash
        return svg;
    }
}
function repairSVG(content) {
    const fixes = [];
    let svg = content;
    svg = removeScripts(svg, fixes);
    svg = removeForeignObject(svg, fixes);
    svg = removeIframes(svg, fixes);
    svg = removeEmbeds(svg, fixes);
    svg = removeObjects(svg, fixes);
    svg = removeMetadataTags(svg, fixes);
    svg = removeEditorMetadata(svg, fixes);
    svg = removeExternalReferences(svg, fixes);
    svg = removeDangerousHandlers(svg, fixes);
    svg = addViewBox(svg, fixes);
    svg = removeEmptyGroups(svg, fixes);
    svg = removeComments(svg, fixes);
    svg = minify(svg, fixes);
    return {
        content: svg,
        report: {
            repaired: fixes.length > 0,
            fixesApplied: fixes,
        },
    };
}
