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
                resolve( JSON.parse(stderr) )
        }
    ) // .stdout.pipe(process.stderr)
})

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
            delete result.html
            process.stdout.write(
                require('json5').stringify(result, null, '  ')+'\n'
            )
        } )
        .catch( (err) => {
            process.stderr.write(err)
        })
}
