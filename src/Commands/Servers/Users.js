const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');

let permissionsDisplay = {
    "control.console": "Send Console Commands",
    "control.start": "Start Server",
    "control.stop": "Stop Server",
    "control.restart": "Restart Server",
    "user.create": "Create Sub-Users",
    "user.update": "Modify Sub-Users",
    "user.delete": "Delete Sub-Users",
    "user.read": "View Sub-Users",
    "file.create": "Create Files",
    "file.read": "Read Files",
    "file.update": "Edit Files",
    "file.delete": "Delete Files",
    "file.archive": "Archive Files",
    "file.sftp": "Use SFTP",
    "backup.create": "Create Backup",
    "backup.read": "Read Backups",
    "backup.delete": "Delete Backups",
    "backup.update": "Edit Backups",
    "backup.download": "Download Backups",
    "allocation.update": "Change Allocations",
    "startup.update": "Change Startup Command",
    "startup.read": "View Startup Command",
    "database.create": "Create Databases",
    "database.read": "View Databases",
    "database.update": "Edit Databases",
    "database.delete": "Delete Databases",
    "database.view_password": "View Database Password",
    "schedule.create": "Create Schedules",
    "schedule.read": "View Schedules",
    "schedule.update": "Edit Schedules",
    "schedule.delete": "Delete Schedules",
    "settings.rename": "Rename Schedules",
    "settings.reinstall": "Reintall Server",
    "websocket.connect": "View Console",
}

module.exports = {
    name: 'Users',
    description: 'Users',
    category: 'Servers',
    enabled: true,
    options: [
        {
            name: "server_id",
            type: "STRING",
            description: "The ID of the server to get users from!",
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
        let res = await pteroClient.getUsers(serverId);
        if (res === 404||res === 403) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You don't have the required permission to use this server.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        let usersServerEmbed = new Discord.EmbedBuilder()
        .setAuthor({name:`Server Users`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setDescription(res.data.length > 0 ? `Here is a list of all the sub-users on \`${serverId}\`.` : `There are no sub-users on \`${serverId}\`.`)
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        for (const user of res.data) {
            let u = user.attributes;
            let permissions = [];
            u.permissions.forEach(p => {
                permissions.push(`\`${permissionsDisplay[p]}\``);
            });
            usersServerEmbed.addFields({name:`${u.username}`, value:`\`2FA Enabled:\` ${u['2fa_enabled']}\n\`Permissions:\` ${permissions.join(', ')}`});
        }
        interaction.editReply({ embeds: [usersServerEmbed], ephemeral: true });
    }
}