'use strict'

const co = require('co')

/* returns Promise */
module.exports = (url, {cipherScan=true}={}) => co(function*(){
    let result = {}

    let {rr, html, screenshot} = yield require('./lib/dump')(url)
    result.rr = rr
    result.html = html
    result.screenshot = screenshot

    let landingPage = rr.find( ($)=>(!$.redirect) )

    if (!landingPage.status)
        throw new Error('Can not open url: '+url+', code: '+landingPage.error)

    if (cipherScan && landingPage.url.startsWith('https:') )
        result.ciphers = yield require('./lib/cipher-scan')(url)

    return result
})
