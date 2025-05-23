let wakeLock;

export function requestFullscreen() {
    document.body.requestFullscreen();
    if (navigator.wakeLock) {
        navigator.wakeLock.request('screen').then(wl => wakeLock = wl).catch(console.error);
    }
}

export function toggleFullscreen() {
    if (document.fullscreenElement) {
        document.exitFullscreen();
        if (wakeLock) {
            wakeLock.release().then(() => wakeLockPromise = null).catch(console.error);
        }
    } else {
        requestFullscreen();
    }
}

