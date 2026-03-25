// ──────── TEXT MANAGER ────────
// Handles text rendering logic for beatmap titles and other text elements.

function renderBeatmapTitle() {
    // New title display logic
    let titleLines = [];
    const canvasHeight = canvas.height;
    const canvasWidth = canvas.width;
    
    // Set initial font size to 80% of canvas height
    let fontSize = canvasHeight * 0.8;
    const maxWidth = canvasWidth * 0.3;
    
    // Check if title fits within max width at current font size
    ctx.font = `bold ${fontSize}px Arial`;
    const textWidth = ctx.measureText(mapTitle).width;
    
    // If title doesn't fit, reduce font size until it fits or reaches minimum
    if (textWidth > maxWidth) {
        // Calculate minimum font size (80% canvas height / 2)
        const minFontSize = (canvasHeight * 0.8) / 2;
        
        // Use binary search to find optimal font size
        let low = minFontSize;
        let high = fontSize;
        let optimalFontSize = low;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            ctx.font = `bold ${mid}px Arial`;
            const testWidth = ctx.measureText(mapTitle).width;
            
            if (testWidth <= maxWidth) {
                optimalFontSize = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        
        fontSize = optimalFontSize;
        
        // If we still exceed max width, split into multiple lines
        if (textWidth > maxWidth) {
            // Use greedy word wrapping to split text
            titleLines = wrapText(mapTitle, fontSize, maxWidth);
            
            // If we have multiple lines, adjust font size to fit
            if (titleLines.length > 1) {
                // Calculate new font size based on number of lines and ensure it fits within 80% height
                const totalHeight = titleLines.length * fontSize * 1.2;
                if (totalHeight > canvasHeight * 0.8) {
                    // Adjust font size to fit within 80% height
                    const newFontSize = (canvasHeight * 0.8) / (titleLines.length * 1.2);
                    fontSize = Math.min(fontSize, newFontSize);
                }
            }
        }
    } else {
        titleLines = [mapTitle];
    }
    
    // Final font size adjustment to ensure text fits
    ctx.font = `bold ${fontSize}px Arial`;
    
    // If we have multiple lines, check if they fit within 80% height
    if (titleLines.length > 1) {
        const totalHeight = titleLines.length * fontSize * 1.2;
        if (totalHeight > canvasHeight * 0.8) {
            // Reduce font size to fit within height constraint
            const newFontSize = (canvasHeight * 0.8) / (titleLines.length * 1.2);
            fontSize = newFontSize;
            ctx.font = `bold ${fontSize}px Arial`;
        }
    }
    
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    
    // Calculate total height for positioning
    const totalHeight = titleLines.length * fontSize * 1.2;
    const startY = TITLE_Y - (totalHeight / 2) + fontSize * 0.6;
    
    for (let i = 0; i < titleLines.length; i++) {
        ctx.fillText(titleLines[i], 15, startY + (i * fontSize * 1.2));
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