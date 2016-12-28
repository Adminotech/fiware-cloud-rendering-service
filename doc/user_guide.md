#Cloud Rendering - User and Programmers Guide

#Introduction

This document describes the user and programmers guide of the reference implementation provided by the Cloud Rendering GE.

The Cloud Rendering GEi is split into three distinct components. Each of them will be covered, when appropriate, in the subsections of this page.

* **WebService** is a web service that does signaling between the renderer(s) and the web client(s). Facilitating the all important function of connecting two peers that want to communicate with WebRTC. Additionally application level messaging can be sent through it.
* **Renderer** is the application that delivers 3D rendering results to web clients via WebRTC video. In our case this is a realXtend Tundra based 3D virtual world client.
* **WebClient** is the application running in the end users web browsers that wants to receive 3D rendering from a renderer.

###Background and Detail
This User and Programmers Guide relates to the Cloud Rendering GE which is part of the [Advanced Middleware and Web User Interfaces chapter](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/Advanced_Middleware_and_Web_UI_Architecture). Please find more information about this Generic Enabler in the related [Open Specification](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/FIWARE.OpenSpecification.MiWi.CloudRendering) and [Architecture Description](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/FIWARE.ArchitectureDescription.MiWi.CloudRendering).

#User guide
> TODO: image

##Renderer

The renderer is a plugin for the realXtend Tundra virtual world SDK. The software release of the Cloud Rendering GE contains a full Tundra distribution with the renderer plugin included. The following command line options to the Tundra executable are available if the plugins is loaded into Tundra.

####Command line parameters

Loading the plugin to Tundra can be done by running `Tundra --plugin CloudRenderingPlugin`

The plugin can be configured using the following command line parameters

* `--cloudRenderer <web-service-host>` will instruct the plugin to act as a renderer and register itself to a **WebService** in the specified host.
* `--cloudRenderingSendWebCamera` will instruct the plugin to send web camera video instead of the 3D rendering to the clients.
* `--cloudRenderingShowStreamPreview` will make the renderer popup a rendering preview widget per client connection. This way you can see what actually gets sent to the web clients.

####Selecting a Tundra rendering plugin

On Windows the default Tundra renderer is DirectX, however for the kind of render target blitting to a WebRTC stream is considerably faster with OpenGL. You can select the OpenGL renderer with `--opengl`

####Full execution example

Example of combining the parameters to run a renderer against a localhost development web service

`TundraConsole.exe --config tundra-client.json --opengl --plugin CloudRenderingPlugin --cloudRenderer localhost:3000`

If you want to run with a Meshmoon Rocket configuration use the following. This gives you the full Meshmoon client that integrates into the Meshmoon hosting platform. If you are using the realXtend Tundra distribution you will additionally have to host your own virtual world server where you can login with the renderer. Meshmoon platform will offer a easier experience to find virtual worlds and to login into them.

`Rocket --opengl --plugin CloudRenderingPlugin --cloudRenderer localhost:3000`

If the Cloud Rendering plugin was successfully loaded you will see the following line in the startup shell logging

 `Loading plugin CloudRenderingPlugin`

If it cannot connect to the web service

`Error: [WebRTC::Renderer]: WebSocket connection failed to Cloud Rendering Service at ws://localhost:3000`

####Debugging

Add `--logLevel debug` to the application parameters to get verbose logging about the messaging between the web service and the web client(s). If you are connecting to virtual worlds with the client, you can add `--logLevelNetwork info` to reduce network related logging, which is not important in our context.

####Web Service notes

The renderer will register itself to the web service. It is therefor mandatory that the web service is up and running when you start any renderers. In the above example they are ran locally on the same machines `localhost:3000` but the service can be ran anywhere and for any real world use desired due to the rather heavy CPU/GPU resource needs of the renderer.

#Programmers guide

##WebService

The web service is a ready server application that implements the full Cloud Rendering GE specification. There are little real world use cases where modifying the web service code would bring something new to your application. You are free to inspect the code to see how the protocol and specification is implemented and of course hack around the codebase. You can interact with the web service with the **WebClient** JavaScript library.

##Renderer

Much of the above is also true for the renderer. The renderer is a specialized implementation of a Cloud Rendering renderer. Its function is to provide realXtend Tundra based 3D virtual world client to web clients. The code is open source and should be looked into with more detail if you are interested in implementing a Cloud Rendering renderer for your application. The application the renderer is providing is **NOT** limited to 3D rendering. You can stream WebRTC video and let the user interact with input events with any type of application.

If you are interested in the implementation details you can read the source code and inspect the [doxygen documentation of the C++ code here](http://doc.meshmoon.com/doxygen/fiware-cloud-rendering/).

##WebClient

Installation is documented [here](https://forge.fiware.org/plugins/mediawiki/wiki/fiware/index.php/Cloud_Rendering_-_Installation_and_Administration_Guide#Software_Installation_and_Configuration). The web client example application and JavaScript library is built with the web service instructions.

Once you have built the web service, you can find the JavaScript library from `<web_service_source_code>/webservice/public/js/builds/RTCReceiver.js`. You must include this library on the page (web application) you are going to build with it.

###RTCReceiver.js

The library is self configured and operates by default on the DOM of the page it is being instantiated on. It will by default try to connect to the same host as where the page is served from. This makes it work automatically for the purposes of the web service. However you can customize the behavior in the following ways.

####Creating a client

```
  // To instantiate a default client
  var client = new CloudRenderingClient();
```

Connecting without options will use the following defaults

```
  {
    host : 'ws://' + window.location.host,
    iceServers : [
      { 'url': 'stun:stun.l.google.com:19302' },
      { 'url': 'turn:130.206.83.161:3478' }
    ]
  }
```

You can customize the web sevice host and used ICE servers with

```
  var client = new CloudRenderingClient({
      host: "ws://my.service.com",
      username : "John Doe",
      iceServers : [
          { url : "my.stun.com" },
          { url : "my.turn.com" }
      ]
  });
```

This client will establish a WebSocket connection with the web service at `host`.

####Sending and receiving messages

You can override the default message handler function implementations. Handling these messages requires an understanding about the Cloud Rendering protocol that is documented on its own wiki page. What you decide to do with the message content also depends on your application that is using Cloud Rendering.

```
  client.roomMessageHandler = function(message) {};
  client.applicationMessageHandler = function(message) {};
  client.signalingMessageHandler = function(message) {};
```

You can look into the `message` object structure from `<web_service_source_code>/signalingserver/lib/CRMessage.js`. This object can also be sent to the network by using.

```
  // Channel is the protocols channel identifier. Type is the message type inside the channel and payload is the message contents.
  client.sendMessage(new CloudRenderingMessage(channel, type, payload));
```

####WebRTC interaction

The WebRTC layer is handled by `<web_service_source_code>/jsapps/lib/PeerConnection.js`. All Cloud Rendering messages related to peer-to-peer WebRTC connection setup and execution is forwarded to this class. This part cannot be directly swapped from the provided JavaScript library, but can be done by modifying the web service source code and building it again. It is also a good place to check out if you are new to WebRTC JavaScript functionality.
