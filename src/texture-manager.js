// ──────── TEXTURE MANAGER ────────
// Loads skin assets, handles @2x fallbacks, and creates color-tinted variations.
// NEW: hitcircle + hitcircleoverlay are now pre-combined into a single image.

if (typeof hitCircleCombinedImg === 'undefined') {
    hitCircleCombinedImg = null;   // Safe global initialization
}

// ──────── NEW HELPER: Combine hitcircle (tinted or plain) with overlay ────────
// Now at TOP LEVEL so createTintedVersions() can always see it
function combineWithOverlay(base, overlayImg) {
    const baseWidth  = base instanceof HTMLImageElement ? base.width  : base.width;
    const baseHeight = base instanceof HTMLImageElement ? base.height : base.height;

    const combined = document.createElement('canvas');
    combined.width  = baseWidth;
    combined.height = baseHeight;
    const ctx = combined.getContext('2d');

    // Draw base (tinted or original)
    ctx.drawImage(base, 0, 0, baseWidth, baseHeight);

    // Draw overlay on top (if loaded)
    if (overlayImg && overlayImg.complete && overlayImg.naturalWidth > 0) {
        ctx.drawImage(overlayImg, 0, 0, baseWidth, baseHeight);
    }

    return combined;
}

function loadTextures() {
    const cacheBustStr = (isNewBeatmap || isNewSkin) ? `?v=${Date.now()}` : '';

    // Reset the isNewBeatmap flag BEFORE texture loading begins to prevent race conditions
    if (isNewBeatmap || isNewSkin) {
        if(hitCircleImg) hitCircleImg.src = ""; 
        if(hitCircleOverlayImg) hitCircleOverlayImg.src = "";
        if(sliderTickImg) sliderTickImg.src = "";
        if(sliderBodyImg) sliderBodyImg.src = "";

        hasHitCircleTexture = false;
        hasHitCircleOverlayImg = false;
        hasSliderTickTexture = false;
        hasSliderBodyTexture = false;
        
        hitCircleImg = null;
        hitCircleOverlayImg = null;
        sliderTickImg = null;
        sliderBodyImg = null;
        hitCircleCombinedImg = null;          // ← combined image for hitcircles
        
        defaultTintedHitCircles.length = 0;
        beatmapTintedHitCircles.length = 0;
        defaultTintedSliderTicks.length = 0;
        beatmapTintedSliderTicks.length = 0;
        defaultTintedSliderBodies.length = 0;
        beatmapTintedSliderBodies.length = 0;

        isNewSkin = false;
        isNewBeatmap = false;
    }

    const tosuUrl = 'http://127.0.0.1:24050/files/skin/';
    
    // Helper function to load an image with fallback support safely
    function loadImageWithFallback(image, src, fallbackSrc) {
        let triedFallback = false;
        let isUpscaled = false;

        image.onload = () => { 
            // If we loaded a normal (non-@2x) texture, upscale it to 2x resolution
            if (triedFallback && !isUpscaled) {
                isUpscaled = true;
                upscaleTextureTo2x(image);
                return; 
            }
            
            if (image === hitCircleImg) hasHitCircleTexture = true; 
            if (image === hitCircleOverlayImg) hasHitCircleOverlayImg = true;
            if (image === sliderTickImg) hasSliderTickTexture = true;
            if (image === sliderBodyImg) hasSliderBodyTexture = true;
            
            createTintedVersions(); 
        };

        image.onerror = () => {
            if (!triedFallback) {
                triedFallback = true;
                image.src = fallbackSrc;
            } else {
                image.onerror = null;
            }
        };
        
        image.src = src;
    }

    // Helper function to upscale texture to 2x resolution without blurring
    function upscaleTextureTo2x(image) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width * 2;
        canvas.height = image.height * 2;
        
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        
        image.src = canvas.toDataURL();
    }

    hitCircleImg = new Image();
    hitCircleImg.crossOrigin = "Anonymous";
    
    hitCircleOverlayImg = new Image();
    hitCircleOverlayImg.crossOrigin = "Anonymous";
    
    sliderTickImg = new Image();
    sliderTickImg.crossOrigin = "Anonymous";
    
    sliderBodyImg = new Image();
    sliderBodyImg.crossOrigin = "Anonymous";
    
    // Try @2x first, then fallback to normal
    loadImageWithFallback(sliderBodyImg, tosuUrl + 'sliderbody@2x.png' + cacheBustStr, tosuUrl + 'sliderbody.png' + cacheBustStr);
    loadImageWithFallback(hitCircleImg, tosuUrl + 'hitcircle@2x.png' + cacheBustStr, tosuUrl + 'hitcircle.png' + cacheBustStr);
    loadImageWithFallback(hitCircleOverlayImg, tosuUrl + 'hitcircleoverlay@2x.png' + cacheBustStr, tosuUrl + 'hitcircleoverlay.png' + cacheBustStr);
    loadImageWithFallback(sliderTickImg, tosuUrl + 'sliderscorepoint@2x.png' + cacheBustStr, tosuUrl + 'sliderscorepoint.png' + cacheBustStr);
}

