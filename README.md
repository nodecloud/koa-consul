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

* options.url 
* options.getInfo: a callback function, if you want custom the /health api's response, please implement this function.