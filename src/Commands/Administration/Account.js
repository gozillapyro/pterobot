const embed = require('../../Configs/embed.json');
const config = require('../../Configs/config.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
module.exports = {
    name: 'Account',
    category: 'Administration',
    description: 'Shows the user\'s panel account.',
    type: 2,
    enabled: true,
    needsAPIKey: true,
    isCommand: true,
    options: [
        {
            name: "target",
            type: "USER",
            description: "The user to get!",
            required: true
        }
    ],
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        let target;
        if (interaction.isChatInputCommand()) {
            target = args.getUser('target');
        } else {
            target = interaction.targetUser;
        }

        const mysql = new SQL();

        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

        let apiKey = await mysql.getApiKey(user.id);
        
        let isAdmin = await new PterodactylUser(apiKey).getAccount();
        if (!isAdmin || !isAdmin.attributes.admin) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Insuffient Permissions`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You don't have the required permission to use this command.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        let targetApiKey = await mysql.getApiKey(target.id);
        if (!targetApiKey) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Not Registered`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`That user isn't registered to the panel.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        let data = await new PterodactylUser(targetApiKey).getAccount();

        if (!data) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Error`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`An unexpected error occurred whilst trying to perform this commnd.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }

        let accountEmbed = new Discord.EmbedBuilder()
        .setAuthor({name:`Account Info`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setDescription(`\`${target.tag}\` is registered as [${data.attributes.username}](${config.panel.url}/admin/users/view/${data.attributes.id}).`)
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .addFields({name:`Username`, value:`\`${data.attributes.username}\``, inline:true})
        .addFields({name:`Email Address`, value:`\`${data.attributes.email}\``, inline:true})
        .addFields({name:`First Name`, value:`\`${data.attributes.first_name}\``, inline:true})
        .addFields({name:`Last Name`, value:`\`${data.attributes.last_name}\``, inline:true})
        .addFields({name:`Language`, value:`\`${data.attributes.language}\``, inline:true})
        .addFields({name:`Admin`, value:`\`${data.attributes.admin}\``, inline:true})
        .setColor(embed.colours.blue)
        interaction.editReply({ embeds: [accountEmbed], ephemeral: true });
    }
}