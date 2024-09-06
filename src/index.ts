import { Client, ChatInputCommandInteraction } from "discord.js";
import { config } from "./config";
import { commands } from "./commands";
import { deployCommands } from "./deploy-commands";
import { generateGPTConfig } from "utils/generateGPTConfig";

export const client = new Client({
  intents: ["Guilds", "MessageContent"],
});

client.once("ready", async () => {
  console.log("GPT bot is ready!");
  await generateGPTConfig();
  
  for (const guild of client.guilds.cache.values()) {
    await deployCommands({ guildId: guild.id });
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }

  const commandInteraction = interaction as ChatInputCommandInteraction;

  const { commandName } = commandInteraction;
  if (commands[commandName as keyof typeof commands]) {
    commands[commandName as keyof typeof commands].execute(commandInteraction);
  }
});

client.login(config.DISCORD_TOKEN);
