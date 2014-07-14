part of raxa.api;

class WebSocketApi {
    EventBus eventBus;

    var clients = new List<WebSocket>();

    WebSocketApi(this.eventBus) {
        eventBus.listen((message) => clients.forEach((client) => client.add(JSON.encode(message))));
    }

    upgrade(WebSocket webSocket) {
        webSocket.done.then((_) => clients.remove(webSocket));

        clients.add(webSocket);
    }
}
