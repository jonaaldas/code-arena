export default defineWebSocketHandler({
    open(peer) {
        console.log("Connected:", peer.id);
    },
    message(peer, message) {
        console.log("Message:", message.text());
        peer.send("Hello from server!");
    },
    close(peer, details) {
        console.log("Disconnected:", peer.id, details.code, details.reason);
    },
    error(peer, error) {
        console.error("Error:", error);
    },
});
