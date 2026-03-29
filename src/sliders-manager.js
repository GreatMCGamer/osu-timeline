/**
 * Generates slider colors based strictly on passed-in skin/combo settings.
 */

function getSliderTargetY(timestamp, hitTime) {
    let lane0 = false;
    let lane1 = false;
    
    // If the slider hasn't been hit yet, it stays centered
    if (timestamp < hitTime) return Y_CENTERED;

    for (let i = 0; i < keyStrokes.length; i++) {
        const s = keyStrokes[i];
        
        // Filter: Only count keys that started AFTER the slider was hit
        if (s.startTime < hitTime) continue; 
        
        if (s.startTime > timestamp) continue;
        if (s.endTime !== null && s.endTime < timestamp) continue;
        
        if (s.key === 'k1' || s.key === 'm1') lane0 = true;
        else if (s.key === 'k2' || s.key === 'm2') lane1 = true;
    }
    
    const laneDist = KEY_BOX_SPACING / 2;
    if (lane0 && lane1) return Y_CENTERED;
    if (lane0) return Y_CENTERED - laneDist;
    if (lane1) return Y_CENTERED + laneDist;
    return Y_CENTERED;
}

function getSnakyY(note, targetTime) {
    const laneDist = KEY_BOX_SPACING / 2;
    const ySpeed = laneDist / 100; 
    const step = 4; 
    const hitTime = note.startTime; 

    // ──────── REFINED SNAKY LOGIC ────────
    // calculationTime determines how far into the simulation we go.
    // If targetTime is after the miss, we only simulate up to the missTime.
    let calculationTime = targetTime;
    if (note.isMissed) {
        const missTime = note.missedAt || note.startTime;
        calculationTime = Math.min(targetTime, missTime);
    }

    let currentY = Y_CENTERED;

    // Simulate movement only up to the calculationTime (either target or miss)
    for (let t = note.startTime; t <= calculationTime; t += step) {
        const targetY = getSliderTargetY(t, hitTime); 
        const dy = targetY - currentY;
        
        if (Math.abs(dy) > 0.1) {
            const move = ySpeed * step;
            if (Math.abs(dy) <= move) currentY = targetY;
            else currentY += Math.sign(dy) * move;
        }
    }
    return currentY;
}

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
