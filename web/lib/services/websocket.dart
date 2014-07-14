part of raxa_web;

@Injectable()
class WebSocketService {
    final Http http;
    final ModelService modelService;

    WebSocketService(this.http, this.modelService) {
        WebSocket ws = new WebSocket('ws://127.0.0.1:8080/ws');
        ws.onOpen.listen((Event e) {
            print('Connected to server');
        });

        ws.onMessage.listen((MessageEvent e){
            print(e.data);
            var message = new EventMessage.from(JSON.decode(e.data));

            switch (message.type) {
                case 'Device':
                    switch (message.event) {
                        case 'created':
                            modelService.devices.add(new Device.from(message.data));
                            break;
                        case 'deleted':
                            modelService.devices.removeWhere((device) => device.id == message.data);
                            break;
                        case 'updated':
                            modelService.devices.firstWhere((device) => device.id == message.data['id'])
                                .addAll(message.data['changed']);
                            break;
                    }
                    break;
            }
        });

        ws.onClose.listen((Event e) {
            print('Connection to server lost...');
        });
    }
}
