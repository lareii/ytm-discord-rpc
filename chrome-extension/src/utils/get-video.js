async function getVideoById(videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const requestUrl = `https://www.youtube.com/oembed?url=${url}&format=json`;

    const youtubeResult = await fetch(requestUrl).then(res => res.json());

    return youtubeResult;
}

module.exports = getVideoById;
