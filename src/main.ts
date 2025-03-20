import * as core from '@actions/core'
import OpenAI from 'openai'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const branch: string = core.getInput('branch')
    const source: string = core.getInput('source')
    const destination: string = core.getInput('destination')
    const open_ai_key: string = core.getInput('open_ai_key')

    console.log('branch', branch)
    console.log('source', source)
    console.log('destination', destination)

    const client = new OpenAI({
      apiKey: open_ai_key
    })

    const response = await client.responses.create({
      model: 'gpt-4o',
      instructions: 'You are a coding assistant that talks like a pirate',
      input: 'Are semicolons optional in JavaScript?'
    })

    console.log(response.output_text)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
