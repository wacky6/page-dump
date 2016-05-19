/* this file runs inside phantomjs
 * check phantomjs ES6/7 compatibility
 */

'use strict'

var system = require('system')
var url

var TIMEOUT = 25*1000
var UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36'

function stderr(str) { system.stderr.writeLine(str) }
function stdout(str) { system.stdout.writeLine(str) }

if (system.args.length !== 2) {
    stderr('Usage: phantomjs pjs-dump.js <url>')
    phantom.exit(1)
}else{
    url = system.args[1]
}

var page = require('webpage').create()
var rr = []
var loaded = 0
var opened = false

function printResult() {
    rr.forEach( function(rr) {
        if (!rr.response)
            rr.response = {
                headers: [],
                status:  null,
                error:   'timeout'
            }
    })
    var result = {
        rr:         rr,
        html:       page.content,
        screenshot: page.renderBase64('PNG')
    }
    system.stderr.write(JSON.stringify(result))
}

page.settings.userAgent = UA
page.settings.resourceTimeout = 5000
page.viewportSize = {
    width:  1600,
    height: 1200
}

page.onResourceRequested = function(req, net) {
    if (req.url.indexOf('data:')===0)
        return
    stdout('Request  '+req.id+' : '+req.url)
    rr.push({ request: req })
}

page.onResourceReceived = function(res) {
    if (res.url.indexOf('data:')===0)
        return

    var idx = res.id-1
    if (typeof rr[idx].response === 'undefined') {
        rr[idx].response = res
    }else{
        rr[idx].response.bodySize += res.bodySize
    }
    if (res.stage==='end') {
        ++loaded
        stdout('Response '+res.id+' : '+res.url)
    }

    if (rr.length<=loaded) {
        stdout('all loaded, wait for async requests')
        // make sure there are no deferred loadings
        setTimeout( function() {
            if (opened && rr.length<=loaded) {
                printResult()
                phantom.exit(0)
            }
        }, 500)
    }
}

page.onResourceError = function(err) {
    stdout('Resource Error: '+err.id+', '+err.errorString)
    if (err.url.indexOf('data:')===0)
        return
    // ignore http error, errorCode is qt error code
    if (err.errorCode >= 200 && err.errorCode <= 300)
        return

    var idx = err.id-1
    rr[idx].response = {
        headers: [],
        status:  null,
        error:   err.errorCode,
        errorString: err.errorString
    }
}

page.onResourceTimeout = function(req){
    stdout('Resource Timeout: '+err.id+', '+err.errorString)
    if (req.url.indexOf('data:')===0)
        return
    var idx = res.id-1
    rr[idx].response = {
        headers: [],
        status:  null,
        error:   'timeout'
    }
    ++loaded
}

page.onLoadFinished = function(status) {
    stdout('page open, pending: '+(rr.length-loaded))
    opened = true
}

page.open(url)

setTimeout(function(){
    printResult()
    phantom.exit(0)
}, TIMEOUT)
