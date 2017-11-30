# apicase-adapter-xhr
XHR adapter for apicase-core

## Installation
XHR adapter is out-of-the-box adapter and it's installed in apicase-core by default

## Basic usage
```javascript
apicase.call({
  adapter: 'xhr',
  url: '/api/posts',
  method: 'GET',
  headers: { token: 'my_secret_token' },
  query: { userId: 1 }
})
.then(console.log)
.catch(console.error)
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
apicase.call({
  adapter: 'xhr',
  url: '/api/posts/:id',
  params: { id: 1 }
})
// => GET /api/posts/1
```

### Dynamic headers
If you want to create dynamic headers object so you can pass **headers** property as function that returns headers object
```javascript
apicase.call({
  adapter: 'fetch',
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
apicase.call({
  adapter: 'fetch',
  url: '/api/posts',
  validator: (target, event) => 
    target.status >= 200 && target.status <= 299
})
```
Default validator function is here:
```javascript
function defaultValidator (target, event) {
  return (target.status >= 200 && target.status <= 299) || target.status === 304
}
```

### Progress and aborted hooks
I know that people use XHR instead of fetch because of calls abortion and upload progress handling.  
So there are two custom hooks for that - **progress** and **aborted**:
```javascript
apicase.call({
  url: '/upload',
  method: 'POST',
  body: ...,
  hooks: {
    // xhr.onprogress
    progress (event, next) { 
      console.log(event)
      next()
    },
    // xhr.onabort
    aborted (event, next) { 
      console.log(event)
      next()
    }
  }
})
```
> **NOTE**: **event** also has **options** property with request options because apicase calls all hooks with options injected. 

## Author
[Anton Kosykh](https://github.com/Kelin2025)

## License
MIT
