#!/usr/bin/env node

'use strict'

const program = require('commander')

program
    .description('Simulate browser and dump webpage request/response')
    .option('-p, --pretty', 'Beautify JSON output')
    .option('-h, --human-readable', 'Human readable output')
    .option('-C, --no-cipher-scan', 'Disable ssl/tls cipher scan')
    .arguments('<url>')
    .parse(process.argv)

if (program.args.length !== 1) {
    process.stderr.write('\nInvalid argument.\nSee more with --help\n\n')
    process.exit(1)
}

let opts = {
    cipherScan: !program.noCipherScan
}

require('../')(program.args[0], opts)
    .then( (result)=>{
        output(result)
    } )
    .catch( (err)=>{
        output({ error: err.message })
        process.stderr.write(err.stack)
    } )


function output(obj) {
    // don't display screenshot base64
    delete obj.screenshot
    
    let outputStr
    if (program.humanReadable)
        outputStr = require('json5').stringify(obj, null, '  ')
    else if (program.pretty)
        outputStr = JSON.stringify(obj, null, '  ')
    else
        outputStr = JSON.stringify(obj)
    process.stdout.write(outputStr+'\n')
}
