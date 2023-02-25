function connectWebSocket() {
    const socket = new WebSocket('ws://localhost:5675');

    socket.onopen = () => {
        console.log('Connected to server');
    }

    socket.onclose = () => {
        console.log('Disconnected from server');
    }

    socket.onmessage = (event) => {
        console.log('Received message from server:', event.data);
    };

    return socket;
}

module.exports = connectWebSocket;
