import { setApiKey, send } from '@sendgrid/mail';
const { SENDGRID_API_KEY } = process.env

const templateId = 'd-85a725d8aa2543489db7912f28a39873'

export const sendDailyReport = async (sendTo: string, scanResults: any): Promise<boolean> => {
    if (!SENDGRID_API_KEY) {
        console.log(`Environment variable 'SENDGRID_API_KEY' not set!`)
        return false
    }

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

    try {
        const [response] = await send(msg as any)
        return response.statusCode >= 200 && response.statusCode < 300
    } catch (error) {
        console.error(`Failed to send daily report to ${sendTo}:`, error)
        return false
    }
}
