'use strict'

class GPG {
  static _sendAndWaitForResponse (request) {
    return new Promise((resolve, reject) => {
      request.direction = 'from-page-script'
      window.postMessage(request, '*')

      function listener(e) {
        if (e.source == window &&
            e.data.direction &&
            e.data.direction == 'from-content-script') {
          window.removeEventListener('message', listener)

          const result = e.data

          if (result.type === 'success') {
            resolve(result.data)
          } else {
            reject(result.data)
          }
        }
      }

      window.addEventListener('message', listener)
    })
  }

  static async list_keys (priv = false) {
    return GPG._sendAndWaitForResponse({ 'action': 'list_keys', 'args': [priv], 'kwargs': {} })
  }

  static async sign (data, keyid) {
    return GPG._sendAndWaitForResponse({ 'action': 'sign', 'args': [data], 'kwargs': { keyid, 'clearsign': false, 'binary': false, 'detach': true } })
  }

  static async verify_data (signature, data) {
    return GPG._sendAndWaitForResponse({ 'action': 'verify_data_streams', 'args': [signature, data], 'kwargs': {} })
  }

  static async encrypt (data, recipient) {
    return GPG._sendAndWaitForResponse({ 'action': 'encrypt', 'args': [data, recipient], 'kwargs': { 'armor': true } })
  }

  static async decrypt (data) {
    return GPG._sendAndWaitForResponse({ 'action': 'decrypt', 'args': [data], 'kwargs': {} })
  }

  static async export_key (keyid, minimal = false) {
    return GPG._sendAndWaitForResponse({ 'action': 'export_keys', 'args': [keyid], 'kwargs': { minimal, 'armor': true} })
  }
}
