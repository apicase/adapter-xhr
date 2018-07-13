# @apicase/adapter-xhr

XHR adapter for [@apicase/core](https://github.com/apicase/core)

## Installation

1. Install via NPM

```
npm install @apicase/adapter-xhr
```

2. Import it

```javascript
import { apicase } from '@apicase/core'
import xhr from '@apicase/adapter-xhr'

const xhrAPI = apicase(xhr)
```

We use [**node-fetch**](https://www.npmjs.com/package/node-fetch) as polyfill for Node.js

## Basic usage
```javascript
const req = await xhrAPI({
  url: '/api/posts',
  method: 'GET',
  headers: { token: 'my_secret_token' },
  query: { userId: 1 }
})

if (req.success) { 
  console.log(req.result)
} else {
  console.error(req.result)
}
```

It will call:
```javascript
var xhr = new XMLHttpRequest()
xhr.open('GET', '/api/posts?userId=1', true)
xhr.onload = function onload (e) {
  // See validators
  if (isSuccess(e.target, e)) {
    console.log(e)
  } else {
    console.error(e)
  }
}
xhr.setRequestHeader('token', 'my_secret_token')
xhr.send(null)
```

## Advanced

### Url params
Fetch adapter also has [path-to-regexp](https://github.com/pillarjs/path-to-regexp) to pass urls params smarter. Params are stored in **params** property
```javascript
xhrAPI({
  url: '/api/posts/:id',
  params: { id: 1 }
})
// => GET /api/posts/1
```

### Dynamic headers
If you want to create dynamic headers object so you can pass **headers** property as function that returns headers object
```javascript
xhrAPI({
  url: '/api/posts',
  method: 'POST',
  headers: () => ({
    token: localStorage.getItem('token')
  })
})
```
It will be called every time you make a request so if token will be removed, header won't be sent too.

### Validator function
I've added possibility to customizate resolve/reject apicase requests with **validator** callback.  
It accepts xhr target and onload event
```javascript
xhrAPI({
  url: '/api/posts',
  validateStatus: (status) => 
    status >= 200 && status <= 299
})
```
Default validator function is here:
```javascript
function defaultValidator (status) {
  return status >= 200 && status < 300
}
```

## Author
[Anton Kosykh](https://github.com/Kelin2025)

## License
MIT
