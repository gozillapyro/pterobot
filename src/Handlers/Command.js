const fs = require('fs');
module.exports = async (client, Discord, mainConfig) => {
    const categoryFolders = fs.readdirSync('./src/Commands/').filter(f => !f.split(".")[1]);
    let registeredCommands = 0;
    let failedCommands = 0;
    categoryFolders.forEach(async(f) => {
        const commandFiles = fs.readdirSync(`./src/Commands/${f}/`).filter(f => f.endsWith('.js'));
        for (const cf of commandFiles) {
            const commandInfo = require(`../Commands/${f}/${cf}`);
            if (!commandInfo.name || !commandInfo.description || !commandInfo.category) return failedCommands++ && console.log(`Failed to register command ${cf.split('.')[0]} because it dosen't have either a name, description or category.`);
            client.commands.set(commandInfo.name.toLowerCase(), commandInfo);
            registeredCommands++;
        }
    });
    console.log(`Successfully registered ${registeredCommands} commands and failed to register ${failedCommands}.`)
}