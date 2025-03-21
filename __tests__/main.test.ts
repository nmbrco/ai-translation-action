/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

jest.setTimeout(30 * 1000)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation((key) => {
      switch (key) {
        case 'source':
          return './__fixtures__/en.json'
          break
        case 'destination':
          return './__fixtures__/'
          break
        case 'branch':
          return 'main'
          break
        case 'open_ai_key':
          return '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'
          break
      }

      return ''
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Sets the time output', async () => {
    await run()
  })
})
