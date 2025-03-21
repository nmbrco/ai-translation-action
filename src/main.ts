import * as core from '@actions/core'
import OpenAI from 'openai'
import fs from 'node:fs'
import path from 'node:path'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    console.log(__dirname)
    const basepath = '/home/runner/work/api-core/api-core'

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

    const filepath = path.join(basepath, source)

    console.log('filepath', filepath, fs.existsSync(filepath))

    const file = await client.files.create({
      file: fs.createReadStream(filepath),
      purpose: 'user_data'
    })

    console.log(file)

    const vector = await client.vectorStores.create({
      file_ids: [file.id]
    })

    await sleep(5000)

    console.log(vector)

    const prompt = `
      Follow the instructions below:
      0. Translate the json contents from attached file id ${file.id}. 
      1. Act as professional translator and translate provided JSON from english to french;
      4. Use file context and file name to get additional information for translation process;
      7. Parse the provided JSON into an array, translate the 'text' property of each object in the array to %targetLanguage% according to the instructions using terms, translation memory matches and file context, do not ignore html markup in the text, if some text cannot be translated then put '' string in 'text' property, serialise the resulting array into JSON, and send that JSON as a response;
      8. Do not skip objects in JSON and do not add new objects;
      9. Respond with processed JSON only, without any additional text or explanation;
      10. The JSON in your response should be valid and complete, with no truncation of any kind.
      11. Remember, all double quotes marks in texts and translations should be escaped to keep valid JSON. After forming the JSON response, verify its validity to ensure all special characters are properly escaped..
    `

    const response = await client.responses.create({
      model: 'gpt-4o',
      tools: [
        {
          type: 'file_search',
          vector_store_ids: [vector.id]
        }
      ],
      tool_choice: 'required',
      text: { format: { type: 'json_object' } },
      instructions: 'You are a professional language translator.',
      input: prompt
    })

    console.log(response.output_text)

    fs.writeFileSync(
      path.join(basepath, destination, 'fr.json'),
      response.output_text
    )
  } catch (error) {
    console.error(error)
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}

export const sleep = async (milliseconds: number) => {
  return new Promise((resolve) => {
    console.log('Sleeping...')
    setTimeout(() => {
      console.log('Awake!')
      resolve(true)
    }, milliseconds)
  })
}
