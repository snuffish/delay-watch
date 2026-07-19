import { test, expect } from '@playwright/test'
import { getDate, timeDifference, FORMAT } from '../../src/Utils/date'

test.describe('Date Utils Unit Tests', () => {

  test('should return current date in YYYY-MM-DD format', () => {
    const today = getDate(FORMAT.DATE)
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  test('should calculate positive minute difference between scheduled and actual departure times', () => {
    const diff = timeDifference('10:00', '10:25')
    expect(diff).toBe(25)
  })

  test('should return 0 when departure is on time', () => {
    const diff = timeDifference('10:00', '10:00')
    expect(diff).toBe(0)
  })

  test('should handle invalid or empty time strings gracefully', () => {
    expect(timeDifference('', '10:15')).toBe(0)
    expect(timeDifference('10:00', '')).toBe(0)
    expect(timeDifference('invalid', '10:15')).toBe(0)
  })

  test('should handle overnight trip times correctly', () => {
    const diff = timeDifference('23:50', '00:15')
    expect(diff).toBe(25)
  })
})
