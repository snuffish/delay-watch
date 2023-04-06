import { setApiKey, send, } from '@sendgrid/mail';
const { SENDGRID_API_KEY } = process.env

import fs from 'fs'

const templateId = 'd-85a725d8aa2543489db7912f28a39873'

export const sendDailyReport = (sendTo: string, scanResults: any) => {
    if (!SENDGRID_API_KEY) {
        console.log(`Environment variable 'SENDGRID_API_KEY' not set!`)
    }

    if (SENDGRID_API_KEY) {
        setApiKey(SENDGRID_API_KEY);

        const msg = {
            from: { email: 'delay-watch@heroku.com' },
            personalizations: [
              {
                to: [{ email: sendTo }],
                dynamic_template_data: {
                    scanResults: scanResults
                }
              }
            ],
            template_id: templateId
          }

        //send(msg)

        /** TOD: IX IF MESSAGE ACTUALLY GOT SENT */
        return true
    }

    return false
}