function createTintedVersions() {
    if (hitCircleImg && hitCircleImg.complete && hitCircleImg.naturalWidth > 0) {
        const defaultColors = typeof DEFAULT_COMBO_COLORS !== 'undefined' ? DEFAULT_COMBO_COLORS : [{r:255,g:192,b:0}, {r:0,g:202,b:0}, {r:18,g:124,b:255}, {r:242,g:24,b:57}];
        
        // 7. DO NOT USE .MAP(). Clear and push to the existing arrays.
        defaultTintedHitCircles.length = 0;
        defaultColors.forEach(c => {
            const tintedBase = tintImage(hitCircleImg, `rgb(${c.r},${c.g},${c.b})`);
            defaultTintedHitCircles.push(combineWithOverlay(tintedBase, hitCircleOverlayImg));
        });
        
        if (typeof beatmapComboColors !== 'undefined' && beatmapComboColors.length) {
            beatmapTintedHitCircles.length = 0;
            beatmapComboColors.forEach(c => {
                const tintedBase = tintImage(hitCircleImg, `rgb(${c.r},${c.g},${c.b})`);
                beatmapTintedHitCircles.push(combineWithOverlay(tintedBase, hitCircleOverlayImg));
            });
        }

        hitCircleCombinedImg = combineWithOverlay(hitCircleImg, hitCircleOverlayImg);
    }
    
    if (sliderTickImg && sliderTickImg.complete && sliderTickImg.naturalWidth > 0) {
        const defaultColors = typeof DEFAULT_COMBO_COLORS !== 'undefined' ? DEFAULT_COMBO_COLORS : [{r:255,g:192,b:0}, {r:0,g:202,b:0}, {r:18,g:124,b:255}, {r:242,g:24,b:57}];
        
        defaultTintedSliderTicks.length = 0;
        defaultColors.forEach(c => defaultTintedSliderTicks.push(tintImage(sliderTickImg, `rgb(${c.r},${c.g},${c.b})`)));
        
        if (typeof beatmapComboColors !== 'undefined' && beatmapComboColors.length) {
            beatmapTintedSliderTicks.length = 0;
            beatmapComboColors.forEach(c => beatmapTintedSliderTicks.push(tintImage(sliderTickImg, `rgb(${c.r},${c.g},${c.b})`)));
        }
    }

    if (sliderBodyImg && sliderBodyImg.complete && sliderBodyImg.naturalWidth > 0) {
        const defaultColors = typeof DEFAULT_COMBO_COLORS !== 'undefined' ? DEFAULT_COMBO_COLORS : [{r:255,g:192,b:0}, {r:0,g:202,b:0}, {r:18,g:124,b:255}, {r:242,g:24,b:57}];
        
        defaultTintedSliderBodies.length = 0;
        defaultColors.forEach(c => defaultTintedSliderBodies.push(tintImage(sliderBodyImg, `rgb(${c.r},${c.g},${c.b})`)));
        
        if (typeof beatmapComboColors !== 'undefined' && beatmapComboColors.length) {
            beatmapTintedSliderBodies.length = 0;
            beatmapComboColors.forEach(c => beatmapTintedSliderBodies.push(tintImage(sliderBodyImg, `rgb(${c.r},${c.g},${c.b})`)));
        }
    }
}

function tintImage(img, colorRGB) {
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const ctx = c.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = colorRGB;
    ctx.fillRect(0, 0, c.width, c.height);
    
    ctx.globalCompositeOperation = 'source-over';
    return c;
}