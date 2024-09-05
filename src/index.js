import { Client, Events, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { configDotenv } from 'dotenv';

import { handleBotCommands, COMMAND_NAME } from './commands.js';
import { BackendHandler } from './backendHandler.js';
configDotenv();

if(
    process.env.DISCORD_KEY === undefined || 
    process.env.BACKEND_URL === undefined ||
    process.env.DISCORD_APP_ID === undefined ||
    process.env.DISCORD_PUBLIC_KEY === undefined ||
    process.env.DISCORD_GUILD_ID === undefined
) {
    console.error('MISSING ENVS');
    process.exit(1);
}
const token = process.env.DISCORD_KEY;
const backendUrl = process.env.BACKEND_URL;
const discordAppId = process.env.DISCORD_APP_ID;
const discordPublicKey = process.env.DISCORD_PUBLIC_KEY;
const discordGuildId = process.env.DISCORD_GUILD_ID;


const backendHandler = new BackendHandler(backendUrl);

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMembers, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent,
  ] 
});

handleBotCommands(discordAppId, token, discordPublicKey, discordGuildId);

client.on('ready', async () => {
  const guild = client.guilds.cache.get(discordGuildId);
  const members = await guild.members.fetch()
  const usernames = members.map(member => member.user.username)
  const botNameIndex = usernames.indexOf(client.user.username);
  if(botNameIndex > -1) {
    usernames.splice(botNameIndex, 1);
  }
  backendHandler.deleteUsersNotOnServer(usernames);
  backendHandler.addUsersNotOnServer(usernames);
  console.log('Ready!');
});

const getEmbed = async () => {
    const users = await backendHandler.getUsers();
    const sortedUsers = users.sort((a, b) => b.points - a.points);
    const embed = new EmbedBuilder()
        .setColor(0x51267)
        .addFields({ name: 'Tablica wyników', value: sortedUsers.map(u=>u.name).join('\n'), inline: true },
            { name: 'Punkty', value: sortedUsers.map(u=>u.points.toString()).join('\n'), inline: true });
    return embed;
}


client.on(Events.GuildMemberAdd, async (member) => {
    console.log('User joined: ', member.user.username);
    await backendHandler.addUser(member.user.username);
});

client.on(Events.GuildMemberRemove, async (member) => {
    console.log('User left: ', member.user.username);
    await backendHandler.deleteUser(member.user.username);
});


const parseMessage = async (interaction) => {
    const username = interaction.options.getMember('username');
    const reason = interaction.options.getString('reason');
    if(reason) {
        return `${username.user.username}, ${reason}`;
    }
    if(interaction.commandName === COMMAND_NAME.ADD) {
        return `${username.user.username}, jest jeden krok bliżej od wygrania kary cielesnej!`;
    }
    if(interaction.commandName === COMMAND_NAME.SUBTRACT) {
        return `${username.user.username}, prawdopodobnie nie bedzie bity/bita!`;
    }

}

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;
	if (interaction.commandName === COMMAND_NAME.ADD) {
        console.log('Adding points to: ', username.user.username);
        await backendHandler.addPoints(username.user.username);

        await interaction.reply({ 
            content: parseMessage(interaction), 
            embeds: [await getEmbed()]
        });
	}
    
    if (interaction.commandName === COMMAND_NAME.SUBTRACT) {
        console.log('Subtracting points from: ', username.user.username);
        await backendHandler.subtractPoints(username.user.username);
		
        await interaction.reply({ 
            content: parseMessage(interaction), 
            embeds: [await getEmbed()]
        });
	}

    if (interaction.commandName === COMMAND_NAME.SCOREBOARD) {
        await interaction.reply({ embeds: [await getEmbed()] });    
    }
});

client.login(token);