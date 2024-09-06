import { ChatInputCommandInteraction, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageComponentInteraction } from "discord.js";
import { Context } from "services";
import { GPT } from "models/GPT";

export const data = new SlashCommandBuilder()
  .setName("gpt")
  .setDescription("ask something to gpt!")
  .addStringOption((option) =>
    option
      .setName("message")
      .setDescription("message to send")
      .setRequired(true)
  ).addStringOption((option) =>
    option
      .setName("model")
      .setDescription("model to use")
      .addChoices(
        { name: "gpt-4o", value: "gpt-4o" },
        { name: "gpt-4-turbo (default)", value: "gpt-4-turbo" },
        { name: "claude-3", value: "claude-3" },
        { name: "claude-3.5", value: "claude-3.5" },
        { name: "gemini-1.5", value: "gemini-1.5" },
      )
  );

const conversationContexts = new Map<string, Content>();

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const userRequest: string = interaction.options.getString("message", true);
  const model: string = interaction.options.getString("model") ?? "gpt-4-turbo";
  
  const userId = interaction.user.id;
  const conversation = conversationContexts.get(userId);
  const finalMessage = `${userRequest} (message sent by user "${interaction.user.globalName})"`;
  
  const gpt = new GPT(conversation ? conversation.model : model, conversation?.contexts);
  try{
    await gpt.sendMessage(finalMessage);
  } catch (e){
    console.log(e)
    return await interaction.editReply("An error occurred, try to change the model or retry later.")
  }
  const gptEmbed = gpt.makeEmbed(interaction, userRequest);

  const thanksButton = new ButtonBuilder()
    .setCustomId("thanks")
    .setLabel("Thanks!")
    .setStyle(ButtonStyle.Success);

  const continueButton = new ButtonBuilder()
    .setCustomId("continue")
    .setLabel("Continue the conversation")
    .setStyle(ButtonStyle.Primary);

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(continueButton, thanksButton);

  const response = await interaction.editReply({ embeds: [gptEmbed], components: [row] });
  const collectorFilter = (i: MessageComponentInteraction) => i.user.id === interaction.user.id;

  try {
    const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 120_000 });
    if (confirmation.customId === "thanks") {
      await confirmation.update({ content: "", components: [] });
      await gpt.sendMessage("Thanks for the answer, goodbye!");
      const embed = gpt.makeEmbed(interaction, "Thanks!");
      conversationContexts.delete(userId);
      console.log(conversationContexts);
      return await interaction.editReply({ embeds: [embed] });
    } else if (confirmation.customId === "continue") {
      await confirmation.update({ content: "", components: [] });
      const context = gpt.context;
      conversationContexts.set(userId, { model: model, contexts: context });
      return await interaction.followUp({ content: "You can now use /gpt again to continue the conversation.", ephemeral: true });
    }
  } catch (e) {
    return await interaction.editReply({ content: "", components: [] });
  }
}

interface Content {
  model: string;
  contexts: Context[];
}