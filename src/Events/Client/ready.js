module.exports = async (client, Discord, mainConfig) => {
    client.user.setActivity(`for /help`, { type: 'WATCHING' });
    let commands = [];
    client.commands.forEach(async(commandInfo) => {
        if (commandInfo.type) {
            commands.push({
                name: commandInfo.name,
                type: commandInfo.type,
            });
        }
        if (commandInfo.type && !commandInfo.isCommand);
        else if (commandInfo.options) {
            const options = commandInfo.options;
            let i = 0;
            for (const o of options) {
                if (o.type) {
                    if (o.type === "STRING") {
                        options[i].type = 3;
                    }
                    if (o.type === "SUB_COMMAND") {
                        options[i].type = 1;
                    }
                    if (o.type === "INTEGER") {
                        options[i].type = 4;
                    }
                    if (o.type === "USER") {
                        options[i].type = 6;
                    }
                }
                if (o.options) {
                    let i1 = 0;
                    for (const op of o.options) {
                        if (op.type) {
                            if (op.type === "STRING") {
                                options[i].options[i1].type = 3;
                            }
                            if (op.type === "SUB_COMMAND") {
                                options[i].options[i1].type = 1;
                            }
                            if (op.type === "INTEGER") {
                                options[i].options[i1].type = 4;
                            }
                            if (o.type === "USER") {
                                options[i].type = 6;
                            }
                        }
                        i1++;
                    }
                }
                i++;
            }
            commands.push({
                name: commandInfo.name.toLowerCase(),
                description: commandInfo.description,
                options: options,
            });
            if (commandInfo.aliases) {
                for (const alias of commandInfo.aliases){
                    commands.push({
                        name: alias.toLowerCase(),
                        description: commandInfo.description,
                        options: options,
                    });
                }
            }
        } else {
            commands.push({
                name: commandInfo.name.toLowerCase(),
                description: commandInfo.description,
                options: [],
            });
            if (commandInfo.aliases) {
                for (const alias of commandInfo.aliases){
                    commands.push({
                        name: alias.toLowerCase(),
                        description: commandInfo.description,
                        options: [],
                    });
                }
            }
        }
    });
    
    if (!client.guilds.cache.get(mainConfig.bot.guild_id)) {
        console.log(`The guild id is incorrect.`);
        return;
    }

    try {
        await client.application?.commands.set(commands);
    } catch(err) {
        console.log(`No commands were registered, does the bot have the scope \`application.commands\`.`);
        console.error(err);
        return;
    }

    // Daily new command creation limit is 200.


    console.log(`${client.user.tag} is done loading and is now online.`);
}