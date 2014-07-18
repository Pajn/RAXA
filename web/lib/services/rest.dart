part of raxa_web;

@Injectable()
class RestService {
    final Http http;

    RestService(this.http);

    _query(Map query) =>
        (query != null) ? '?query=${Uri.encodeQueryComponent(JSON.encode(query))}' : '';

    /*
     Call
     */

    Future call(Call call) =>
        http.post('http://127.0.0.1:8080/rest/call', JSON.encode(call));

    /*
     DeviceClass
     */

    Future<List<DeviceClass>> getDeviceClasses([Map query]) =>
        http.get('http://127.0.0.1:8080/rest/deviceclasses${_query(query)}').then((response) {
            return response.data['data'].map((json) => new DeviceClass.from(json)).toList();
        });

    /*
     Device
     */

    Future createDevice(Device device) =>
        http.post('http://127.0.0.1:8080/rest/devices', JSON.encode(device));

    Future deleteDevice(Device device) =>
        http.delete('http://127.0.0.1:8080/rest/devices/${device.id}');

    Future<List<Device>> getDevices([Map query]) =>
        http.get('http://127.0.0.1:8080/rest/devices${_query(query)}').then((response) {
            return response.data['data'].map((json) => new Device.from(json)).toList();
        });

    Future saveDevice(Device device) =>
        http.put('http://127.0.0.1:8080/rest/devices/${device.id}', JSON.encode(device));

    /*
     Position
     */

    Future createPosition(Position position) =>
        http.post('http://127.0.0.1:8080/rest/positions', JSON.encode(position));

    Future deletePosition(Position position) =>
        http.delete('http://127.0.0.1:8080/rest/positions/${position.id}');

    Future<List<Position>> getPositions([Map query]) =>
        http.get('http://127.0.0.1:8080/rest/positions${_query(query)}').then((response) {
            return response.data['data'].map((json) => new Position.from(json)).toList();
        });

    Future savePosition(Position position) =>
        http.put('http://127.0.0.1:8080/rest/positions/${position.id}', JSON.encode(position));
}
