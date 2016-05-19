'use strict'

const {execFile} = require('child_process')
const {parse} = require('url')
const maxBuffer = 64*1024

module.exports = (url) => new Promise( (resolve, reject) => {
    let {port=443, hostname} = parse(url)
    execFile(
        'nmap',
        ['--script', 'ssl-enum-ciphers', `-p${port}`, hostname],
        {maxBuffer: maxBuffer},
        (err, stdout, stderr) => {
            // parse cipher list
            resolve([])
        }
    )
})
