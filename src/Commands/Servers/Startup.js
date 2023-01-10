const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Startup',
    description: 'Shows the startup information for that server!',
    category: 'Servers',
    enabled: true,
    options: [
        {
            name: "set",
            type: "SUB_COMMAND",
            description: "Sets a startup value!",
            options: [{
                name: "server_id",
                type: "STRING",
                description: "The ID of the server to get!",
                required: true
            },
            {
                name: "startup_variable",
                type: "STRING",
                description: "The variable to set!",
                required: true
            },
            {
                name: "value",
                type: "STRING",
                description: "The value of the variable to set!"
            }]
        },
        {
            name: "list",
            type: "SUB_COMMAND",
            description: "The ID of the server to get!",
            options: [{
                name: "server_id",
                type: "STRING",
                description: "The ID of the server to get!",
                required: true
            }]
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
        
        switch (args.getSubcommand()) {
            case "list": {
                const variables = await pteroClient.getStartup(serverId);
                if (variables === 404 || variables === 403) {
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
                .setAuthor({name:"Startup Variables",iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`Here's a list of the startup variables for \`${serverId}\`.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue);
                let count = 0;
                for (const va of variables.data) {
                    if (va.object === "egg_variable") {
                        const v = va.attributes;
                        responseEmbed.addFields({name:`__${v.name}:__`, value:`\`Description:\` ${v.description}\n\`Variable:\` ${v.env_variable}\n\`Editable:\` ${v.is_editable}\n\`Rules:\` ${v.rules}\n\`Value:\` ${v.server_value}`, inline:true})
                        count++;
                        if (count >= 25) break;
                    }
                }
                interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
                return;
            }
            case "set": {
                const name = args.get('startup_variable').value;
                const val = args.get('value') ? args.get('value').value : "";
                const res = await pteroClient.setStartupVariable(serverId, name, val);
                if (!res) {
                    let permissionsEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`${this.name} - Invalid Variable`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`The variable or the value isn't valid.\nTo list all variables use \`/startup list ${serverId}\` and use the \`Variable\` value.\nYou can also check the rules of the input.`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.blue)
                    interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
                    return;
                }

                let responseEmbed = new Discord.EmbedBuilder()
                .setAuthor({name:"Startup Variable",iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription(`Success! Variable updated, here's the new information.`)
                .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp()
                .setColor(embed.colours.blue)
                .addFields({name:`__${res.attributes.name}:__`, value:`\`Description:\` ${res.attributes.description}\n\`Variable:\` ${res.attributes.env_variable}\n\`Editable:\` ${res.attributes.is_editable}\n\`Rules:\` ${res.attributes.rules}\n\`Value:\` ${res.attributes.server_value}`, inline:true})
                interaction.editReply({ embeds: [responseEmbed], ephemeral: true });
                return;
            }
        }
    }
}