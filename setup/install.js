var $HOME_DIR = require('user-home')
var prompt = require('prompt');
var fs = require('fs')

const delayWatchDir = `${ $HOME_DIR }/.delay-watch`

prompt.start()
prompt.get(['ticketNumber', 'email', 'phoneNumber'], function (err, result) {
    if (!fs.existsSync(delayWatchDir)) {
        fs.mkdirSync(delayWatchDir)
    }

    const { ticketNumber, email, phoneNumber } = result

    const config = {
        "ticketNumber": ticketNumber,
        "email": email,
        "phoneNumber": phoneNumber,
        "locationCodes": [
            "JÖ", "N", "SK", "T", "THN", "G", "SMD", "BS", "VB", "V", "ÅL", "HPBG", "ÖR", "ÖB", "UV", "UÖ", "VG", "MDN", "MDÖ", "KB"
        ]
    }

    fs.writeFileSync(`${ delayWatchDir }/config.json`, JSON.stringify(config))
    fs.writeFileSync(`${ delayWatchDir }/payback.json`, '')
}); 