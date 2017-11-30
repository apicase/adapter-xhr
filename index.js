const pathToRegexp = require('path-to-regexp')

function compilePath (url, params) {
  return pathToRegexp.compile(url)(params)
}

function evaluateHeaders (headers) {
  return typeof headers === 'function'
    ? headers()
    : headers
}

function buildQueryString (query) {
  var queryString = ''
  Object.keys(query).forEach(function encodeQueryPart (key) {
    queryString += encodeURIComponent(key) + '=' + encodeURIComponent(query[key])
  })
  return queryString.length
    ? '?' + queryString
    : ''
}

function defaultValidator (target, event) {
  return (target.status >= 200 && target.status <= 299) || target.status === 304
}

function xhrAdapter (ctx) {
  var xhr = new XMLHttpRequest()
  var url = compilePath(ctx.options.url, ctx.options.params || {})
  var options = {
    method: ctx.options.method || 'GET',
    body: ctx.options.body || null,
    headers: ctx.options.headers ? evaluateHeaders(ctx.options.headers) : {}
  }
  if (ctx.options.query) url += buildQueryString(ctx.options.query)
  var isSuccess = ctx.options.validator || defaultValidator

  xhr.open(options.method, url, true)
  xhr.onprogress = function onProgress (e) {
    ctx.custom('progress', e)
  }
  xhr.onload = function onLoad (e) {
    if (isSuccess(e.target, e)) {
      ctx.done(e)
    } else {
      ctx.fail(e)
    }
  }
  xhr.onabort = function onAbort (e) {
    ctx.custom('aborted', e, true)
  }
  for (var key in options.headers) {
    xhr.setRequestHeader(key, options.headers[key])
  }
  xhr.send(options.body)
}

module.exports = xhrAdapter
