RAXA
====

RAXA is a server and client for home steering and automation.

Both the server and client is written in Dart. The server is compleatly
sepparated from the client and may be used on it's own or with other clients.

The server uses a plugin architecture for communicating with hardware. Plugins
can provide support for multiple types of hardware by impelamenting or providing
interfaces and device classes. Plugins are written in Dart and is run in sepparated
isolates so they can only access the server or other plugins via exposed interfaces.
For communicating with clients a HTTP REST API is used, in the future there will
also be Websocket and TCP support for realtime events.

The client is based on AngularDart for modularity and will support mobiles, tablets
and desktop.
