const CommandChecker = require('../../Structures/CommandChecker.js');
module.exports = async(client, Discord, mainConfig, interaction) => {
    if (interaction.isChatInputCommand()) {
        console.log(`${interaction.user.tag} has used /${interaction.commandName} in ${interaction.guild ? interaction.guild.name : "DMs"}.`)
        const command = client.commands.get(interaction.commandName) || client.commands.find(a => a.aliases && a.aliases.includes(interaction.commandName));
        await interaction.deferReply({ ephemeral: true });
        new CommandChecker(client, Discord, interaction, command, interaction.user, interaction.options).check();
    } else if (interaction.isButton()) {
        if (interaction.customId !== "previousPage" && interaction.customId !== "nextPage") {
            await interaction.deferReply({ ephemeral: true });
            if (interaction.customId.includes("restart_")) {
                require('../../Events/Interaction/RestartButton.js')(interaction, Discord);
            } else if (interaction.customId.includes("start_")) {
                require('../../Events/Interaction/StartButton.js')(interaction, Discord);
            } else if (interaction.customId.includes("stop_")) {
                require('../../Events/Interaction/StopButton.js')(interaction, Discord);
            } else if (interaction.customId.includes("kill_")) {
                require('../../Events/Interaction/KillButton.js')(interaction, Discord);
            }
        }
    } else if (interaction.isContextMenuCommand()) {
        await interaction.deferReply({ ephemeral: true });
        console.log(`${interaction.user.tag} has used context menu ${interaction.commandName} in ${interaction.guild ? interaction.guild.name : "DMs"}.`)
        const command = client.commands.get(interaction.commandName.toLowerCase()) || client.commands.find(a => a.aliases && a.aliases.includes(interaction.commandName.toLowerCase()));
        new CommandChecker(client, Discord, interaction, command, interaction.user, undefined).check();
    }
}