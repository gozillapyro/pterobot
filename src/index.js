const mainConfig = require('./Configs/config.json');

if (!mainConfig.panel.url.endsWith('/')) {
	if (mainConfig.panel.url.startsWith('https://') || mainConfig.panel.url.startsWith('http://')) {
		const Discord = require('discord.js');
		const client = new Discord.Client({ intents: 4611 });
		client.commands = new Discord.Collection();
		const SQL = require('./Structures/Panel/SQL/SQL.js');
		const mysql = new SQL();
		mysql.initDb();
		client.events = new Discord.Collection();

		['Command', 'Event'].forEach(h => {
			require(`./Handlers/${h}.js`)(client, Discord, mainConfig);
		});
		client.login(mainConfig.bot.token);
	} else {
		let count = 0;
		while (count < 100) {
			console.log(`The panel url defined in the config.json file must start with 'https://' or 'http://'.`);
			count++;
		}
	}
} else {
    let count = 0;
    while (count < 100) {
        console.log(`The panel url defined in the config.json file cannot end in a slash.`);
        count++;
    }
}