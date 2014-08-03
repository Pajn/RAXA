part of raxa.common;

class Message extends ModelBase {
    String get command => this['command'];
    set command(String value) => this['command'] = value;

    Message();
    Message.from(Map<String, dynamic> other) : super.from(other);
}

class CallMessage extends Message {
    Call get call => (this['call'] is Call) ? this['call'] : new Call.from(this['call']);
    set call(Call value) => this['call'] = value;

    Device get device =>
        (this['device'] is Device) ? this['device'] : new Device.from(this['device']);
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

class RestRequest extends Message {
    /// An optional id that can be used to link the request with the [RestResponse] when sent over
    /// a transport that doesn't support responding to specific messages.
    String get id => this['id'];
    set id(String value) => this['id'] = value;

    String get endpoint => this['endpoint'];
    set endpoint(String value) => this['endpoint'] = value;

    String get method => this['method'];
    set method(String value) => this['method'] = value;

    Map<String, String> get parameters => this['parameters'];
    set parameters(Map<String, String> value) => this['parameters'] = value;

    Map get data => this['data'];
    set data(Map value) => this['data'] = value;

    RestRequest(String endpoint, String method, {String id,
                                                 Map<String, String> parameters,
                                                 Map data}) {
        this.endpoint = endpoint;
        this.method = method;
        this.id = id;
        this.parameters = parameters;
        this.data = data;
        super.command = 'RestRequest';
    }
    RestRequest.from(Map<String, dynamic> other) : super.from(other);
}

class RestResponse extends Message {
    /// Set to the same value as provided in the corresponding [RestRequest].
    String get id => this['id'];
    set id(String value) => this['id'] = value;

    Map get data => this['data'];
    set data(Map value) => this['data'] = value;

    RestResponse(Map data, {String id}) {
        this.data = data;
        this.id = id;
        super.command = 'RestResponse';
    }
    RestResponse.from(Map<String, dynamic> other) : super.from(other);
}

class EventMessage extends Message {
    String get type => this['type'];
    set type(String value) => this['type'] = value;

    String get event => this['event'];
    set event(String value) => this['event'] = value;

    get data => this['data'];
    set data(value) => this['data'] = value;

    EventMessage(String type, String event, data) {
        this.type = type;
        this.event = event;
        this.data = data;
        super.command = 'Event';
    }
    EventMessage.from(Map<String, dynamic> other) : super.from(other);
}

class PluginEventMessage extends Message {
    String get plugin => this['plugin'];
    set plugin(String value) => this['plugin'] = value;

    String get interface => this['interface'];
    set interface(String value) => this['interface'] = value;

    String get event => this['event'];
    set event(String value) => this['event'] = value;

    get data => this['data'];
    set data(value) => this['data'] = value;

    PluginEventMessage(String plugin, String interface, String event, data) {
        this.plugin = plugin;
        this.interface = interface;
        this.event = event;
        this.data = data;
        super.command = 'PluginEvent';
    }
    PluginEventMessage.from(Map<String, dynamic> other) : super.from(other);
}
