import { ActionRowBuilder, ChatInputCommandInteraction, ModalBuilder, ModalSubmitInteraction, SlashCommandBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { updateJsonValue } from "utils/manageGPTConfig";

export const data = new SlashCommandBuilder()
    .setName("configure")
    .setDescription("bot configuration")
    .addSubcommandGroup(group =>
        group
            .setName('gpt')
            .setDescription('Gestion des paramètres')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('prompt')
                    .setDescription('Définir un paramètre')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('paymessage')
                    .setDescription('show the you need to pay message or not')
                    .addBooleanOption(option =>
                        option.setName('togglemessage')
                            .setDescription('true to show it, false to hide it')
                            .setRequired(true)
                    )
            )
    );

export async function execute(interaction: ChatInputCommandInteraction) {
    const group = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    if (group === 'gpt') {
        if (subcommand === 'paymessage') {
            const value = interaction.options.getBoolean('togglemessage');
            try{
                updateJsonValue("upgradeMessage", value);
                return interaction.reply("The value has been set to " + value);
            } catch (e){
                console.log(e)
                return await interaction.reply(`An error occurred, please check the console.`);
            }

        } else if (subcommand === 'prompt') {
            const modal = new ModalBuilder()
                .setCustomId('promptModal')
                .setTitle('New prompt');
            const textInput = new TextInputBuilder()
                .setCustomId('inputText')
                .setLabel('prompt')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Youll act like a catboy working in a walmart...')

            const actionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(textInput);
            modal.addComponents(actionRow);
            return await interaction.showModal(modal);
        }
    }
}

export async function handleModalSubmission(interaction: ModalSubmitInteraction) {
    if (interaction.customId === 'promptModal') {
        const userInput = interaction.fields.getTextInputValue('inputText');
        try{
            updateJsonValue("prompt", userInput);
            return await interaction.reply(`The prompt has been updated`);
        } catch(e){
            console.log(e)
            return await interaction.reply(`An error occurred, please check the console.`);
        }
    }
}