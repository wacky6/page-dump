'use strict'

const {execFile} = require('child_process')
const {parse} = require('url')
const {parser: saxParser} = require('sax')
const platform = process.platform
const maxBuffer = 64*1024

module.exports = (url) => new Promise( (resolve, reject) => {
    execFile(
        'sslscan',
        ['--xml=-', parse(url).host],
        {maxBuffer: maxBuffer},
        (err, stdout, stderr) => {
            let ciphers = []
            let parser = saxParser(false, {lowercase: true})
            parser.onopentag = ({name, attributes:{cipher, sslversion}})=>{
                if (name==='cipher')
                    ciphers.push(`${sslversion}_${cipher}`)
            }
            parser.onend = ()=>resolve(ciphers.length ? ciphers: null)
            parser.write(stdout).close()
        }
    ).stdout.pipe(process.stderr)
})

// invoked as script
if (!module.parent) {
    let args = process.argv.slice(2)
    if (args.length !== 1) {
        process.stderr.write('Usage: node cipher-scan <url>\n\n')
        process.exit(1)
    }

    module.exports(args[0])
        .then( (result) => {
            process.stdout.write(
                require('json5').stringify(result, null, '  ')+'\n'
            )
        } )
        .catch( (err) => {
            process.stderr.write(err)
        })
}
