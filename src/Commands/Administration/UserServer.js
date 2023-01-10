const embed = require('../../Configs/embed.json');
let PterodactylAdmin = require('../../Structures/Panel/PterodactylAdmin.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const funcs = require('../../Functions.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'UserServer',
    description: 'Gives a link to the specified server!',
    category: 'Administration',
    enabled: true,
    options: [
        {
            name: "server_id",
            type: "STRING",
            description: "The id of the server to link!",
            required: true
        },
    ],
    needsAPIKey: true,
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();
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
            .setAuthor({ name: `${this.name} - Invalid Usage`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`**<string>:** Required argument\n**[string]:** Optional argument\n\nThe correct usage for this command is: \`${mainConfig.bot.prefix === "" ? "/" : mainConfig.bot.prefix}${this.name} ${usage.join(' ')}\``)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [usageEmbed], ephemeral: true });
            return;
        }
        let res = await funcs.getAdminServerById(serverId, apiKey, user);
        if (!res) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({ name: `${this.name} - Insuffient Permissions`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`Server not found! It either dosen't exist or you don't have permission to view it.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        let adminServerEmbed = new Discord.EmbedBuilder()
        .setAuthor({ name: `User Server`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setFooter({text:`${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`,iconURL: user.displayAvatarURL({ dynamic: true })})
        .setTimestamp()
        .setColor(embed.colours.blue)
        .setDescription(`Here is a link for the server [\`${serverId}\`](${mainConfig.panel.url}/server/${serverId})!\n[\`View Server\`](${mainConfig.panel.url}/server/${serverId})\n[\`Admin View\`](${mainConfig.panel.url}/admin/servers/view/${res.attributes.id})`)
        interaction.editReply({ embeds: [adminServerEmbed], ephemeral: true });
    }
}