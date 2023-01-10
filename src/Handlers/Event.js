const fs = require('fs');
module.exports = async (client, Discord, mainConfig) => {
    let registeredEvents = 0;
    let failedEvents = 0;
    ['Client', 'Guild'].forEach(async t => {
        const eventFolders = fs.readdirSync(`./src/Events/${t}/`).filter(f => f.endsWith('.js'));
        for (const f of eventFolders) {
            client.on(f.split('.')[0], require(`../Events/${t}/${f}`).bind(null, client, Discord, mainConfig));
            registeredEvents++;
        }
    });
    console.log(`Successfully registered ${registeredEvents} events and failed to register ${failedEvents}.`)
}