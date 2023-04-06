var $HOME_DIR = require('user-home')
var fs = require('fs')

const delayWatchDir = `${ $HOME_DIR }/.delay-watch`

fs.rmdirSync(delayWatchDir, { recursive: true })
console.log(`Removed directory: ${ delayWatchDir }`)