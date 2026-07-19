import { describe, it, expect } from 'vitest'
import { getStationName } from '../../src/Utils/traffic'

describe('Traffic Utility - getStationName', () => {
    it('should resolve known station code to station name', () => {
        const name = getStationName('Sk')
        expect(name).toBe('Skövde C')
    })

    it('should handle lowercase location code correctly', () => {
        const name = getStationName('g')
        expect(name).toBe('Göteborg C')
    })

    it('should return location code if station code is not found', () => {
        const unknownCode = 'UNKNOWN99'
        const name = getStationName(unknownCode)
        expect(name).toBe(unknownCode)
    })

    it('should return empty string for empty input', () => {
        expect(getStationName('')).toBe('')
    })
})
