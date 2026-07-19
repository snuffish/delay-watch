import fs from 'fs'
import terminalLink from 'terminal-link'

export const readFromFile = (filepath: string): string => {
    const dataBuffer = fs.readFileSync(filepath)
    return Buffer.from(dataBuffer).toString()
}

export const getJsonFile = (filepath: string): any => {
    if (!fs.existsSync(filepath)) {
        return null
    }
    const jsonString = readFromFile(filepath)
    return JSON.parse(jsonString)
}

// Backward compatibility alias
export const getJsonFie = getJsonFile

export const link = (title: string, url: string) => terminalLink(title, url)
