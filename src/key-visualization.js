// ──────── KEY VISUALIZATION ────────
// Processes and draws the key-press lanes.

function drawKeyVisualization() {
    ctx.lineWidth = KEY_LINE_THICKNESS;
    ctx.lineCap = 'round';
    const gap = 4;
    const radius = KEY_LINE_THICKNESS / 2;
    const maxLineX = playheadX - gap - radius; 

    for (let stroke of keyStrokes) {
        let sTime = stroke.startTime || performance.now();
        let eTime = stroke.endTime !== null ? stroke.endTime : performance.now();
        
        if (eTime < performance.now() - (playheadX / scale + 200)) continue;
        if (sTime > performance.now() + ((canvas.width - playheadX) / scale + 200)) continue;

        let xStart = playheadX + (sTime - lastCommonLiveTime || 0) * scale;
        let xEnd = playheadX + (eTime - lastCommonLiveTime || 0) * scale;

        let lane = (stroke.key === 'k1' || stroke.key === 'm1') ? 0 : 1;
        let y = Y_CENTERED - (KEY_BOX_SPACING / 2) + (lane * KEY_BOX_SPACING);

        let drawXStart = Math.min(xStart, maxLineX);
        let drawXEnd = Math.min(xEnd, maxLineX);

        if (drawXStart >= drawXEnd) drawXStart = drawXEnd - 0.1; 

        ctx.strokeStyle = lane === 0 ? 'rgba(255, 105, 180, 0.8)' : 'rgba(0, 255, 255, 0.8)';
        ctx.beginPath(); ctx.moveTo(drawXStart, y); ctx.lineTo(drawXEnd, y); ctx.stroke();
    }

    for (let lane = 0; lane < 2; lane++) {
        let isDown = false;
        if (lane === 0 && (keyBoxStates['k1'] || keyBoxStates['m1'])) isDown = true;
        if (lane === 1 && (keyBoxStates['k2'] || keyBoxStates['m2'])) isDown = true;

        let y = Y_CENTERED - (KEY_BOX_SPACING / 2) + (lane * KEY_BOX_SPACING);
        let size = KEY_BOX_SIZE;
        let boxX = playheadX;
        let boxY = y - size / 2;

        ctx.fillStyle = isDown ? (lane === 0 ? 'rgba(255, 105, 180, 1)' : 'rgba(0, 255, 255, 1)') : 'rgba(40, 40, 40, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2; ctx.lineCap = 'butt'; 
        ctx.fillRect(boxX, boxY, size, size);
        ctx.strokeRect(boxX, boxY, size, size);
    }
}