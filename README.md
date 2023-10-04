# Chat Module Node.js


## Table of Contents

 * [Overview](#overview)
 * [Installation](#installation)
 * [Contributing](#contributing)
 * [Documentation](#documentation)
 * [Supported Environments](#supported-environments)
 * [Acknowledgments](#acknowledgments)
 * [License](#license)


## Overview

[ChatModule] provides the easy integration of chatting feature into your app
you need to do write less code for the feature.


## Installation

The ChatModule Node.js is available on npm as `@quokka-labs/chatmodule`:

```bash
$ npm install --save @quokka-labs/chatmodule
```

To use the module in your application, `require` it from any JavaScript file:

```js
const {ChatModule} = require("@quokka-labs/chatmodule")

ChatModule.initiateConnection(server).then((result)=>{
    console.log('Socket connection up')
}).catch((err)=>console.log('Socket connection exception',err))
```
If you are using ES2015, you can `import` the module instead:

```js
import {ChatModule} from "@zubair-nazir/inapp-chat"
```
When initializing app, make sure to keep you service config file of firebase in root folder of project

## Supported Environments

We support Node.js 14 and higher.

Please also note that this module should only
be used in server-side/back-end environments controlled by the app developer.
This includes most server and serverless platforms (both on-premise and in
the cloud). It is not recommended to use this module in client-side
environments.

## Documentation

## Client connection with server
For connecting user with socket server, client needs to pass params and authorization token in header of connection url.
## Connection url
Example: http://${baseUrl:port}?userId=${userId}&userName=${userName}
```js
http://localhost:3000?userId=2&userName=Sumit
```
## Headers of connection url
Authorization: ${jwt-token}

## Events
There are 3 events that needs to be followed by client as per the docs here.
1. room (responsible for handling chat room messages)
2. privateChatMessage (responsible for handling private messages or one to one messages)
3. fetchChats (responsible for fetching chat history)

## room event
For joining a particular room, pass a json data on room event
```js
{
    "action":"join",
    "room":"room1"
}
```

For sending a message in room, pass a json data on room event
```js
{
    "action":"send",
    "room":"room1",
    "message":"Hi, How are you"
}
```
For leaving a room, pass a json data on room event
```js
{
    "action":"leave",
    "room":"room1"
}
```

## fetchUserChats event

For fetching message history, trigger the fetchUserChats event without any data
```js

```

## privateChatMessage event

For sending a one to one message to user, pass json data on privateChatMessage event
```js
{
    "receiverId":"3",
    "message":"hey u there"
}
```


