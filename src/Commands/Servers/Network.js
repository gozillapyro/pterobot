const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
const funcs = require('../../Functions.js');
module.exports = {
    name: 'Network',
    description: 'Displays network allocations for the given server!',
    category: 'Servers',
    enabled: true,
    aliases: ['ports'],
    options: [
        {
            name: "list",
            type: "SUB_COMMAND",
            description: "Lists all of the network allocations for a server!",
            options: [
                {
                    name: "server_id",
                    type: "STRING",
                    description: "The ID of the server to get ports from!",
                    required: true
                }
            ]
        },
        {
            name: "create",
            type: "SUB_COMMAND",
            description: "Creates a new network allocation!",
            options: [
                {
                    name: "server_id",
                    type: "STRING",
                    description: "The ID of the server to create it for!",
                    required: true
                }
            ]
        },
        {
            name: "delete",
            type: "SUB_COMMAND",
            description: "Deletes a network allocation!",
            options: [
                {
                    name: "server_id",
                    type: "STRING",
                    description: "The ID of the server to delete it from!",
                    required: true
                },
                {
                    name: "port",
                    type: "INTEGER",
                    description: "The port of the allocation to delete!",
                    required: true
                }
            ]
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
        

        switch (args.getSubcommand()) {
            case "list": {
                let allocations = await pteroClient.getNetworkAllocations(serverId);
                if (allocations === 404 || allocations === 403 || !allocations) {
                    let permissionsEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`You don't have the required permission to use this server.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.blue)
                    interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                    return;
                }
                let responseEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:"Network Allocations",iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`Here's a list of the network allocations for \`${serverId}\`.\n\`Max:\` ${allocations.data.length}`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue);
                for (const allo of allocations.data) {
                    responseEmbed.addFields({name:`__${allo.attributes.port}:__`, value:`\`IP:\` ${allo.attributes.ip}\n\`Port:\` ${allo.attributes.port}\n\`Notes:\` ${allo.attributes.notes ? allo.attributes.notes : "None"}\n\`Default:\` ${allo.attributes.is_default}`, inline:true});
                }
                interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
                return;
            }
            case "create": {
                let allo = await pteroClient.createNetworkAllocation(serverId);
                if (allo === 404 || allo === 403 || !allo) {
                    let permissionsEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`You don't have the required permission to use this server.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.blue)
                    interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                    return;
                }
                let responseEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:"Network Allocations - Success",iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`Successfully created allocation.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue)
                .addField(`__${allo.attributes.port}:__`, `\`ID:\` ${allo.attributes.id}\n\`IP:\` ${allo.attributes.ip}\n\`Port:\` ${allo.attributes.port}\n\`Notes:\` ${allo.attributes.notes ? allo.attributes.notes : "None"}\n\`Default:\` ${allo.attributes.is_default}`, true);
                interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
                return;
            }
            case "delete": {
                const allocation = await funcs.getAllocationByPort(serverId, apiKey, args.getInteger("port"));

                if (!allocation) {
                    let responseEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:"Network Allocations - Error",iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`Invalid port.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.red)
                    interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
                    return;
                }

                const code = await pteroClient.deleteNetworkAllocation(serverId, allocation.attributes.id)
                if (code === 400) {
                    let responseEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:"Network Allocations - Error",iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`You can't delete the primary allocation.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.red)
                    interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
                    return;
                }
                if (code === 404 || code === 403 || !code) {
                    let permissionsEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`You don't have the required permission to use this server.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.blue)
                    interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                    return;
                }

                let responseEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:"Network Allocations - Success",iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`Successfully deleted allocation.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue)
                interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
                return;
            }
        }
    }
}