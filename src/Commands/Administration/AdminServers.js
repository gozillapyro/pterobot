const embed = require("../../Configs/embed.json");
let PterodactylAdmin = require("../../Structures/Panel/PterodactylAdmin.js");
const SQL = require("../../Structures/Panel/SQL/SQL.js");
const funcs = require("../../Functions.js");
const config = require('../../Configs/config.json');
module.exports = {
  name: "AdminServers",
  description: "Searches for servers in the given node or email!",
  category: "Administration",
  enabled: true,
  needsAPIKey: true,
  options: [
    {
      name: "node",
      type: "STRING",
      description: "The node to get the servers from!",
    },
    {
      name: "email",
      type: "STRING",
      description: "The email to get the servers from!",
    },
  ],
  async execute(client, Discord, mainConfig, interaction, args) {
    const user = interaction.user || interaction.author;
    const mysql = new SQL();
    let apiKey = await mysql.getApiKey(user.id);

    const guild = client.guilds.cache.get(config.bot.guild_id);
    if (!guild) return interaction.reply('The bot isn\'t in the main discord server.');

    let res = await new PterodactylAdmin(
      apiKey,
      guild.members.cache.get(user.id)
    ).serverList();

    if (res === 404 || res === 403 || res === undefined) {
      let permissionsEmbed = new Discord.EmbedBuilder()
        .setAuthor({
          name: `${this.name} - Insuffient Permissions`,
          iconURL: guild.iconURL()
            ? guild.iconURL({ dynamic: true })
            : "",
        })
        .setDescription(
          `You don't have the required permission to use this command.`
        )
        .setFooter({
          text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp()
        .setColor(embed.colours.red);
      interaction.editReply({ embeds: [permissionsEmbed], ephemeral: true });
      return;
    }
    let adminServerEmbed;
    let serversList = [];
    const node = args.get
      ? args.get("node")
        ? args.get("node").value
        : undefined
      : args[0];
    let email = args.getString("email");
    if (node) {
      let isValid = await funcs.verifyNode(node, apiKey, user);
      if (isValid) {
        res.data.forEach((server) => {
          if (server.attributes.node === isValid) serversList.push(server);
        });
      } else {
        let nodeEmbed = new Discord.EmbedBuilder()
          .setAuthor({
            name: `${this.name} - Invalid Node`,
            iconURL: guild.iconURL()
              ? guild.iconURL({ dynamic: true })
              : "",
          })
          .setDescription(`I couldn't find the node you provided.`)
          .setFooter({
            text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`,
            iconURL: user.displayAvatarURL({ dynamic: true }),
          })
          .setTimestamp()
          .setColor(embed.colours.red);
        interaction.editReply({ embeds: [nodeEmbed], ephemeral: true });
        return;
      }
    }
    if (email) {
          let target = await funcs.getUserByEmail(user, email, apiKey);
          if (target) { 
            res.data.forEach((server) => {
              if (server.attributes.user === target.attributes.id) serversList.push(server);
            });
          } else {
            let nodeEmbed = new Discord.EmbedBuilder()
              .setAuthor({
                name: `${this.name} - Invalid User`,
                iconURL: guild.iconURL()
                  ? guild.iconURL({ dynamic: true })
                  : "",
              })
              .setDescription(`I couldn't find the user you provided.`)
              .setFooter({
                text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`,
                iconURL: user.displayAvatarURL({ dynamic: true }),
              })
              .setTimestamp()
              .setColor(embed.colours.red);
            interaction.editReply({ embeds: [nodeEmbed], ephemeral: true });
            return;
          }
    }

    if (!node && !email) {
      res.data.forEach((server) => {
        serversList.push(server);
      });
    }
    const backId = "previousPage";
    const forwardId = "nextPage";
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


    const generateEmbed = async (start) => {
      const current = serversList.slice(start, start + 25);
      adminServerEmbed = new Discord.EmbedBuilder()
        .setFooter({
          text: `${embed.symbols.copyright} ${mainConfig.panel.company_name} - ${this.name} ${embed.symbols.circle} ${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .setTimestamp()
        .setColor(embed.colours.blue)
        .setTitle(
          `Showing servers ${start + 1}-${start + current.length} out of ${
            serversList.length
          }`
        );
      if (node) {
        adminServerEmbed.setAuthor({
          name: `Admin Server - ${node}`,
          iconURL: guild.iconURL()
            ? guild.iconURL({ dynamic: true })
            : "",
        });
      } else {
        adminServerEmbed.setAuthor({
          name: `Admin Server`,
          iconURL: guild.iconURL()
            ? guild.iconURL({ dynamic: true })
            : "",
        });
      }
      for (const s of current) {
        adminServerEmbed.addFields({
          name:`${s.attributes.name}`,
          value:`\`Server ID:\` ${s.attributes.identifier}\n\`Internal ID:\` ${s.attributes.id}`,
          inline:true
        });
      }
      return adminServerEmbed;
    };
    const canFitOnOnePage = serversList.length <= 25;
    interaction.editReply({
      embeds: [await generateEmbed(0)],
      components: canFitOnOnePage
        ? []
        : [new Discord.ActionRowBuilder({ components: [nextPage] })]
    });
    const embedMessage = await interaction.fetchReply();
    if (canFitOnOnePage) return;
    const collector = embedMessage.createMessageComponentCollector({
      filter: (binteraction) => binteraction.user.id === user.id,
    });
    let currentIndex = 0;
    collector.on("collect", async (interactionb) => {
      interactionb.customId === backId
        ? (currentIndex -= 25)
        : (currentIndex += 25);
      await interactionb.update({
        embeds: [await generateEmbed(currentIndex)],
        components: [
          new Discord.ActionRowBuilder({
            components: [
              ...(currentIndex ? [prevPage] : []),
              ...(currentIndex + 25 < serversList.length ? [nextPage] : []),
            ],
          }),
        ],
      });
    });
  },
};
