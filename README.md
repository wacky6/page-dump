page-dump
===
Simulate browser and dump webpage's request/response


## Usage
```JavaScript
let pageDump = require('page-dump')

pageDump('http://www.baidu.com')
.then( ({rr, html, screenshot}) => {
    /* rr   => [ requestResponse ]
     * html => html string
     * screenshot => base64 encoded png
     */
} )
.catch( (err) => {
    // url can't be opened
} )
```

## Hard Dependencies
Install them to your system. They are not handled by npm.

* phantomjs (or SlimerJS, with changes to `pjs-dump` & `dump`)
* wacky6/sslscan
