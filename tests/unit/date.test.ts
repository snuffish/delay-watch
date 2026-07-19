import { describe, it, expect } from 'vitest'
import { timeDifference, getDate, FORMAT } from '../../src/Utils/date'

describe('Date Utility - timeDifference', () => {
    it('should calculate positive minute difference between times on the same day', () => {
        const diff = timeDifference('10:00', '10:25')
        expect(diff).toBe(25)
    })

    it('should return 0 when times are identical', () => {
        const diff = timeDifference('14:30', '14:30')
        expect(diff).toBe(0)
    })

    it('should handle overnight train schedules correctly', () => {
        const diff = timeDifference('23:50', '00:10')
        expect(diff).toBe(20)
    })

    it('should return 0 for empty string inputs', () => {
        expect(timeDifference('', '12:00')).toBe(0)
        expect(timeDifference('12:00', '')).toBe(0)
    })

    it('should return a valid date string from getDate()', () => {
        const dateStr = getDate(FORMAT.DATE)
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
})
