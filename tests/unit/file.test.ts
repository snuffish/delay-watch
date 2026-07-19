import { describe, it, expect } from 'vitest'
import { getJsonFile } from '../../src/Utils/file'
import path from 'path'

describe('File Utility - getJsonFile', () => {
    it('should parse valid JSON file correctly', () => {
        const filePath = path.resolve(__dirname, '../../package.json')
        const data = getJsonFile(filePath)
        expect(data).toBeDefined()
        expect(data.name).toBe('delay-watch')
    })

    it('should return null for non-existent file path without throwing', () => {
        const nonExistentPath = path.resolve(__dirname, 'non_existent_file.json')
        const result = getJsonFile(nonExistentPath)
        expect(result).toBeNull()
    })
})
