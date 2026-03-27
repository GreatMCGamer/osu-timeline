/**
 * Generates slider colors based strictly on passed-in skin/combo settings.
 */
function getSliderStyles(trackRgb, borderRgb, isMissed = false) {
    let [r, g, b] = trackRgb || [255, 255, 255];
    // Use the provided skin border color, fallback to white if undefined
    let border = borderRgb || [255, 255, 255]; 
    let alpha = 0.85;
    
    if (isMissed) {
        const avg = (r + g + b) / 3;
        r = g = b = avg * 0.5; // Darken
        border = [100, 100, 100]; // Dim missed border
        alpha = 0.35;
    }

    // Standard skin logic: slightly brighten the base color for the center glow
    const highlight = [
        Math.min(255, r + 90), 
        Math.min(255, g + 90), 
        Math.min(255, b + 90)
    ];

    return {
        border: `rgb(${border.join(',')})`,
        trackBaseRgb: `${r},${g},${b}`,
        trackHighlightRgb: `${highlight.join(',')}`,
        alpha: alpha
    };
}