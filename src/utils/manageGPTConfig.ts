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

export const updateJsonValue = (key: string, newValue: any): void => {
    try {
        const data = readGPTConfig();
        if (data.hasOwnProperty(key)) {
            data[key] = newValue;
        } else {
            throw new Error(`value "${key}" not found in the config file.`);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`the value "${key}" has been updated`);
    } catch (error) {
        console.error(`an error occurred : ${error}`);
    }
};

