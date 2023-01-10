const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Kill',
    description: 'Kills the given server!',
    category: 'Servers',
    enabled: true,
    options: [
        {
            name: "server_id",
            type: "STRING",
            description: "The ID of the server to kill!",
            required: true
        },
    ],
    needsAPIKey: true,
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();

        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

        let apiKey = await mysql.getApiKey(user.id, guild.id);
        let serverId = args.get ? args.get('server_id') ? args.get('server_id').value : undefined : args[0];
        if (!serverId) {
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
        let res = await new PterodactylUser(apiKey).setPowerState(serverId, "kill");
        if (res === 404||res === 403) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You don't have the required permission to use this server.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        let killServerEmbed = new Discord.EmbedBuilder()
        .setAuthor({name:`Kill Server`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setDescription(`Attempted to kill \`${serverId}\`.`)
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        interaction.editReply({ embeds: [killServerEmbed], ephemeral: true });
    }
}