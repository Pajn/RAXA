part of raxa.plugin_helper;

class Message extends ModelBase {
    String get command => this['command'];
    set command(String value) => this['command'] = value;

    Message();
    Message.from(Map<String, dynamic> other) : super.from(other);
}

class ErrorMessage extends Message {
    String get message => this['message'];
    set message(String value) => this['message'] = value;

    ErrorMessage(this.message) {
        super.command = 'Error';
    }
    ErrorMessage.from(Map<String, dynamic> other) : super.from(other);
}

class CallMessage extends Message {
    Call get call => this['call'];
    set call(Call value) => this['call'] = value;
    Device get device => this['device'];
    set device(Device value) => this['device'] = value;

    CallMessage(this.call) {
        super.command = 'Call';
    }
    CallMessage.from(Map<String, dynamic> other) : super.from(other);
}
