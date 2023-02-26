const connectWebsocket = require("./utils/websocket");
const getVideoById = require("./utils/get-video");

let socket = connectWebsocket();

chrome.storage.onChanged.addListener((changes) => {
    const {isOpen} = changes;
    if (!isOpen) return;

    if (isOpen.newValue === true) {
        socket = connectWebsocket();
    } else {
        socket.close();
    }
});

chrome.tabs.onCreated.addListener(async (tab) => {
    if (!tab.pendingUrl.includes("music.youtube.com")) return;

    const videoId = tab.pendingUrl.split("v=")[1];
    const youtubeResult = await getVideoById(videoId);

    await chrome.storage.sync.set({tabId: tab.id});

    socket.send(JSON.stringify({
        type: "started_music",
        data: {
            title: youtubeResult.title,
            thumbnail: youtubeResult.thumbnail_url,
            singer: youtubeResult.author_name,
            url: tab.pendingUrl
        }
    }));
});


chrome.runtime.onInstalled.addListener(() => {
    chrome.tabs.create({url: chrome.runtime.getURL("/pages/thankyou.html")});
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
    const musicTab = await chrome.storage.sync.get("tabId");
    if (musicTab.tabId !== tabId) return;

    socket.send(JSON.stringify({
        type: "stopped_music",
        data: {}
    }));

    socket.close();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.url.includes("music.youtube.com")) return;
    if (!changeInfo) return;

    await chrome.storage.sync.set({tabId: tab.id});

    const videoId = tab.url.split("v=")[1];
    const youtubeResult = await getVideoById(videoId);

    if (changeInfo.audible === false) {
        socket.send(JSON.stringify({
            type: "stopped_music",
            data: {}
        }));
    }

    if (changeInfo.audible === true) {
        socket.send(JSON.stringify({
            type: "started_music",
            data: {
                title: youtubeResult.title,
                thumbnail: youtubeResult.thumbnail_url,
                singer: youtubeResult.author_name,
                url: tab.url
            }
        }));
    }

    if (changeInfo.title && tab.audible === true) {
        const regex = new RegExp(changeInfo.title.replace(" - YouTube Music", ""), "g");
        if (!regex.test(youtubeResult.title)) return;

        socket.send(JSON.stringify({
            type: "started_music",
            data: {
                title: youtubeResult.title,
                thumbnail: youtubeResult.thumbnail_url,
                singer: youtubeResult.author_name,
                url: tab.url
            }
        }));
    }
});
