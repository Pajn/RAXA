part of raxa_web;

@Injectable()
class RestService {
    final Http http;

    RestService(this.http);

    Future call(Call call) {
        return http.post('http://127.0.0.1:8080/rest/call', call);
    }

    Future<List<Device>> getDevices([Map query]) {
        var queryParam = '';

        if (query != null) {
            queryParam = 'query=${JSON.encode(query)}';
        }

        return http.get('http://127.0.0.1:8080/rest/devices?$queryParam').then((response) {
            print(response.data);
            return response.data['data'].map((json) => new Device.from(json)).toList();
        });
    }

    Future saveDevice(Device device) =>
        http.put('http://127.0.0.1:8080/rest/devices/${device.id}', device);
}
