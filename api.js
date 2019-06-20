'use strict'

class GPG {
  static _sendAndWaitForResponse (request, timeout = null) {
    return new Promise((resolve, reject) => {
      // TODO: beware of sensitive data?
      // i.e. sending unencrypted data to be encrypted
      // who can read this data?
      request.direction = 'from-page-script'
      window.postMessage(request, '*')

      function listener(e) {
        if (e.source == window &&
            e.data.direction &&
            e.data.direction == 'from-content-script' &&
            e.data.action === request.action) {
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

      if (timeout !== null) {
        setTimeout(() => {
          window.removeEventListener('message', listener)
          reject('elapsed timeout')
        }, timeout)
      }
    })
  }

  static async version (check = false) {
    return await GPG._sendAndWaitForResponse({ 'action': 'get_version', 'args': [], 'kwargs': {} }, check && 1000 || null)
  }

  static async status () {
    try {
      await GPG.version(true)
      return true
    } catch (e) {
      return false
    }
  }

  static async list_keys (priv = false, sigs = false) {
    return await GPG._sendAndWaitForResponse({ 'action': 'list_keys', 'args': [priv], 'kwargs': { sigs, 'keys': [] } })
  }

  static async get_key (keyid) {
    try {
      const keys = await GPG._sendAndWaitForResponse({ 'action': 'list_keys', 'args': [false], 'kwargs': { 'sigs': false, 'keys': [keyid] } })
      return keys[0]
    } catch (e) { }

    return null
  }

  static async sign (data, keyid) {
    return await GPG._sendAndWaitForResponse({ 'action': 'sign', 'args': [data], 'kwargs': { keyid, 'clearsign': false, 'binary': false, 'detach': true } })
  }

  static async verify_data (signature, data) {
    return await GPG._sendAndWaitForResponse({ 'action': 'verify_data_streams', 'args': [signature, data], 'kwargs': {} })
  }

  static async encrypt (data, recipient) {
    return await GPG._sendAndWaitForResponse({ 'action': 'encrypt', 'args': [data, recipient], 'kwargs': { 'armor': true } })
  }

  static async decrypt (data) {
    return await GPG._sendAndWaitForResponse({ 'action': 'decrypt', 'args': [data], 'kwargs': {} })
  }

  static async export_key (keyid, minimal = false) {
    return await GPG._sendAndWaitForResponse({ 'action': 'export_keys', 'args': [keyid], 'kwargs': { minimal, 'armor': true } })
  }
}
