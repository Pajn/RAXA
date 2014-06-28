part of raxa.plugin_helper;

class Message extends ModelBase {
    String get command => this['command'];
    set command(String value) => this['command'] = value;

    Message();
    Message.from(Map<String, dynamic> other) : super.from(other);
}

class CallMessage extends Message {
    Call get call => this['call'];
    set call(Call value) => this['call'] = value;

    Device get device => this['device'];
    set device(Device value) => this['device'] = value;

    CallMessage(Call call, Device device) {
        this.call = call;
        this.device = device;
        super.command = 'Call';
    }
    CallMessage.from(Map<String, dynamic> other) : super.from(other);
}

class ErrorMessage extends Message {
    String get message => this['message'];
    set message(String value) => this['message'] = value;

    ErrorMessage(String message) {
        this.message = message;
        super.command = 'Error';
    }
    ErrorMessage.from(Map<String, dynamic> other) : super.from(other);
}

class RestMessage extends Message {
    String get endpoint => this['endpoint'];
    set endpoint(String value) => this['endpoint'] = value;

    String get method => this['method'];
    set method(String value) => this['method'] = value;

    Map get parameters => this['parameters'];
    set parameters(Map value) => this['parameters'] = value;

    Map get data => this['data'];
    set data(Map value) => this['data'] = value;

    RestMessage(String endpoint, String method, Map parameters, Map data) {
        this.endpoint = endpoint;
        this.method = method;
        this.parameters = parameters;
        this.data = data;
        super.command = 'Rest';
    }
    RestMessage.from(Map<String, dynamic> other) : super.from(other);
}
