console.log('content.js injected');

if (document.location.href.includes('music.youtube')) {
    let socket = new WebSocket('ws://localhost:5675');
    const timeout = 820;

    const name = document.querySelector('#layout > ytmusic-player-bar > div.middle-controls.style-scope.ytmusic-player-bar > div.content-info-wrapper.style-scope.ytmusic-player-bar > yt-formatted-string');
    let previousContent = name[0]?.title;
    let paused = false;

    let interval = setInterval(() => {
        if (socket.readyState == WebSocket.OPEN) {
            checkContent();
        }
    }, timeout);

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[YTMusicRPC] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
        } else {
            console.log('[YTMusicRPC] Connection died');
        }

        clearInterval(interval);
    }

    socket.onopen = function () {
        console.log('[YTMusicRPC] Connection established');
        console.log('[YTMusicRPC] Sending started_music event');
    }

    socket.onerror = function (error) {
        console.log(`[YTMusicRPC] ${error.message}`);
    }

    chrome.storage.onChanged.addListener(function (changes) {
        if (changes.isOpen && changes.isOpen.newValue === true) {
            socket = new WebSocket('ws://localhost:5675');
            interval = setInterval(() => {
                if (socket.readyState == WebSocket.OPEN) {
                    checkContent();
                }
            }, timeout)
        } else if (changes.isOpen && changes.isOpen.newValue === false) {
            socket.close();
        }
    });

    const array = ["Pause", "Duraklat", "Pausa", "Pausie"]

    function checkContent() {
        const playButton = document.getElementById('play-pause-button');

        if (name.textContent !== previousContent && array.includes(playButton.getAttribute('title'))) {
            previousContent = name.textContent;
            sendMessage('started_music');
        }

        if (name.textContent === previousContent && array.includes(playButton.getAttribute('title'))) {
            sendMessage('started_music');
            paused = false;
        }

        if (!paused && name.textContent === previousContent && !array.includes(playButton.getAttribute('title'))) {
            sendMessage('stopped_music', false);
            paused = true;
        }
    }

    function sendMessage(type, isData = true) {
        let data = {};

        if (isData) {
            const song = document.querySelector('.ytmusic-player-queue[play-button-state="playing"]');
            if (!song) return;

            const thumbnail = document.getElementsByClassName("image style-scope ytmusic-player-bar");
            const singer = song?.getElementsByClassName("byline style-scope ytmusic-player-queue-item");
            const url = document.getElementsByClassName("ytp-title-link yt-uix-sessionlink");

            data = {
                title: name.textContent,
                url: url[0].href,
                thumbnail: thumbnail[0].src,
                singer: singer[0].textContent,
            }
        }

        socket.send(JSON.stringify({
            type: type,
            data: data
        }));
    }
}
