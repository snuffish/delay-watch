import { test, expect } from '@playwright/test'
import { getJsonFile } from '../../src/Utils/file'

test.describe('File Utils Unit Tests', () => {

  test('should safely load valid JSON file', () => {
    const data = getJsonFile('package.json')
    expect(data).toBeDefined()
    expect(data).toHaveProperty('name', 'delay-watch')
    expect(data).toHaveProperty('version')
  })

  test('should return null when loading non-existent JSON file', () => {
    const data = getJsonFile('non_existent_file.json')
    expect(data).toBeNull()
  })
})
