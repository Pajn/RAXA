RAXA [![Build Status](https://travis-ci.org/Pajn/RAXA.svg?branch=master)](https://travis-ci.org/Pajn/RAXA)
====

RAXA is a server and client for home steering and automation.

Both the server and client is written in [Dart](https://www.dartlang.org/). The server is completely
separated from the client and may be used on it's own or with other clients.

The server uses a plugin architecture for communicating with hardware. Plugins
can provide support for multiple types of hardware by implementing or providing
interfaces and device classes. Plugins are written in Dart and run in separated
[isolates](https://api.dartlang.org/apidocs/channels/stable/dartdoc-viewer/dart:isolate) and can only access the server or other plugins via exposed interfaces. A HTTP REST API is used for communicating with clients. 

[WebSocket](http://en.wikipedia.org/wiki/WebSocket) and [TCP](http://en.wikipedia.org/wiki/Transmission_Control_Protocol) support is planned for handling realtime events and will be implemented in the future.

The client is based on [AngularDart](https://angulardart.org/) for modularity and will support mobiles, tablets
and desktop.
