const embed = require('../../Configs/embed.json');
const funcs = require('../../Functions.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'BotInfo',
    description: 'Displays information about this bot!',
    category: 'General',
    enabled: true,
    aliases: ['bi'],
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;

        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

        let botInfoEmbed = new Discord.EmbedBuilder()
        .setAuthor({ name: `BotInfo`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        .setDescription(`**__${client.user.tag}__**\n\`Developed By:\` Tomsoz#7766\n\`Uptime:\` ${await funcs.msToTime(client.uptime)}\n\`Total Commands:\` ${client.commands.size}\n\`Panel URL:\` ${mainConfig.panel.url}`)
        interaction.editReply({ embeds: [botInfoEmbed], ephemeral: true });
        return;
    }
}