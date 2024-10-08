import { DiscordInteractions, ApplicationCommandOptionType } from "slash-commands";

export const COMMAND_NAME = {
    ADD: 'add',
    SUBTRACT: 'subtract',
    SCOREBOARD: 'scoreboard'
}

const commonOptions = [
    {
        type: ApplicationCommandOptionType.USER,
        name: "username",
        description: "Nazwa użytkownika",
        required: true
    },
    {
        type: ApplicationCommandOptionType.STRING,
        name: "reason",
        description: "Powód",
        required: false
    }
]

const commandAdd = {
  name: COMMAND_NAME.ADD,
  description: "Dodaje punkty kar cielesnych",
  options: commonOptions
};

const commandSubtract = {
  name: COMMAND_NAME.SUBTRACT,
  description: "Odejmuje punkty kar cielesnych",
  options: commonOptions
};

const commandScoreboard = {
  name: COMMAND_NAME.SCOREBOARD,
  description: "Pokaż tablicę wyników",
};
export const handleBotCommands = async (applicationId, authToken, publicKey, guildId) => {

    const interaction = new DiscordInteractions({
        applicationId,
        authToken,
        publicKey
    });

    let commands = await interaction.getApplicationCommands(guildId);
    await Promise.all(commands.map(async command => {
        /* if(
            command.name !== COMMAND_NAME.ADD && 
            command.name !== COMMAND_NAME.SUBTRACT && 
            command.name !== COMMAND_NAME.SCOREBOARD
        ) {
            interaction.deleteApplicationCommand(command.id, guildId);
            interaction.deleteApplicationCommand(command.id);
        } */
        await interaction.deleteApplicationCommand(command.id, guildId);
        await interaction.deleteApplicationCommand(command.id);
    }));
    commands = await interaction.getApplicationCommands(guildId);
    const command = commands.map(command => command.name);
    if(!command.includes(COMMAND_NAME.ADD)) {
        console.log('Missing add command, adding it...');
        await interaction.createApplicationCommand(commandAdd, guildId);
    }
    if(!command.includes(COMMAND_NAME.SUBTRACT)) {
        console.log('Missing subtract command, adding it...');
        await interaction.createApplicationCommand(commandSubtract, guildId);
    }
    if(!command.includes(COMMAND_NAME.SCOREBOARD)) {
        console.log('Missing scoreboard command, adding it...');
        await interaction.createApplicationCommand(commandScoreboard, guildId);
    }
    return commands;
}