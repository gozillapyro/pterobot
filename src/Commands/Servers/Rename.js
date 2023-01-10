const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const funcs = require('../../Functions.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Rename',
    description: 'Renames the given server!',
    category: 'Servers',
    enabled: true,
    options: [
        {
            name: "server_id",
            type: "STRING",
            description: "The ID of the server to rename!",
            required: true
        },
        {
            name: "new_name",
            type: "STRING",
            description: "The new name!",
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
        let newName = args.get ? args.get('new_name') ? args.get('new_name').value : undefined : args[0];
        if (!serverId || !newName) {
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
        let server = await funcs.getServerByID(serverId, apiKey);
        if (!server) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Invalid Server`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`Couldn't find a server with the id \`${serverId}\`. Either it dosen't exist or you don't have permisson to view it.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        let oldName = server.attributes.name;
        let res = await new PterodactylUser(apiKey).renameServer(serverId, newName);
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
        let renameServerEmbed = new Discord.EmbedBuilder()
        .setAuthor({name:`Rename Server`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setDescription(`Changed the name of \`${serverId}\` from \`${oldName}\` to \`${newName}\`.`)
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        interaction.editReply({ embeds: [renameServerEmbed], ephemeral: true });
    }
}