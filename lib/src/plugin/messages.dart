part of raxa.plugin;

class Message extends ModelBase {
    String get command => this['command'];
    set command(String value) => this['command'] = value;

    Message();
    Message.from(Map<String, dynamic> other) : super.from(other);
}

class ErrorMessage extends Message {
    String get message => this['message'];
    set message(String value) => this['message'] = value;

    ErrorMessage(this.message);
    ErrorMessage.from(Map<String, dynamic> other) : super.from(other);
}
