import fs from 'fs'
import { runScript } from './run-in-docker'

const [filePath] = process.argv.slice(-1)
if (!filePath || !fs.existsSync(filePath)) throw new Error('File not found. Expected a file path like "samples/php/test.php"')

runScript(filePath, 'off').then((rawJSON) => {
  try {
    console.dir({ json: JSON.parse(rawJSON) }, { colors: true, depth: 9 })
    fs.writeFileSync('./results/tmp.json', rawJSON, 'utf-8')
  } catch {
    console.info('could not parse JSON', rawJSON)
  }
})
