// Global state variables
export let gameStateName = 'Menu';
export let lastReceiveTime = performance.now();

export let lastCommonLiveTime = 0;
export let lastCommonRealTime = 0;
export let currentSpeed = 1.0;
export let lastLiveTimeChangeReal = performance.now();
export let speedAccumTosu = 0;
export let speedAccumReal = 0;

export let isTimelineLocked = false;
export let lockedBaseTime = 0;
export let lockedBaseRealTime = 0;
export let lockedCurrentSpeed = 1.0;

export let lastPreciseTime = 0;
export let lastPreciseRealTime = 0;
export let hitErrorCount = 0;

export let keyStrokes = [];
export let activeStrokes = { k1: null, k2: null, m1: null, m2: null };
export let lastCounts = { k1: 0, k2: 0, m1: 0, m2: 0 };
export let keyBoxStates = { k1: false, k2: false, m1: false, m2: false };

export let hitObjects = [];
export let timingPoints = [];
export let beatmapComboColors = [];
export let beatmapOD = 8.0;
export let beatmapSliderTickRate = 1.0;
export let lastChecksum = '';
export let mapTitle = 'Waiting for map...';

export let sliderTrackOverride = [20, 20, 20];
export let sliderBorder = [255, 255, 255];
export let sliderStyle = 2;

export let lastCombo = 0;
export let ourDetectedMissCount = 0;

export function resetTimelineState() {
    isTimelineLocked = false; hitErrorCount = 0; lastCommonLiveTime = 0;
    lastPreciseTime = 0; currentSpeed = 1.0; lockedBaseTime = 0;
    lastLiveTimeChangeReal = performance.now(); speedAccumTosu = 0; speedAccumReal = 0;
    
    keyStrokes = [];
    activeStrokes = { k1: null, k2: null, m1: null, m2: null };
    lastCounts = { k1: 0, k2: 0, m1: 0, m2: 0 };
    keyBoxStates = { k1: false, k2: false, m1: false, m2: false };
    if (hitObjects) hitObjects.forEach(h => { h.judged = false; h.isMissed = false; });

    lastCombo = 0;
    ourDetectedMissCount = 0;
}

// ──────── FIXED: SLIDER COMBO-BREAK DETECTION (long sliders now work) ────────
// We no longer use a fixed 1000 ms start-time window.
// Instead we take the most recent slider (current or previous) that is still
// relevant at the moment the combo break packet arrives (within the normal
// 100-200 ms poll delay).
export function markSliderAsMissed() {
    const now = lastPreciseTime || lastCommonLiveTime || 0;
    for (let i = hitObjects.length - 1; i >= 0; i--) {
        const note = hitObjects[i];
        if (note.type === 'slider' && !note.isMissed) {
            // Slider is either still active or ended no more than 500 ms ago
            // (covers the maximum expected combo-break packet delay)
            if (note.endTime >= now - 500 && note.startTime <= now + 300) {
                note.isMissed = true;
                break;
            }
        }
    }
}

export function fetchBeatmap() {
    try {
        const res = await fetch('http://127.0.0.1:24050/files/beatmap/file');
        const text = await res.text();
        const result = parseOsuFile(text);
        hitObjects = result.objs;
        timingPoints = result.timing;
        beatmapComboColors = result.beatmapCombos || [];
        beatmapOD = result.od;
        beatmapSliderTickRate = result.sliderTickRate || 1.0;
        loadTextures();
    } catch(e) { console.error(e); }
}

export function parseOsuFile(osuText) {
    const lines = osuText.split('\n');
    let section = '', sliderMult = 1.0, timing = [], objs = [], beatmapComboColorsLocal = [], currentComboIndex = 0;
    let od = 8.0; 
    let sliderTickRate = 1.0;
    
    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('[')) { section = line; continue; }
        if (section === '[Difficulty]') {
            if (line.startsWith('SliderMultiplier:')) sliderMult = parseFloat(line.split(':')[1]) || 1.0;
            if (line.startsWith('SliderTickRate:')) sliderTickRate = parseFloat(line.split(':')[1]) || 1.0;
            if (line.startsWith('OverallDifficulty:')) od = parseFloat(line.split(':')[1]) || 8.0;
        }
        if (section === '[Colours]' && line) {
            const match = line.match(/Combo\d+:\s*(\d+),\s*(\d+),\s*(\d+)/);
            if (match) beatmapComboColorsLocal.push({ r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) });
        }
        if (section === '[TimingPoints]' && line) {
            const tp = line.split(',');
            if (tp.length >= 7) timing.push({ time: parseFloat(tp[0]), beatLength: parseFloat(tp[1]), uninherited: parseInt(tp[6]) === 1 });
        }
        if (section === '[HitObjects]' && line) {
            const parts = line.split(',');
            if (parts.length < 4) continue;
            const time = parseInt(parts[2]), type = parseInt(parts[3]);
            let noteType = 'circle', endTime = time;
            if (type & 4) currentComboIndex = (currentComboIndex + 1) % 8;
            if (type & 2) {
                noteType = 'slider';
                const slides = parseInt(parts[6]) || 1, length = parseFloat(parts[7]) || 0;
                let currentBeatLength = 600, currentSV = sliderMult;
                for (let tp of timing) {
                    if (tp.time > time) break;
                    if (tp.uninherited) currentBeatLength = tp.beatLength;
                    else currentSV = sliderMult * (-100 / (tp.beatLength || 1));
                }
                const duration = slides * length * currentBeatLength / (100 * currentSV);
                endTime = time + (isFinite(duration) ? duration : 10000);
            } else if (type & 8) {
                noteType = 'spinner';
                endTime = parseInt(parts[5]) || time + 1000;
            }
            objs.push({ startTime: time, endTime, type: noteType, comboColorIndex: currentComboIndex, judged: false, isMissed: false });
        }
    }
    return { 
        objs: objs.sort((a,b)=>a.startTime-b.startTime), 
        timing, 
        beatmapCombos: beatmapComboColorsLocal, 
        od, 
        sliderTickRate
    };
}