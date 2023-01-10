const mainConfig = require('../Configs/config.json');
module.exports = class CommandChecker {
    constructor(client, Discord, message, command, user, args) {
        this.client = client;
        this.Discord = Discord;
        this.message = message;
        this.command = command;
        this.user = user;
        this.args = args;
    }
    async check() {
        const embed = require('../Configs/embed.json');
        const guild = this.client.guilds.cache.get(mainConfig.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');
        if (!this.command) return;
        const PterodactylUser = require('../Structures/Panel/PterodactylUser.js');
        const SQL = require('../Structures/Panel/SQL/SQL.js');
        const mysql = new SQL();
        const PterodactylAdmin = require('../Structures/Panel/PterodactylAdmin.js');
        if (this.command.needsAPIKey) {
            if (this.command.needsAPIKey === true) {
                let hasKey = undefined;
                let res = await mysql.getApiKey(this.user.id);
                if (res === undefined) hasKey = false;
                await new PterodactylUser(res).verifyAPIKey().then(async(isValid) => {
                    if (!isValid === true) {
                        await new PterodactylAdmin(res).verifyAPIKey().then((isAdminValid) => {
                            if (!isAdminValid === true) {
                                hasKey = false;
                                mysql.deleteApiKey(this.user.id);
                            }
                        });
                    } 
                });
                if (hasKey === false) {
                    let alreadyDoneEmbed = new this.Discord.EmbedBuilder()
                    .setAuthor({name:`Not Registered - ${this.command.name}`,iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                    .setDescription(`Your account is not registered with a valid API key.\nTo register please run \`/register\`.`)
					.setFooter({text:`${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.command.name} ${embed.symbols.circle} ${this.user.tag}`,iconURL:this.user.displayAvatarURL({ dynamic: true })})
                    .setTimestamp()
                    .setColor(embed.colours.red)
                    this.message.followUp({ embeds: [alreadyDoneEmbed], ephemeral: true });
                    return;
                }
            }
        }

        try {
            if (this.command) this.command.execute(this.client, this.Discord, mainConfig, this.message, this.args);
        } catch (err) {
            const guild = client.guilds.cache.get(config.bot.guild_id);
            if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

            const errEmbed = new this.Discord.EmbedBuilder()
                .setAuthor({name:'An error occurred',iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
                .setDescription('A fatal error occurred whilst trying to perform this command.\nIf this continues contact the bot\'s developer!')
                .setTimestamp()
                .setColor(embed.colour.red)
				.setFooter({text:`${this.user.tag} - An error occurred`,iconURL:this.user.displayAvatarURL({ dynamic: true })})
            this.message.followUp({ embeds: [errEmbed] });
            console.error(err);
        }
    }
}