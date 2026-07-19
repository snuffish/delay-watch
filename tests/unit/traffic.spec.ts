import { test, expect } from '@playwright/test'
import { getStationName } from '../../src/Utils/traffic'

test.describe('Traffic Utils Unit Tests', () => {

  test('should lookup station names by code in O(1) time', () => {
    expect(getStationName('SK')).toBe('Skövde C')
    expect(getStationName('G')).toBe('Göteborg C')
    expect(getStationName('THN')).toBe('Trollhättan C')
    expect(getStationName('N')).toBe('Nässjö C')
  })

  test('should handle case-insensitive station codes', () => {
    expect(getStationName('sk')).toBe('Skövde C')
    expect(getStationName('g')).toBe('Göteborg C')
  })

  test('should return raw location code if station code is not found in database', () => {
    expect(getStationName('UNKNOWN999')).toBe('UNKNOWN999')
  })

  test('should return empty string for null or empty station codes', () => {
    expect(getStationName('')).toBe('')
  })
})
