const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const funcs = require('../../Functions.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Databases',
    description: 'Commands about databases!',
    category: 'Servers',
    enabled: true,
    needsAPIKey: true,
    options: [
        {
            name: "list",
            type: "SUB_COMMAND",
            description: "Lists all of the databases for a server!",
            options: [
                {
                    name: "server_id",
                    type: "STRING",
                    description: "The ID of the server to get databases from!",
                    required: true
                }
            ]
        },
        {
            name: "create",
            type: "SUB_COMMAND",
            description: "Creates a new database!",
            options: [
                {
                    name: "server_id",
                    type: "STRING",
                    description: "The ID of the server to create it for!",
                    required: true
                },
                {
                    name: "name",
                    type: "STRING",
                    description: "The name of the database to create!",
                    required: true
                },
                {
                    name: "connections_from",
                    type: "STRING",
                    description: "Where connections should be allowed from!"
                }
            ]
        },
        {
            name: "delete",
            type: "SUB_COMMAND",
            description: "Deletes a database!",
            options: [
                {
                    name: "server_id",
                    type: "STRING",
                    description: "The ID of the server to delete it from!",
                    required: true
                },
                {
                    name: "name",
                    type: "STRING",
                    description: "The name of the database to delete!",
                    required: true
                }
            ]
        }
    ],
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();
        const serverId = args.get ? args.get('server_id') ? args.get('server_id').value : undefined : args[0];

        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

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
        let apiKey = await mysql.getApiKey(user.id);
        switch (args.getSubcommand()) {
            case "list": {
                let res = await new PterodactylUser(apiKey).listDatabases(serverId);
                let server = await new PterodactylUser(apiKey).getServer(serverId);
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
                let databases = [];
                res.data.forEach(db => {
                    databases.push(db);
                });
                const backId = 'previousPage'
                const forwardId = 'nextPage'
                const nextPage = new Discord.MessageButton()
                .setLabel(`Next Page`)
                .setCustomId(forwardId)
                .setStyle(`SUCCESS`)
                .setEmoji(`🟩`)
                const prevPage = new Discord.MessageButton()
                .setLabel(`Previous Page`)
                .setCustomId(backId)
                .setStyle(`DANGER`)
                .setEmoji(`🟥`)

                const generateEmbed = async start => {
                    const current = databases.slice(start, start + 25)
                    adminUserEmbed = new Discord.EmbedBuilder()
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.blue)
                    .setDescription(`This server has a maximum of: \`${server.attributes.feature_limits.databases}\` databases`)
                    .setTitle(`Showing databases ${start + 1}-${start + current.length} out of ${databases.length}`)
                    if (args.get('node')) {
                        adminUserEmbed.setAuthor({name:`Databases - ${args.get('node').value}`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    } else {
                        adminUserEmbed.setAuthor({name:`Databases`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    }
                    for (const s of current) {
                        adminUserEmbed.addFields({name:`__${s.attributes.name}__`, value:`\`ID:\` ${s.attributes.id}`, inline:true});
                    }
                    return adminUserEmbed;
                }
                const canFitOnOnePage = databases.length <= 25;
                interaction.editReply({ embeds: [await generateEmbed(0)], components: canFitOnOnePage ? [] : [new Discord.MessageActionRow({components: [nextPage]})] })
                const embedMessage = await interaction.fetchReply();
                if (canFitOnOnePage) return;
                const collector = embedMessage.createMessageComponentCollector({filter: (binteraction) => binteraction.user.id === user.id});
                let currentIndex = 0;
                collector.on('collect', async interactionb => {
                    interactionb.customId === backId ? (currentIndex -= 25) : (currentIndex += 25)
                    await interactionb.update({ embeds: [await generateEmbed(currentIndex)], components: [
                        new Discord.MessageActionRow({
                            components: [
                                ...(currentIndex ? [prevPage] : []),
                                ...(currentIndex + 25 < databases.length ? [nextPage] : [])
                            ]
                        })] })
                });
                return;
            }
            case "create": {
                let name = args.getString("name");
                let connections_from = args.getString("connections_from") ? args.getString("connections_from") : "%";

                let res = await new PterodactylUser(apiKey).listDatabases(serverId);
                let server = await new PterodactylUser(apiKey).getServer(serverId);

                let databases = [];
                res.data.forEach(db => {
                    databases.push(db);
                });

                if (server.attributes.feature_limits.databases === databases.length) {
                    let maxBackupEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Error`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`This server has hit it's max database count.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.red)
                    interaction.editReply({ embeds: [maxBackupEmbed], ephemeral: true });
                    return;
                }

                const newDB = await new PterodactylUser(apiKey).createDatabase(serverId, name, connections_from);
                if (!newDB || newDB === 404||newDB === 403) {
                    let permissionsEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`You don't have the required permission to use this server.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.red)
                    interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                    return;
                }

                let permissionsEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:`${this.name} - Success`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`A new database has been created with the name \`${newDB.attributes.name}\`.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue)
                interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                return;
            }
            case "delete": {
                let name = args.getString("name");

                const requested = await funcs.getDatabaseByName(serverId, apiKey, name);

                if (!requested) {
                    let permissionsEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Invalid Database`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`I couldn't find a database by the name \`${name}\`.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.red)
                    interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                    return;
                }

                const newDB = await new PterodactylUser(apiKey).deleteDatabase(serverId, requested.attributes.id);
                if (newDB === 404||newDB === 403) {
                    let permissionsEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`You don't have the required permission to use this server.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.red)
                    interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                    return;
                }

                let permissionsEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:`${this.name} - Success`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`The database \`${requested.attributes.name}\` has been deleted.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue)
                interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                return;
            }
        }
    }
}