const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Backup',
    description: 'Control a server\'s backups!',
    category: 'Servers',
    enabled: true,
    options: [
        {
            name: "create",
            type: "SUB_COMMAND",
            description: "Creates a server backup!",
            options: [
                {
                    name: "id",
                    type: "STRING",
                    description: "The ID of the server to backup!",
                    required: true
                }
            ]
        },
        {
            name: "list",
            type: "SUB_COMMAND",
            description: "Lists all of the server's backups!",
            options: [
                {
                    name: "id",
                    type: "STRING",
                    description: "The ID of the server's backups to list!",
                    required: true
                }
            ]
        },
        {
            name: "restore",
            type: "SUB_COMMAND",
            description: "Restores the server to the selected backup!",
            options: [
                {
                    name: "id",
                    type: "STRING",
                    description: "The ID of server!",
                    required: true
                },
                {
                    name: "backup_id",
                    type: "STRING",
                    description: "The ID of the backup to restore!",
                    required: true
                }
            ]
        },
        {
            name: "download",
            type: "SUB_COMMAND",
            description: "Sends a download link to the specified backup!",
            options: [
                {
                    name: "id",
                    type: "STRING",
                    description: "The ID of server!",
                    required: true
                },
                {
                    name: "backup_id",
                    type: "STRING",
                    description: "The ID of the backup to download!",
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
        let id = interaction.options.getString("id");
        let sub = interaction.options.getSubcommand();
        if (!id) {
            let usage = [];
            this.options.forEach(o => {
                if (o.name === sub) {
                    o.options.forEach(o1 => {
                        if (o1.required) {
                            usage.push(`<${o1.name.toLowerCase()}>`);
                        } else {
                            usage.push(`[${o1.name.toLowerCase()}]`);
                        }
                    });
                }
                
            });
            let usageEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Invalid Usage`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`**<string>:** Required argument\n**[string]:** Optional argument\n\nThe correct usage for this command is: \`${mainConfig.bot.prefix === "" ? "/" : mainConfig.bot.prefix}${this.name} ${sub} ${usage.join(' ')}\``)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [usageEmbed], ephemeral: true });
            return;
        }
        if (sub === "create") {
            let res = await new PterodactylUser(apiKey).createServerBackup(id);
            if (!res || res === 404||res === 403) {
                let permissionsEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`You don't have the required permission to use this server or it doesn't exist.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.red)
                interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                return;
            }
            if (!res) {
                let maxBackupEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:`${this.name} - Error`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`This server has hit it's max backup count.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.red)
                interaction.editReply({ embeds: [maxBackupEmbed], ephemeral: true });
                return;
            }
            let backupServerEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Backup Server`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`Successfully created backup \`${res.attributes.name}\` on \`${id}\`.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [backupServerEmbed], ephemeral: true });
        } else if (sub === "list") {
            let res = await new PterodactylUser(apiKey).getBackups(id);
            let server = await new PterodactylUser(apiKey).getServer(id);
            if (!res || res === 404||res === 403) {
                let permissionsEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`You don't have the required permission to use this server or it doesn't exist.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.red)
                interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                return;
            }
            let backups = [];
            res.data.forEach(db => {
                backups.push(db);
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
                const current = backups.slice(start, start + 25)
                adminUserEmbed = new Discord.EmbedBuilder()
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue)
                .setDescription(`This server has a maximum of: \`${server.attributes.feature_limits.backups}\` Backups`)
                .setTitle(`Showing backups ${start + 1}-${start + current.length} out of ${backups.length}`)
                if (args.get('node')) {
                    adminUserEmbed.setAuthor({name:`Backups - ${args.get('node').value}`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                } else {
                    adminUserEmbed.setAuthor({name:`Backups`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                }
                for (const s of current) {
                    adminUserEmbed.addField(`${s.attributes.name}:`, `\`ID:\` ${s.attributes.uuid}\n\`Name:\` ${s.attributes.name}`);
                }
                return adminUserEmbed;
            }
            const canFitOnOnePage = backups.length <= 25;
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
                            ...(currentIndex + 25 < backups.length ? [nextPage] : [])
                        ]
                    })] })
            });
        } else if (sub === "restore") {
            const backupid = args.getString('backup_id');
            let res = await new PterodactylUser(apiKey).restoreServerBackup(id, backupid);
            if (res === 404||res === 403) {
                let permissionsEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`You don't have the required permission to use this server, it doesn't exist or the backup id is invalid.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.red)
                interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                return;
            }
            
            let backupServerEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Backup Server`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`Successfully restored backup.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [backupServerEmbed], ephemeral: true });
        } else if (sub === "download") {
            const backupid = args.getString('backup_id');
            let res = await new PterodactylUser(apiKey).downloadServerBackup(id, backupid);
            if (res === 404||res === 403) {
                let permissionsEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`You don't have the required permission to use this server, it doesn't exist or the backup id is invalid.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.red)
                interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                return;
            }
            await interaction.deleteReply();
            let backupServerEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Backup Server`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`Click [here](${res.attributes.url}) to download the backup.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.followUp({ embeds: [backupServerEmbed], ephemeral: true });
        }
    }
}