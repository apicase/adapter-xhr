const pathToRegexp = require('path-to-regexp')

const compilePath = (url, params) => pathToRegexp.compile(url)(params)

const buildQueryString = query => {
  const queryString = Object.entries(query).reduce(encodeURIParts, '')
  return queryString.length ? '?' + queryString : ''
}

const defaultStatusValidator = status => status >= 200 && status < 300

export default {
  createState: () => ({
    status: null,
    headers: null,
    body: null,
    progress: null
  }),

  callback({ payload, resolve, reject, emit, setResult, setCancelCallback }) {
    const xhr = new XMLHttpRequest()
    setCancelCallback(xhr.abort)
    xhr.open(payload.method, payload.url, true)

    xhr.onprogress = e => {
      setResult({
        progress: (e.loaded || 0) / (e.total || 1)
      })
    }

    xhr.onload = e => {
      const res = {
        status: e.target.status,
        headers: payload.headers,
        body: e.target.response,
        progress: 1
      }
      if (opts.validateStatus(e.target.status)) {
        resolve(res)
      } else {
        reject(res)
      }
    }
  },

  convert(payload) {
    var res = {
      url: compilePath(payload.url, payload.params || {}),
      body: 'body' in payload ? payload.body : null,
      method: payload.method || 'GET',
      headers: payload.headers || {},
      validateStatus: payload.validateStatus || defaultStatusValidator
    }
    if (payload.query) {
      res.url += buildQueryString(payload.query)
    }
    return res
  },

  merge(from, to) {
    const res = Object.assign({}, from, to)
    if (to.url && from.url) {
      res.url = to.url[0] === '/' ? to.url : [from.url, to.url].join('/')
    }
    return res
  }
}
