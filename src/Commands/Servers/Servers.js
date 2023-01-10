const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Servers',
    description: 'Lists all of the servers that you have access to!',
    category: 'Servers',
    enabled: true,
    aliases: ['serverlist', 'listservers'],
    needsAPIKey: true,
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();
        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');
        let apiKey = await mysql.getApiKey(user.id, guild.id);
        let pteroClient = new PterodactylUser(apiKey);
        let servers = await pteroClient.getServers();
        if (servers === 404||servers === 403) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You don't have the required permission to use this server.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        if (servers.length === 0) {
            let noServersMessage = new Discord.EmbedBuilder()
            .setAuthor({name:`Servers List`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You don't have access to any servers!`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [noServersMessage], ephemeral: true });
            return;
        } else {
            
            let serversMessage = new Discord.EmbedBuilder()
            .setAuthor({name:`Servers List`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setTitle(`Total Servers: ${servers.length}`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            let i = 1;
            let serversList = [];
            servers.forEach((server) => {
                let accType = "";
                if (server.attributes.server_owner === true) {
                    accType = "Owner";
                } else {
                    accType = "Sub-User";
                }
                serversList.push(server);
                serversMessage.addFields({name:`[${i}] ${server.attributes.name}:`, value:`**Account Type:** ${accType}\n**Server ID:** [${server.attributes.identifier}](${mainConfig.panel.url}/server/${server.attributes.identifier})`, inline:true});
                i++;
            });


            const backId = 'previousPage'
            const forwardId = 'nextPage'
            const nextPage = new Discord.ButtonBuilder()
            .setLabel(`Next Page`)
            .setCustomId(forwardId)
            .setStyle(3)
            .setEmoji(`🟩`)
            const prevPage = new Discord.ButtonBuilder()
            .setLabel(`Previous Page`)
            .setCustomId(backId)
            .setStyle(4)
            .setEmoji(`🟥`)

            const generateEmbed = async start => {
                const current = serversList.slice(start, start + 25)
                adminServerEmbed = new Discord.EmbedBuilder()
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue)
                .setTitle(`Showing servers ${start + 1}-${start + current.length} out of ${serversList.length}`)
                if (args.get ? args.get('node') ? args.get('node').value : undefined : undefined) {
                    adminServerEmbed.setAuthor({name:`Servers - ${args.get('node').value}`,iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                } else {
                    adminServerEmbed.setAuthor({name:`Servers`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                }
                for (const s of current) {
                    let accType = "";
                    if (s.attributes.server_owner === true) {
                        accType = "Owner";
                    } else {
                        accType = "Sub-User";
                    }
                    adminServerEmbed.addFields({name:`${s.attributes.name}:`, value:`\`Account Type:\` ${accType}\n\`Server ID:\` [${s.attributes.identifier}](${mainConfig.panel.url}/server/${s.attributes.identifier})`, inline:true});
                }
                return adminServerEmbed;
            }
            const canFitOnOnePage = serversList.length <= 25;
            interaction.editReply({ embeds: [await generateEmbed(0)], components: canFitOnOnePage ? [] : [new Discord.ActionRowBuilder({components: [nextPage]})] })
            const embedMessage = await interaction.fetchReply();
            if (canFitOnOnePage) return;
            const collector = embedMessage.createMessageComponentCollector({filter: (binteraction) => binteraction.user.id === user.id});
            let currentIndex = 0;
            collector.on('collect', async interactionb => {
                interactionb.customId === backId ? (currentIndex -= 25) : (currentIndex += 25)
                await interactionb.update({ embeds: [await generateEmbed(currentIndex)], components: [
                    new Discord.ActionRowBuilder({
                        components: [
                            ...(currentIndex ? [prevPage] : []),
                            ...(currentIndex + 25 < serversList.length ? [nextPage] : [])
                        ]
                    })] })
            });
            return;
        }
    }
}