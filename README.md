# koa-consul

This middleware will set a /health route as default. The consul server will visit /health for acquiring system info.

## Usage

``` javascript
import Koa from 'koa';
import KoaConsul from 'koa-consul';

let app = new Koa();

app.use(KoaConsul());
```

## API

### KoaConsul(options)

* options.url Custom the health url.
* options.strategy It's a function that compute the service's health status, when return true, the service is passing, return false, the service is warning.