part of raxa_web;

@Injectable()
class RestService {
    final Http http;

    RestService(this.http);

    Future call(Call call) {
        return http.post('http://127.0.0.1:8080/call', call);
    }

    Future<List<Device>> getDevices() {
        return http.get('http://127.0.0.1:8080/devices').then((response) {
            return response.data['data'].map((json) => new Device.from(json)).toList();
        });
    }
}
