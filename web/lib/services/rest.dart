part of raxa_web;

@Injectable()
class RestService {
    final Http http;

    RestService(this.http);

    Future call(Call call) {
        return http.post('http://127.0.0.1:8080/rest/call', JSON.encode(call));
    }

    Future<List<Device>> getDevices([Map query]) {
        var queryParam = '';

        if (query != null) {
            queryParam = '?query=${Uri.encodeQueryComponent(JSON.encode(query))}';
        }

        return http.get('http://127.0.0.1:8080/rest/devices$queryParam').then((response) {
            return response.data['data'].map((json) => new Device.from(json)).toList();
        });
    }

    Future<List<DeviceClass>> getDeviceClasses([Map query]) {
        var queryParam = '';

        if (query != null) {
            queryParam = '?query=${Uri.encodeQueryComponent(JSON.encode(query))}';
        }

        return http.get('http://127.0.0.1:8080/rest/deviceclasses$queryParam').then((response) {
            return response.data['data'].map((json) => new DeviceClass.from(json)).toList();
        });
    }

    Future createDevice(Device device) =>
        http.post('http://127.0.0.1:8080/rest/devices', JSON.encode(device));

    Future deleteDevice(Device device) =>
        http.delete('http://127.0.0.1:8080/rest/devices/${device.id}');

    Future saveDevice(Device device) =>
        http.put('http://127.0.0.1:8080/rest/devices/${device.id}', JSON.encode(device));
}
