const embed = require('../../Configs/embed.json');
const config = require('../../Configs/config.json');
const fs = require('fs');
const { EmbedBuilder } = require('discord.js');
module.exports = {
    name: 'Help',
    description: 'Displays the help message!',
    category: 'General',
    enabled: true,
    options: [
        {
            name: "command",
            type: "STRING",
            description: "The command to give info on!"
        },
    ],
    needsAPIKey: false,
    async execute(client, Discord, mainConfig, interaction, args) {
        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');
        const prefix = "/";
        const user = interaction.user || interaction.author;
        let selectedCmd = args.get ? args.get('command') ? args.get('command').value : undefined : args[0];
        if (!selectedCmd) {
            const categories = fs.readdirSync(`./src/Commands/`).filter(f => !f.split('.')[1]);
            let helpEmbed = new EmbedBuilder()
            .setAuthor({ name: "Command Help - All", iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : "" })
            .setTimestamp()
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`Here is a full list of my commands!\nTo get extra information on a certain command do \`${prefix}help [command]\`.`)
            .setColor(embed.colours.blue)
            for (const category of categories) {
                let list = [];
                client.commands.forEach(cmd => {
                    if (cmd.category === category) {
                        if (!cmd.type) {
                            list.push(` \`${prefix}${cmd.name.toLowerCase()}\``);
                        }
                    }
                });
                helpEmbed.addFields({name:`${category} [${list.length}]:`, value:list.join(`, `)});
            }
            interaction.editReply({ embeds: [helpEmbed], ephemeral: true })
        } else {
            selectedCmd = selectedCmd.toLowerCase();
            const file = client.commands.get(selectedCmd) || client.commands.find(a => a.aliases && a.aliases.includes(selectedCmd));
            if (!file || file.type) {
                let invalidCommandFile = new Discord.EmbedBuilder()
                .setAuthor({name: `Command Help - Error`, iconURL: guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setTimestamp()
                .setFooter(`${embed.symbols.copyright} $${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .setDescription(`The command \`${selectedCmd}\` isn't valid!\nPlease try again!`)
                .setColor(embed.colours.red);
                return interaction.editReply({ embeds: [invalidCommandFile], ephemeral: true });
            }
            let helpEmbedSpecified = new Discord.EmbedBuilder()
            .setAuthor({name:`Command Help - ${file.name}`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setTimestamp()
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription(`**<text>:** Required argument\n**[text]:** Optional argument`)
            .setColor(embed.colours.blue)
            if (file.name) {
                helpEmbedSpecified.addFields({name:`Command:`, value:`${prefix}`+file.name.toLowerCase()})
            }
            if (file.description) {
                helpEmbedSpecified.addFields({name:`Description:`, value:`${file.description}`})
            }
            if (file.category) {
                helpEmbedSpecified.addFields({name:`Category:`, value:`${file.category}`})
            }
            if (file.aliases) {
                helpEmbedSpecified.addFields({name:`Aliases:`, value:`${prefix}`+file.aliases.join(', ')});
            }
            if (file.enabled) {
                helpEmbedSpecified.addFields({name:`Enabled:`, value:`${file.enabled}`});
            }
            if (file.needsAPIKey) {
                helpEmbedSpecified.addFields({name:`API Key Required:`, value:`${file.needsAPIKey}`});
            }
            interaction.editReply({ embeds: [helpEmbedSpecified], ephemeral: true });
        }
    }
}