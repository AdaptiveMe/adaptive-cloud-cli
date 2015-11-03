# Adaptive Cloud Command Line Interface

[![Build Status](http://i.4dp.me/travis/AdaptiveMe/adaptive-cloud-cli.svg?branch=master)](https://travis-ci.org/AdaptiveMe/adaptive-cloud-cli)
[![Adaptive Cloud CLI Tag](http://i.4dp.me/github/tag/AdaptiveMe/adaptive-cloud-cli.svg)](https://github.com/AdaptiveMe/adaptive-cloud-cli/tags) 
[![Adaptive Cloud CLI Release](http://i.4dp.me/github/release/AdaptiveMe/adaptive-cloud-cli.svg)](https://github.com/AdaptiveMe/adaptive-cloud-cli/releases) 
[![Adaptive Cloud CLI npm](http://i.4dp.me/npm/v/adaptive-cloud-cli.svg)](https://www.npmjs.com/package/adaptive-cloud-cli) 
[![Dependency Status](http://i.4dp.me/david/AdaptiveMe/adaptive-cloud-cli.svg)](https://david-dm.org/AdaptiveMe/adaptive-cloud-cli) 
[![devDependency Status](http://i.4dp.me/david/dev/AdaptiveMe/adaptive-cloud-cli.svg)](https://david-dm.org/AdaptiveMe/adaptive-cloud-cli#info=devDependencies)

[![Adaptive Runtime Platform](https://raw.githubusercontent.com/AdaptiveMe/AdaptiveMe.github.io/master/assets_v2/wordmark-adaptive-spectrum-1173x256.png)](#)

Command Line Interface for communicating with the Adaptive Services on the cloud.

## Installation

Install this globally and you'll have access to the **adaptive** command anywhere on your system.

``` 
npm install -g adaptive-cloud-cli
```

## Usage

### Help & version

```
adaptive -h
adaptive -V
```

### Help for command

```
adaptive help <command>
```

### Account Management

TODO: text
TODO: Generate the gif again with another email


#### Register 

TODO: text

```
adaptive register <email>
  ? Enter your username: <username>
  ? Enter your password: <password>
adaptive login <username>
  ? Enter your password: <password>
adaptive logout
```
  
![Login](img/login.gif)

#### Change password

TODO: text

```
adaptive change-password
  ? Enter your new password: <password>
```

#### Reset pasword

TODO: text

```
adaptive reset-password <email>
adaptive change-password
  ? Enter your key: <key>
  ? Enter your new password: <password>
```

#### Unregister

TODO: text

```
adaptive unregister
  ? This command will delete all data associated with your account, are you sure? 
```

### Building Projects

TODO: text
TODO: Generate the terminal gift

#### Build

TODO: text

```
adaptive build
```

##### Build options

```
    -h, --help               output usage information
    -s --skip-dist           Skip the grunt dist task.
    -p --dist-folder [path]  Specify the dist folder. default: dist
    -v --verbose             Prints more information on the build
```

#### Status

TODO: text

```
adaptive status <id>
```

#### Logs

TODO: text

```
adaptive log <id>
```

TODO: Generate the terminal gif

#### Download

TODO: text

```
adaptive download <id>
```

TODO: Generate the terminal gif

### About Adaptive Runtime Platform

Hybrid apps are applications that are built using HTML5/CSS3/JavaScript web technologies and use a native "containers" to package the app to enable access to the native functionalities of a device. In essence, you can write a rich mobile/wearable/tv application using HTML and JavaScript and package that application as a native app for multiple mobile/wearable/tv platforms and distribute them on the different app stores and markets.

The Adaptive Runtime Platform (ARP) provides these native "containers" to package apps for the main mobile, wearable and desktop platforms... and other platforms as they emerge. Adaptive Runtime Platform (ARP) and sub-projects are open-source under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html). The Adaptive Runtime Platform (ARP) project was created by [Carlos Lozano Diez](https://github.com/carloslozano) as part of the [adaptive.me](http://adaptive.me) set of products.

Please refer to the [project site](http://adaptiveme.github.io) for more information.

## Work Backlog

#### Board: [![Stories in Ready](https://badge.waffle.io/AdaptiveMe/adaptive-cloud-cli.svg?label=ready&title=Ready)](https://waffle.io/AdaptiveMe/adaptive-cloud-cli)

[![Throughput Graph](https://graphs.waffle.io/AdaptiveMe/adaptive-cloud-cli/throughput.svg)](https://waffle.io/AdaptiveMe/adaptive-cloud-cli/metrics)

## Contributing

We'd *love to accept your patches and contributions to this project*.  There are a just a few small guidelines you need to follow to ensure that you and/or your company and our project are safeguarded from inadvertent copyright infringement. I know, this can be a pain but we want fair-play from the very start so that we're all on the same page. Please refer to the [project site](http://adaptiveme.github.io) for more information.

## Attributions

* Adaptive Runtime Platform (ARP) artwork by [Jennifer Lasso](https://github.com/Jlassob).
* Project badge artwork by [shields.io](http://shields.io/).
* All other logos are copyright of their respective owners.

## License
All the source code of the Adaptive Runtime Platform (ARP), including all Adaptive Runtime Platform (ARP) sub-projects curated by [Carlos Lozano Diez](https://github.com/carloslozano), are distributed, and must be contributed to, under the terms of the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html). The [license](https://raw.githubusercontent.com/AdaptiveMe/adaptive-arp-api/master/LICENSE) is included in this [repository](https://raw.githubusercontent.com/AdaptiveMe/adaptive-arp-api/master/LICENSE).

Forged with :heart: in Barcelona, Catalonia · © 2013 - 2015 [adaptive.me](http://adaptive.me) / [Carlos Lozano Diez](http://google.com/+CarlosLozano).

