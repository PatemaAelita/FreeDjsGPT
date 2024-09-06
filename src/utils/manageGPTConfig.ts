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
            throw new Error(`Clé "${key}" non trouvée dans le fichier JSON.`);
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Valeur mise à jour pour la clé "${key}" dans ${filePath}.`);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour de la valeur : ${error.message}`);
    }
};

