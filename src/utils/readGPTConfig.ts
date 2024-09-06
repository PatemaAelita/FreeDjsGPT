import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(process.cwd(), 'gptConfig.json');

interface GptConfig {
  prompt: string,
  plugins: string[],
  upgradeMessage: boolean,
}

export function readGPTConfig(): GptConfig {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}
