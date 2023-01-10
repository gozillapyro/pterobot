const embed = require('../../Configs/embed.json');
let PterodactylUser = require('../../Structures/Panel/PterodactylUser.js');
const SQL = require('../../Structures/Panel/SQL/SQL.js');
const funcs = require('../../Functions.js');
const config = require('../../Configs/config.json');
module.exports = {
    name: 'Server',
    description: 'Displays information about the specified server!',
    category: 'Servers',
    enabled: true,
    aliases: ['serverinfo', 'resources'],
    needsAPIKey: true,
    options: [
        {
            name: "server_id",
            type: "STRING",
            description: "The ID of the server check!",
            required: true
        },
    ],
    async execute(client, Discord, mainConfig, interaction, args) {
        const user = interaction.user || interaction.author;
        const mysql = new SQL();
        const guild = client.guilds.cache.get(config.bot.guild_id);
        if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');
        let apiKey = await mysql.getApiKey(user.id, guild.id);
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
        let server = await funcs.getServerByID(serverId, apiKey);
        let resources = await new PterodactylUser(apiKey).getResources(serverId);
        if (!server) {
            let permissionsEmbed = new Discord.EmbedBuilder()
            .setAuthor({name:`${this.name} - Invalid Server`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
            .setDescription(`Couldn't find a server with the id \`${serverId}\`. Either it dosen't exist or you don't have permisson to view it.`)
            .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setTimestamp()
            .setColor(embed.colours.blue)
            interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
            return;
        }
        server = server.attributes;
        let state = "";
        if (resources.current_state === "running") state = "Online";
        else if (resources.current_state === "starting") state = "Starting";
        else if (resources.current_state === "offline") state = "Offline";
        else if (resources.current_state === "stopping") state = "Stopping";
        else state = "Error"
        let gb = `${server.limits.memory / 1000}`;
        gb = gb.split('.')[0];
        let usedmb = `${resources.resources.memory_bytes / 1000000}`
        usedmb = usedmb.split('.')[0];
        let commandServerEmbed = new Discord.EmbedBuilder()
        .setAuthor({name:`Server Info`, iconURL:guild.iconURL() ? guild.iconURL({ dynamic: true }) : ""})
        .setTitle(`${server.identifier}`)
        .addFields({name:`Server State:`, value:`\`${state}\``, inline:true})
        .addFields({name:`Server Name:`, value:`\`${server.name}\``, inline:true})
        .addFields({name:`Server Owner:`,value: `\`${server.server_owner}\``, inline:true})
        .addFields({name:`Server Node:`, value:`\`${server.node}\``, inline:true})
        .addFields({name:`Server Suspended:`, value:`\`${server.is_suspended}\``, inline:true})
        .addFields({name:`Server IP:`, value:`\`${server.relationships.allocations.data[0].attributes.ip}\``, inline:true})
        .addFields({name:`Server Port:`, value:`\`${server.relationships.allocations.data[0].attributes.port}\``, inline:true})
        .addFields({name:`Allowed Databases:`, value:`\`${server.feature_limits.databases}\``, inline:true})
        .addFields({name:`Allowed Backups:`, value:`\`${server.feature_limits.backups}\``, inline:true})
        .addFields({name:`Allocated Memory:`, value:`\`${gb}GB\``, inline:true})
        .addFields({name:`Used Memory:`, value:`\`${usedmb}MB\``, inline:true})
        .setFooter({ text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
        .setTimestamp()
        .setColor(embed.colours.blue)
        interaction.editReply({ embeds: [commandServerEmbed], components: [
            //new Discord.MessageActionRow().addComponents([
            //    new Discord.MessageButton()
            //    .setLabel(`Start`)
            //    .setEmoji(`🟢`)
            //    .setStyle(`SUCCESS`)
            //    .setCustomId(`start_${server.identifier}`),
            //    new Discord.MessageButton()
            //    .setLabel(`Restart`)
            //    .setEmoji(`🟠`)
            //    .setStyle(`PRIMARY`)
            //    .setCustomId(`restart_${server.identifier}`),
            //    new Discord.MessageButton()
            //    .setLabel(`Stop`)
            //    .setEmoji(`🔴`)
            //    .setStyle(`DANGER`)
            //    .setCustomId(`stop_${server.identifier}`),
            //    new Discord.MessageButton()
            //    .setLabel(`Kill`)
            //    .setEmoji(`⛔`)
            //    .setStyle(`DANGER`)
            //    .setCustomId(`kill_${server.identifier}`)
            //])
        ], ephemeral: true });
    }
}