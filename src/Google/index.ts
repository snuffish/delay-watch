import fs from 'fs'
import readline from 'readline'
import { google } from 'googleapis'
import PaybackInterface from './PaybackInterface'
import { $TOKEN_FILE, $PAYBACK_FILE } from '../FilePaths'
import { convertDate, FORMAT } from '../Utils/date'
import { createPaybackSyncProgressBar } from '../Utils/progress'
import chalk from 'chalk'
const jsdom = require('jsdom')
const { JSDOM } = jsdom

let gmail: any = undefined
let auth: any = undefined

let progressBar: any = undefined

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.

// Load client secrets from a local file.

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
const authorize = (credentials: any, callback: any):any => {
    const {client_secret, client_id, redirect_uris} = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])
  
    // Check if we have previously stored a token.
    fs.readFile($TOKEN_FILE, (err: any, token: any) => { 
      if (err) return getNewToken(oAuth2Client, callback)
      oAuth2Client.setCredentials(JSON.parse(token))
      callback(oAuth2Client)
    })
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getNewToken = (oAuth2Client: any, callback: any): any => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  })

  console.log('Authorize this app by visiting this url:', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close()

    oAuth2Client.getToken(code, (err: any, token: any) => {
      if (err) return console.error('Error retrieving access token', err)
      oAuth2Client.setCredentials(token)
      // Store the token to disk for later program executions
      fs.writeFile($TOKEN_FILE, JSON.stringify(token), (err) => {
        if (err) return console.error(err)
        console.log('Token stored to', $TOKEN_FILE)
      })
      
      callback(oAuth2Client)
    })
  })
}

const generatePaybackData = async (_auth: any, fromYear: number | undefined = undefined) => {
    auth = _auth
    try {
      fs.unlinkSync($PAYBACK_FILE)
    } catch(err) {
      //console.log("ERR => ", err)
    }
    
    gmail = google.gmail({ version: 'v1', auth: _auth })
    gmail.users.messages.list({
      userId: 'me',
      //q: `from:Kundservicefirst@vasttrafik.se AND Subject:Värdekod ${ fromYear !== undefined ? 'AND after:' + fromYear + '-01-01' : '' }`
      q: `from:Kundservicefirst@vasttrafik.se AND Subject:Värdekod AND after:2010-01-01`
    }, handleEmail)
}

const handleEmail = (err: any, res: any) => {
  let promises: Promise<PaybackInterface>[] = []

  if (res !== undefined) {
      for (const { id } of res.data.messages) {
        promises.push(gmail.users.messages.get({ userId: 'me', id }))
      }
  }

  if (promises.length > 0) {
    Promise.all(promises).then((emailData: any) => {
      let paybackList: PaybackInterface[] = []

      let progressBar = createPaybackSyncProgressBar(emailData.length)

      for (const data of emailData) {
        let payback = handleEmailData(data)
        
        if (payback !== undefined) {
          paybackList.push(payback)
        }
        progressBar.increment()
      }

      paybackList.reverse()

      progressBar.stop()

      if (!fs.existsSync($PAYBACK_FILE)) {
        console.log(`${ chalk.bold.greenBright('Created payback file:') } ${ chalk.redBright($PAYBACK_FILE) }`)
      }

      fs.writeFileSync($PAYBACK_FILE, JSON.stringify(paybackList))
    })
  }
}

/** TODO: CHECK FOR PENDING PAYBACKS */
/*const formatPaybackList = (paybackList: PaybackInterface[]): any => {
  
}*/

const handleEmailData = (emailData: any): PaybackInterface | undefined => {
  const headers = emailData.data.payload.headers

  const subject = headers.filter((item: any) => item.name === 'Subject').map((item: any) => item.value)[0]
  let datetime = headers.filter((item: any) => item.name === 'Date').map((item: any) => convertDate(item.value, FORMAT.DATETIME))[0]
  const caseNumber = getCaseNumberFromSubject(subject)

  if (subject.indexOf('Värdekod gällande ärende') !== -1) {
    const htmlString = Buffer.from(emailData.data.payload.parts[0].body.data, 'base64').toString()
    const codeAndPrice = getCodeAndPriceFromHtml(htmlString)

    return <PaybackInterface>{
      datetime,
      caseNumber,
      code: codeAndPrice.code,
      price: codeAndPrice.price
    }
  } else if (subject.indexOf('Reklamation försenad resa') !== -1) {
    return <PaybackInterface>{
      datetime,
      caseNumber
    }
  }

  return undefined
}

const getCaseNumberFromSubject = (str: string) => {
    const regex = /\[([0-9A-Z]+)]/gm
    let m

    let caseNumber:any = ''

    let match:any = regex.exec(str)
    if (match !== null) {
        return match['1']
    } 
}

const getCodeAndPriceFromHtml = (htmlString: string) => {
    const dom = new JSDOM(htmlString)

    /** Get code */
    let codeUrl = dom.window.document.querySelector('a').getAttribute('href')
    const codeSplit = codeUrl.split('/')
    const code = codeSplit[codeSplit.length - 1]

    /** Get price */
    let price = 0
    const spanList = dom.window.document.querySelectorAll('span')
    for (const span of spanList) {
        const parseNumber = parseInt(span.textContent)
        if (Number.isInteger(parseNumber)) {
            price = parseNumber
            break
        }
    }

    return {
        code: code,
        price: price
    }
}

export {
    generatePaybackData,
    authorize
}