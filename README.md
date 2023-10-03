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

```