import * as fs from 'fs';
import * as path from 'path';

export async function generateGPTConfig() {
    const filePath = path.resolve(process.cwd(), 'gptConfig.json');

    const gptConfig = {
        prompt: "You'll act like a catboy saying uwu all the time",
        plugins: ["Browse Web", "Google Search"],
        upgradeMessage: true,
    };

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify(gptConfig, null, 2), 'utf-8');
        console.log('gptconfig file created!');
    } else {
        console.log('gptconfig file already exists');
    }
}
