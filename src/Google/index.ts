import fs from "fs";
import readline from "readline";
import { google } from "googleapis";
import PaybackInterface from "./PaybackInterface";
import { $TOKEN_FILE, $PAYBACK_FILE, $GOOGLE_CREDENTIALS } from "../FilePaths";
import { convertDate, FORMAT } from "../Utils/date";
import { createPaybackSyncProgressBar } from "../Utils/progress";
import chalk from "chalk";
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
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
const authorize = (credentials: any, callback: any): any => {
    if (!credentials || (!credentials.installed && !credentials.web)) {
        console.error(
            chalk.red.bold(
                "\n[Error] Google OAuth credentials file missing or invalid.",
            ),
        );
        console.error(chalk.yellow(`Expected file at: ${$GOOGLE_CREDENTIALS}`));
        console.error(
            chalk.gray(
                `To enable Gmail payback sync, download your OAuth 2.0 Client Credentials JSON from Google Cloud Console and save it to:\n${$GOOGLE_CREDENTIALS}\n`,
            ),
        );
        return;
    }

    const creds = credentials.installed || credentials.web;
    const { client_secret, client_id, redirect_uris } = creds;
    const redirectUri =
        redirect_uris && redirect_uris.length > 0
            ? redirect_uris[0]
            : "urn:ietf:wg:oauth:2.0:oob";
    const oAuth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirectUri,
    );

    // Check if we have previously stored a token.
    fs.readFile($TOKEN_FILE, (err: any, token: any) => {
        if (err) return getNewToken(oAuth2Client, callback);
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    });
};

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
const getNewToken = (oAuth2Client: any, callback: any): any => {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });

    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question("Enter the code from that page here: ", (code) => {
        rl.close();

        oAuth2Client.getToken(code, (err: any, token: any) => {
            if (err) return console.error("Error retrieving access token", err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile($TOKEN_FILE, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log("Token stored to", $TOKEN_FILE);
            });

            callback(oAuth2Client);
        });
    });
};

const generatePaybackData = async (
    _auth: any,
    fromYear: number | undefined = undefined,
) => {
    try {
        fs.unlinkSync($PAYBACK_FILE);
    } catch {
        // File did not exist yet — nothing to remove.
    }

    const gmail = google.gmail({ version: "v1", auth: _auth });
    const query = `from:Kundservicefirst@vasttrafik.se AND Subject:Värdekod AND after:${fromYear ?? 2010}-01-01`;

    try {
        // Gmail caps list responses (~100 messages) — page through everything so
        // older paybacks aren't silently missed.
        const messageIds: string[] = [];
        let pageToken: string | undefined = undefined;
        do {
            const res: any = await gmail.users.messages.list({
                userId: "me",
                q: query,
                pageToken,
            });
            for (const message of res.data.messages ?? []) {
                if (message.id) messageIds.push(message.id);
            }
            pageToken = res.data.nextPageToken ?? undefined;
        } while (pageToken);

        if (messageIds.length === 0) {
            console.log(chalk.yellow("No payback emails found."));
            return;
        }

        const emailData = await Promise.all(
            messageIds.map((id) => gmail.users.messages.get({ userId: "me", id })),
        );

        const paybackList: PaybackInterface[] = [];
        const progressBar = createPaybackSyncProgressBar(emailData.length);

        for (const data of emailData) {
            const payback = handleEmailData(data);
            if (payback !== undefined) {
                paybackList.push(payback);
            }
            progressBar.increment();
        }

        paybackList.reverse();
        progressBar.stop();

        if (!fs.existsSync($PAYBACK_FILE)) {
            console.log(
                `${chalk.bold.greenBright("Created payback file:")} ${chalk.redBright($PAYBACK_FILE)}`,
            );
        }

        fs.writeFileSync($PAYBACK_FILE, JSON.stringify(paybackList));
    } catch (error) {
        console.error(chalk.red.bold("Failed to sync paybacks from Gmail:"), error);
    }
};

/** TODO: CHECK FOR PENDING PAYBACKS */
/*const formatPaybackList = (paybackList: PaybackInterface[]): any => {
  
}*/

const handleEmailData = (emailData: any): PaybackInterface | undefined => {
    const headers: any[] = emailData?.data?.payload?.headers ?? [];

    const subject: string = headers
        .filter((item: any) => item.name === "Subject")
        .map((item: any) => item.value)[0] ?? "";
    const datetime = headers
        .filter((item: any) => item.name === "Date")
        .map((item: any) => convertDate(item.value, FORMAT.DATETIME))[0];
    const caseNumber = getCaseNumberFromSubject(subject);

    if (subject.indexOf("Värdekod gällande ärende") !== -1) {
        const bodyData = emailData?.data?.payload?.parts?.[0]?.body?.data;
        if (!bodyData) return undefined;

        const htmlString = Buffer.from(bodyData, "base64").toString();
        const codeAndPrice = getCodeAndPriceFromHtml(htmlString);

        return <PaybackInterface>{
            datetime,
            caseNumber,
            code: codeAndPrice.code,
            price: codeAndPrice.price,
        };
    } else if (subject.indexOf("Reklamation försenad resa") !== -1) {
        return <PaybackInterface>{
            datetime,
            caseNumber,
        };
    }

    return undefined;
};

const getCaseNumberFromSubject = (str: string): string => {
    const match = /\[([0-9A-Z]+)]/.exec(str);
    return match !== null ? match[1] : "";
};

const getCodeAndPriceFromHtml = (htmlString: string) => {
    const dom = new JSDOM(htmlString);

    /** Get code */
    const codeUrl = dom.window.document.querySelector("a")?.getAttribute("href") ?? "";
    const codeSplit = codeUrl.split("/");
    const code = codeSplit[codeSplit.length - 1];

    /** Get price */
    let price = 0;
    const spanList = dom.window.document.querySelectorAll("span");
    for (const span of spanList) {
        const parseNumber = parseInt(span.textContent ?? "");
        if (Number.isInteger(parseNumber)) {
            price = parseNumber;
            break;
        }
    }

    return {
        code: code,
        price: price,
    };
};

export { generatePaybackData, authorize };
