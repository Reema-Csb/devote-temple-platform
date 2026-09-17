# core

[![LoopBack](https://github.com/loopbackio/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png)](http://loopback.io/)

## Installation

Install CoreComponent using `npm`;

```sh
$ [npm install | yarn add] core
```

## Basic Use

Configure and load CoreComponent in the application constructor
as shown below.

```ts
import {CoreComponent, CoreComponentOptions, DEFAULT_CORE_OPTIONS} from 'core';
// ...
export class MyApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
  constructor(options: ApplicationConfig = {}) {
    const opts: CoreComponentOptions = DEFAULT_CORE_OPTIONS;
    this.configure(CoreComponentBindings.COMPONENT).to(opts);
      // Put the configuration options here
    });
    this.component(CoreComponent);
    // ...
  }
  // ...
}
```
