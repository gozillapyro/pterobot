const embed = require('../../Configs/embed.json');
const config = require('../../Configs/config.json');
let PterodactylAdmin = require('../../Structures/Panel/PterodactylAdmin.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const funcs = require('../../Functions.js');
module.exports = {
    name: 'AdminServer',
    description: 'Displays information about the specified server!',
    category: 'Administration',
    enabled: true,
    aliases: ['adminserverinfo', 'adminresources'],
    needsAPIKey: true,
    options: [
        {
            name: "server_id",
            type: "STRING",
            description: "The ID of the server check!",
            required: true
        },
    ],
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();

        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

        let apiKey = await mysql.getApiKey(user.id);
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
            .setAuthor({ name: `${this.name} - Invalid Usage`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : "" })
            .setDescription(`**<string>:** Required argument\n**[string]:** Optional argument\n\nThe correct usage for this command is: \`${mainConfig.bot.prefix === "" ? "/" : mainConfig.bot.prefix}${this.name} ${usage.join(' ')}\``)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [usageEmbed], ephemeral: true });
            return;
        }
        let serverID1 = await funcs.getInternalIdFromPublic(serverId, apiKey, user);
        let server = await new PterodactylAdmin(apiKey).getServer(serverID1);
        if (!server||server===403||server===404) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({ name: `${this.name} - Invalid Server`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : "" })
            .setDescription(`Couldn't find a server with the id \`${serverId}\`. Either it dosen't exist or you don't have permisson to view it.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        server = server.attributes;

        let node = await new PterodactylAdmin(apiKey).getNode(server.node);
        if (!node||node===403||node===404) {
            node = server.node;
        }
        let owner = await new PterodactylAdmin(apiKey).getUser(server.user);
        if (!owner||owner[0]===403||owner[0]===404) {
            owner = server.user;
        }

        let commandServerEmbed = new Discord.EmbedBuilder()
        .setAuthor({ name: `Server Info`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : "" })
        .setTitle(`${server.identifier}`)
        .addFields({name:`Server Internal ID:`, value:`\`${server.id}\``, inline:true})
        .addFields({name:`Server Identifier:`, value:`\`${server.identifier}\``, inline:true})
        .addFields({name:`Server Name:`, value:`\`${server.name}\``, inline:true})
        .addFields({name:`Server Owner:`, value:`\`${typeof owner == "number" ? owner : owner.attributes.username}\``, inline:true})
        .addFields({name:`Server Node:`, value:`\`${typeof node == "number" ? node : node.attributes.name}\``, inline:true})
        .addFields({name:`Server Suspended:`, value:`\`${server.is_suspended === undefined ? 'false' : server.is_suspended}\``, inline:true})
        .addFields({name:`Allowed Databases:`, value:`\`${server.feature_limits.databases}\``, inline:true})
        .addFields({name:`Allowed Backups:`, value:`\`${server.feature_limits.backups}\``, inline:true})
        .addFields({name:`Allocated Memory:`, value:`\`${server.limits.memory}MB\``, inline:true})
        .addFields({name:`Disk:`, value:`\`${server.limits.disk}MB\``, inline:true})
        .addFields({name:`CPU:`, value:`\`${server.limits.cpu}%\``, inline:true})
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        interaction.editReply({ embeds: [commandServerEmbed], ephemeral: true });
    }
}