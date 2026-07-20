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
    try {
        return JSON.parse(readFromFile(filepath))
    } catch (error) {
        console.error(`Failed to parse JSON file '${filepath}':`, error)
        return null
    }
}

export const link = (title: string, url: string) => terminalLink(title, url)
