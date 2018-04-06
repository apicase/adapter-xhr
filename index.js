const pathToRegexp = require('path-to-regexp')

const compilePath = (url, params) => pathToRegexp.compile(url)(params)

const uriReducer = (res = [], [key, val]) =>
  res.concat(
    Array.isArray(val)
      ? val.reduce((res, val, i) => uriReducer(res, [`${key}[]`, val]), [])
      : typeof val === 'object'
        ? Object.entries(val).reduce(
          (res, [i, val]) => uriReducer(res, [`${key}[${i}]`, val]),
          []
        )
        : `${encodeURIComponent(key)}=${encodeURIComponent(val)}`
  )

const withQuestion = res => (res.length && `?${res}`) || ''

const buildQueryString = payload =>
  withQuestion(
    typeof payload === 'string'
      ? payload
      : Object.entries(payload)
        .reduce(uriReducer, [])
        .join('&')
  )

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
      if (payload.validateStatus(e.target.status)) {
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
    if (
      typeof payload.body === 'object' &&
      !(payload.body instanceof FormData)
    ) {
      res.headers['Content-Type'] = 'application/json'
    }
    return res
  },

  merge(from, to) {
    const res = Object.assign({}, from, to)
    if (to.url !== undefined && from.url !== undefined) {
      res.url = to.url[0] === '/' ? to.url : [from.url, to.url].join('/')
    }
    return res
  }
}
