import HOME_DIR from 'user-home'

export const $HOME = HOME_DIR
export const $DELAY_WATCH_DIR = `${ $HOME }/.delay-watch`
export const $CONFIG_FILE = `${ $DELAY_WATCH_DIR }/config.json`
export const $PAYBACK_FILE = `${ $DELAY_WATCH_DIR }/payback.json`
export const $TOKEN_FILE = `${ $DELAY_WATCH_DIR }/token.json`
export const $GOOGLE_CREDENTIALS = `${ $DELAY_WATCH_DIR }/google-credentials.json`