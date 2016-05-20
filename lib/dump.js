'use strict'

const {execFile} = require('child_process')
const {join} = require('path')
const maxBuffer = 16*1024*1024

module.exports = (url) => new Promise( (resolve, reject) => {
    execFile(
        'phantomjs',
        [join(__dirname, 'pjs-dump.js'), url],
        {maxBuffer: maxBuffer},
        (err, stdout, stderr)=>{
            if (err)
                reject( err )
            else
                resolve( transformDump(stderr) )
        }
    ).stdout.pipe(process.stderr)
})

function headerArrayToObject(ha) {
    let obj = {}
    ha.forEach( ({name, value}) => obj[name.toLowerCase()]=value )
    return obj
}

function transformDump(str) {
    return new Promise( (resolve, reject) => {
        // transform dump
        let j = JSON.parse(str)
        j.rr = j.rr.map( ({request, response})=>({
            url:        request.url,
            method:     request.method,
            status:     response.status,
            redirect:   response.redirectURL,
            error:      response.error,
            reqTime:    new Date(request.time).getTime(),
            resTime:    new Date(response.time).getTime(),
            reqHeaders: headerArrayToObject(request.headers),
            resHeaders: headerArrayToObject(response.headers)
        }) )

        resolve(j)
    })
}

// invoked as script
if (!module.parent) {
    let args = process.argv.slice(2)
    if (args.length !== 1) {
        process.stderr.write('Usage: node dump <url>\n\n')
        process.exit(1)
    }

    module.exports(args[0])
        .then( (result) => {
            require('fs').writeFileSync('screenshot.png', new Buffer(result.screenshot, 'base64'))
            delete result.screenshot
            process.stdout.write(
                require('json5').stringify(result, null, '  ')+'\n'
            )
        } )
        .catch( (err) => {
            process.stderr.write(err)
        })
}