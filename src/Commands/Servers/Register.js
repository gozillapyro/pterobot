const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
let PterodactylAdmin = require('../../Structures/Panel/PterodactylAdmin.js');
const fs = require("fs");
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const config = require('../../Configs/config.json');
const mysql = new SQL();
module.exports = {
    name: 'Register',
    description: 'Allows you to use all of the other panel commands!',
    category: 'Servers',
    enabled: true,
    needsAPIKey: false,
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');
        let registerEmbed = new Discord.EmbedBuilder()
        .setAuthor({name:`Account Registration`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setTitle(`Registration Instructions`)
        .setDescription(`**1:** Navigate to your [account API page](${mainConfig.panel.url}/account/api).
        \n**2:** Name the new token to anything you like (I recommend something similar to "Discord Bot Token").
        \n**3:** Click the "Create" button to create the key.
        \n**4:** Once created, it'll open a pop-up with your key. Copy this key, and send it to me below. You have 5 minutes to do this.`)
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        let channel = await user.createDM();
        if (!channel) {
            let dmDisabledMessage = new Discord.EmbedBuilder()
            .setAuthor({name:`Error - Register`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`I couldn't send a DM to you! Am i blocked?`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [dmDisabledMessage], ephemeral: true });
            return;
        }
        let hasKey = undefined;
        let res = await mysql.getApiKey(user.id);
        if (res === undefined) hasKey = false;
        else {
			await new PterodactylUser(res).verifyAPIKey().then((isValid) => {
				if (isValid === true) {
					hasKey = true;
				} else {
					hasKey = false;
				}
			});
		}
        if (hasKey === true) {
            let alreadyDoneEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Account Registration`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`Your account is already registered with a valid API key.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [alreadyDoneEmbed], ephemeral: true });
            return;
        }
        channel.send({ embeds: [registerEmbed] }).catch(err => {
            let dmDisabledMessage = new Discord.EmbedBuilder()
            .setAuthor({name:`Error - Register`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`I couldn't send a DM to you! Am i blocked?`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            interaction.editReply({ embeds: [dmDisabledMessage], ephemeral: true });
            return;
        });
        let registerNotifyEmbed = new Discord.EmbedBuilder()
        .setAuthor({name:`Account Registration`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setDescription(`✅ Registration process started in DMs!`)
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        interaction.editReply({ embeds: [registerNotifyEmbed], ephemeral: true });
        const filter = m => !m.author.bot;
        channel.awaitMessages({ filter, max: 1, time: 300000, errors: ['time'] })
        .then(async(key) => {
            let checkingRegEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Account Registration`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setTitle(`Registration Status`)
            .setDescription(`Checking your API key...\n\nKey: \`${key.get(key.keys().next().value).content}\``)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            let checkMsg = await channel.send({ embeds: [checkingRegEmbed] });
            let pteroUser = await new PterodactylUser(key.get(key.keys().next().value).content);
            pteroUser.verifyAPIKey().then((isValid) => {
                if (!isValid) {
                    let badKeyEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`Account Registration`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setTitle(`Registration Status`)
                    .setDescription(`❎ Invalid API key!\nPlease try again!`)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.blue)
                    checkMsg.edit({ embeds: [badKeyEmbed] });
                } else {
                    let goodKeyEmbed = new Discord.EmbedBuilder()
                    .setAuthor({name:`Account Registration`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setTitle(`Registration Status`)
                    .setDescription(`✅ Successfully found your API key and connected it to your account!\nYou now have access to extra commands such as: \`/server\` and \`/send\``)
                    .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp()
                    .setColor(embed.colours.blue)
                    checkMsg.edit({ embeds: [goodKeyEmbed] });
                    mysql.logApiKey(user.id, key.get(key.keys().next().value));
                    if (mainConfig.feature_limitations.add_role_on_register) {
                        if (!guild) return;
                        const gMember = guild.members.cache.get(user.id);
                        if (!gMember) return;
                        gMember.roles.add(mainConfig.features.register_role_id);
                    }
                }
            });
            return;
        }).catch(err => {
            console.error(err);
            let noTimeEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`Error - Register`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`You ran out of time!`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.red)
            channel.send({ embeds: [noTimeEmbed] });
            return;
        })
    }  
}