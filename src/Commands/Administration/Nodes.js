const embed = require('../../Configs/embed.json');
let PterodactylAdmin = require('../../Structures/Panel/PterodactylAdmin.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Nodes',
    description: 'Lists all of the nodes!',
    category: 'Administration',
    enabled: true,
    needsAPIKey: true,
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();
        let apiKey = await mysql.getApiKey(user.id);

        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

        let res = await new PterodactylAdmin(apiKey).getNodes();
        if (!res || res[0] === 404||res[0] === 403) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({ name: `${this.name} - Insuffient Permissions`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You don't have the required permission to use this command.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        
        let adminUserEmbed;
        let usersList = [];
        res.forEach(u => {
            usersList.push(u);
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
            const current = usersList.slice(start, start + 25)
            adminUserEmbed = new Discord.EmbedBuilder()
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            .setTitle(`Showing nodes ${start + 1}-${start + current.length} out of ${usersList.length}`)
            adminUserEmbed.setAuthor({name:`Nodes`,iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            for (const s of current) {
                let location = await new PterodactylAdmin(apiKey).getLocation(s.attributes.location_id);
                if (!location||location===403||location===404) {
                    location = s.attributes.location_id;
                }
                adminUserEmbed.addFields({name:`${s.attributes.name}`, value:`\`ID:\` ${s.attributes.id}\n\`Location:\` ${typeof location === "number" ? location : location.attributes.short}`, inline:true});
            }
            return adminUserEmbed;
        }
        const canFitOnOnePage = usersList.length <= 25;
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
                        ...(currentIndex + 25 < usersList.length ? [nextPage] : [])
                    ]
                })] })
        });
    }
}