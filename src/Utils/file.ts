import fs from 'fs'
import terminalLink from 'terminal-link'

export const readFromFile = (filepath: string): string => {
    const dataBuffer = fs.readFileSync(filepath)
    return Buffer.from(dataBuffer).toString()
}

export const getJsonFie = (filepath: string): any => {
    const jsonString = readFromFile(filepath)
    return JSON.parse(jsonString)
}

export const link = (title: string, url: string) => terminalLink(title, url)
