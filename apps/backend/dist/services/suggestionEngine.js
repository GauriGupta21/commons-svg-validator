"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSuggestions = generateSuggestions;
// ─── Rule Table ───────────────────────────────────────────────────────────────
// Rules are checked top-to-bottom; first match wins for deduplication key.
// Keep more specific rules before generic catch-alls.
const RULES = [
    // ── Security ──────────────────────────────────────────────────────────────
    {
        match: (i) => i.category === "Security" && /script/i.test(i.message),
        title: "Remove <script> tags",
        description: "Script tags are forbidden on Wikimedia Commons. Strip all <script> elements before uploading. " +
            "The sanitizer in this tool does this automatically — use the sanitized download.",
        priority: "high",
    },
    {
        match: (i) => i.category === "Security" && /handler|on\w+=/i.test(i.message),
        title: "Remove inline event handlers",
        description: "Attributes like onclick, onload, and onmouseover execute JavaScript and are rejected by Commons. " +
            "Remove all on* attributes from every element.",
        priority: "high",
    },
    {
        match: (i) => i.category === "Security" && /foreignObject/i.test(i.message),
        title: "Remove <foreignObject> elements",
        description: "<foreignObject> can embed arbitrary HTML including scripts. Commons strips it during upload. " +
            "Replace embedded HTML content with native SVG equivalents (<text>, <tspan>, shapes).",
        priority: "high",
    },
    {
        match: (i) => i.category === "Security" && /external|href|xlink/i.test(i.message),
        title: "Remove external URL references",
        description: "Links to external domains (xlink:href, href) can be used for tracking or injection attacks. " +
            "Inline all required resources or remove the references entirely.",
        priority: "high",
    },
    {
        match: (i) => i.category === "Security",
        title: "Resolve security issue",
        description: "This file contains a security-related issue that will cause Commons to reject or sanitize the upload. " +
            "Use the sanitized download from this tool which removes known security violations automatically.",
        priority: "high",
    },
    // ── Structure ─────────────────────────────────────────────────────────────
    {
        match: (i) => i.category === "Structure" && /viewBox/i.test(i.message),
        title: 'Add a viewBox attribute to the <svg> root',
        description: 'Without viewBox, the image does not scale correctly across different render sizes. ' +
            'Add viewBox="0 0 W H" matching your content dimensions, e.g. viewBox="0 0 800 600".',
        priority: "high",
    },
    {
        match: (i) => i.category === "Structure" && /root|<svg>/i.test(i.message),
        title: "Ensure a valid <svg> root element exists",
        description: "Every SVG file must start with an <svg> element as the root. " +
            "Check that the file is well-formed and not missing its opening tag.",
        priority: "high",
    },
    {
        match: (i) => i.category === "Structure" && /xml|parse|fatal/i.test(i.message),
        title: "Fix XML parse errors",
        description: "The file contains malformed XML (unclosed tags, invalid characters, or bad encoding). " +
            "Open the file in an SVG editor like Inkscape or run it through an XML validator to locate and fix the errors.",
        priority: "high",
    },
    {
        match: (i) => i.category === "Structure",
        title: "Fix structural issues in the SVG",
        description: "Structural problems can cause rendering failures or Commons rejection. " +
            "Open the file in Inkscape and use File → Clean Up Document to resolve common structural issues.",
        priority: "medium",
    },
    // ── Compatibility ─────────────────────────────────────────────────────────
    {
        match: (i) => i.category === "Compatibility" && /filter/i.test(i.message),
        title: "Replace SVG filters with simpler alternatives",
        description: "SVG filter effects (blur, drop-shadow, etc.) have inconsistent support across Commons renderers. " +
            "Replace them with rasterized equivalents or remove them if decorative only.",
        priority: "medium",
    },
    {
        match: (i) => i.category === "Compatibility" && /animation|animate/i.test(i.message),
        title: "Check animation compatibility",
        description: "SMIL animations (<animate>, <animateTransform>) are not supported in static Commons thumbnails. " +
            "Consider providing a static fallback or converting to CSS animations where supported.",
        priority: "medium",
    },
    {
        match: (i) => i.category === "Compatibility" && /namespace|xmlns/i.test(i.message),
        title: "Clean up non-standard XML namespaces",
        description: "Non-SVG namespaces (e.g. Inkscape, Sodipodi, Adobe) add bloat and may confuse renderers. " +
            "Strip editor-specific namespaces before uploading. The sanitizer handles this automatically.",
        priority: "low",
    },
    {
        match: (i) => i.category === "Compatibility",
        title: "Improve cross-renderer compatibility",
        description: "This issue may cause the SVG to render differently across browsers, Commons thumbnails, or SVG-to-PNG conversion. " +
            "Test the file in Inkscape and in a browser before uploading.",
        priority: "medium",
    },
    // ── Metadata ──────────────────────────────────────────────────────────────
    {
        match: (i) => i.category === "Metadata" && /bloat|large|excess/i.test(i.message),
        title: "Remove metadata bloat",
        description: "Editor metadata (<sodipodi:*>, <inkscape:*>, <dc:*>, <cc:*>, <rdf:*>) can double file size. " +
            "Use Inkscape → File → Clean Up Document, or run the file through SVGO before uploading.",
        priority: "low",
    },
    {
        match: (i) => i.category === "Metadata" && /license|rights|author/i.test(i.message),
        title: "Add or correct license metadata",
        description: "Wikimedia Commons requires a clear license. Add an appropriate <dc:license> or <cc:license> RDF block, " +
            "or set the license through the Commons upload wizard instead.",
        priority: "medium",
    },
    {
        match: (i) => i.category === "Metadata",
        title: "Clean up SVG metadata",
        description: "Excess or malformed metadata increases file size and may cause upload warnings. " +
            "Use SVGO with the cleanupAttrs and removeMetadata plugins to strip unnecessary metadata.",
        priority: "low",
    },
    // ── Optimization ──────────────────────────────────────────────────────────
    {
        match: (i) => i.category === "Optimization" && /embed|raster|png|jpeg|base64/i.test(i.message),
        title: "Replace embedded raster images with vector paths",
        description: "Base64-encoded raster images bloat the SVG and defeat the purpose of a vector format. " +
            "Trace the image to vector paths using Inkscape (Path → Trace Bitmap) or upload the raster image separately.",
        priority: "medium",
    },
    {
        match: (i) => i.category === "Optimization" && /path|complex|node/i.test(i.message),
        title: "Simplify complex paths",
        description: "Paths with very high node counts slow down rendering and increase file size. " +
            "Use Inkscape → Path → Simplify (Ctrl+L) to reduce node count while preserving visual quality.",
        priority: "low",
    },
    {
        match: (i) => i.category === "Optimization" && /size|large|file/i.test(i.message),
        title: "Reduce file size",
        description: "Large SVG files are slow to load and may hit Commons upload limits. " +
            "Run the file through SVGO (https://svgo.dev) or use Inkscape's 'Optimized SVG' export option.",
        priority: "medium",
    },
    {
        match: (i) => i.category === "Optimization" && /text|font/i.test(i.message),
        title: "Convert text to paths or use web-safe fonts",
        description: "Text elements that rely on non-standard fonts may render incorrectly on Commons servers. " +
            "Convert text to paths (Inkscape → Path → Object to Path) or use a standard SVG font.",
        priority: "medium",
    },
    {
        match: (i) => i.category === "Optimization",
        title: "Optimize the SVG for Commons",
        description: "This file has optimization opportunities that will improve load time and render quality. " +
            "Run it through SVGO or use Inkscape's built-in optimizer before uploading.",
        priority: "low",
    },
];
// ─── Priority Sort Order ──────────────────────────────────────────────────────
const PRIORITY_ORDER = {
    high: 0,
    medium: 1,
    low: 2,
};
// ─── Engine ───────────────────────────────────────────────────────────────────
/**
 * Generates a deduplicated, priority-sorted list of actionable suggestions
 * from a set of validation issues.
 */
function generateSuggestions(issues) {
    const seen = new Set();
    const suggestions = [];
    for (const issue of issues) {
        for (const rule of RULES) {
            if (!rule.match(issue))
                continue;
            // Deduplicate by title — one suggestion per unique fix action
            if (seen.has(rule.title))
                break;
            seen.add(rule.title);
            suggestions.push({
                title: rule.title,
                description: rule.description,
                priority: rule.priority,
            });
            break; // first matching rule wins per issue
        }
    }
    // Sort: high → medium → low
    suggestions.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    return suggestions;
}
