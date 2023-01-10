const mainConfig = require('../../Configs/config.json');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const embed = require('../../Configs/embed.json');
module.exports = async(interaction, Discord) => {
    let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
    let PterodactylAdmin = require('../../Structures/Panel/PterodactylAdmin.js');
    const user = interaction.user || interaction.author;
    const guild = client.guilds.cache.get(mainConfig.bot.guild_id);
    if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');
    const mysql = new SQL();
    let hasKey = undefined;
    let res = await mysql.getApiKey(user.id);
    if (res === undefined) hasKey = false;
    await new PterodactylUser(res).verifyAPIKey().then(async(isValid) => {
        if (!isValid === true) {
            await new PterodactylAdmin(res).verifyAPIKey().then((isAdminValid) => {
                if (!isAdminValid === true) {
                    hasKey = false;
                    mysql.deleteApiKey(user.id);
                }
            });
        } 
    });
    if (hasKey === false) {
        let alreadyDoneEmbed = new Discord.MessageEmbed()
        .setAuthor({name:`Not Registered - Start`,iconURL:interaction.guild.iconURL() ? interaction.guild.iconURL({ dynamic: true }) : ""})
        .setDescription(`Your account is not registered with a valid API key.\nTo register please run \`/register\`.`)
		.setFooter({text:`${embed.symbols.copyright} ${mainConfig.panel.company_name} - Start ${embed.symbols.circle} ${user.tag}`,iconURL:user.displayAvatarURL({ dynamic: true })})
        .setTimestamp()
        .setColor(embed.colours.red)
        interaction.editReply({ embeds: [alreadyDoneEmbed], ephemeral: true });
        return;
    }

    let apiKey = res;

    let pteroClient = new PterodactylUser(apiKey);

    let serverId = interaction.customId.replace('start_', '');
    if (!serverId) return;

    const res1 = await pteroClient.setPowerState(serverId, "start");

    if (res1 === 404||res1 === 403) {
        let permissionsEmbed = new Discord.MessageEmbed()
        .setAuthor({name:`Start - Insuffient Permissions`, iconURL:interaction.guild.iconURL() ? interaction.guild.iconURL({ dynamic: true }) : ""})
        .setDescription(`You don't have the required permission to start this server.`)
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - Start ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.red)
        interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
        return;
    }

    let startServerEmbed = new Discord.MessageEmbed()
    .setAuthor({name:`Start Server`, iconURL:interaction.guild.iconURL() ? interaction.guild.iconURL({ dynamic: true }) : ""})
    .setDescription(`Attempted to start \`${serverId}\`.`)
    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - Start ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
    .setTimestamp()
    .setColor(embed.colours.blue)
    interaction.editReply({ embeds: [startServerEmbed], ephemeral: true });
}