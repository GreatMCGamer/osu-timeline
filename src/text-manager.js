// ──────── TEXT MANAGER ────────
// Handles text rendering logic for beatmap titles and other text elements.

function renderBeatmapTitle() {
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    const maxWidth = canvasWidth * 0.3;
    const maxHeight = canvasHeight * 0.8;
    const lineHeightFactor = 1.2;

    let fontSize = canvasHeight * 0.8; // start big
    let bestLines = [mapTitle];
    let bestFontSize = fontSize;

    // Binary search for the largest font that fits after wrapping
    let low = 10;                    // reasonable minimum
    let high = fontSize;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        ctx.font = `bold ${mid}px Arial`;

        const lines = wrapText(mapTitle, mid, maxWidth);           // ← wrap at this size
        const totalH = lines.length * mid * lineHeightFactor;

        if (totalH <= maxHeight) {
            // feasible – try bigger
            bestLines = lines;
            bestFontSize = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    fontSize = bestFontSize;
    titleLines = bestLines;

    // Now render with the optimal size/lines
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';

    const totalHeight = titleLines.length * fontSize * lineHeightFactor;
    const startY = Y_CENTERED - (totalHeight / 2) + fontSize * 0.6;

    for (let i = 0; i < titleLines.length; i++) {
        ctx.fillText(titleLines[i], 15, startY + i * fontSize * lineHeightFactor);
    }

    ctx.shadowBlur = 0;
}

// Greedy word wrapping function
function wrapText(text, fontSize, maxWidth) {
    const lines = [];
    const words = text.split(' ');
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        
        // Measure the test line
        ctx.font = `bold ${fontSize}px Arial`;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth <= maxWidth && testLine.length > 0) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
            }
            currentLine = word;
        }
    }
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    return lines;
}