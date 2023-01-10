const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Send',
    description: 'Sends a command to the given server!',
    category: 'Servers',
    enabled: true,
    aliases: ['execute', 'run', 'runcmd', 'executecmd', 'sendcmd'],
    options: [
        {
            name: "server_id",
            type: "STRING",
            description: "The ID of the server to send the command to!",
            required: true
        },
        {
            name: "command",
            type: "STRING",
            description: "The command to send!",
            required: true
        }
    ],
    needsAPIKey: true,
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();
        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');
        let apiKey = await mysql.getApiKey(user.id, guild.id);
        let pteroClient = new PterodactylUser(apiKey);
        let serverId = args.get ? args.get('server_id') ? args.get('server_id').value : undefined : args[0];
        let command = args.get ? args.get('command') ? args.get('command').value : undefined : args[0];
        if (!serverId || !command) {
            let usage = [];
            this.options.forEach(o => {
                if (o.required) {
                    usage.push(`<${o.type.toLowerCase()}>`);
                } else {
                    usage.push(`[${o.type.toLowerCase()}]`);
                }
            });
            let usageEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Invalid Usage`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`**<string>:** Required argument\n**[string]:** Optional argument\n\nThe correct usage for this command is: \`${mainConfig.bot.prefix === "" ? "/" : mainConfig.bot.prefix}${this.name} ${usage.join(' ')}\``)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [usageEmbed], ephemeral: true });
            return;
        }
        let response = await pteroClient.sendCommand(command, serverId);
        if (response === 404||response === 403) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You don't have the required permission to use this server.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        if (!response.includes("has successfully been sent to")) {
            let commandNotSentEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Command Send`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`${response}`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [commandNotSentEmbed], ephemeral: true });
        } else {
            let commandSentEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Command Send`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`${response}`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [commandSentEmbed], ephemeral: true });
        }
    }
}