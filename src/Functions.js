const PterodactylUser = require('./Structures/Panel/PterodactylUser.js');
const PterodactylAdmin = require('./Structures/Panel/PterodactylAdmin.js');

exports.getServerByID = async function(serverID, apiKey) {
    let rserver = undefined;
    const servers = await new PterodactylUser(apiKey).getServers();
    for (const server of servers) {
        if (server.attributes.identifier === serverID) {
            rserver = server;
        }
    }
    return rserver;
}
exports.getUserByEmail = async function(u, email, apiKey) {
    let ruser = undefined;
    const users = await new PterodactylAdmin(apiKey, u).userList();
    for (const user of users.data) {
        if (user.attributes.email === email) {
            ruser = user;
        }
    }
    return ruser;
}
exports.verifyNode = async function(node, apiKey, user) {
    let rnode = false;
    const nodes = await new PterodactylAdmin(apiKey, user).getNodes();
	if (!nodes) return undefined;
    for (const nodef of nodes) {
        if (nodef.attributes.name === node) {
            rnode = nodef.attributes.id;
        }
    }
    return rnode;
}
exports.getAdminServerById = async function(serverID, apiKey, user) {
    let rserver = undefined;
    const servers = await new PterodactylAdmin(apiKey, user).serverList();
    if (!servers || servers === 404 || servers === 403) {
        return rserver;
    }
    for (const server of servers.data) {
        if (server.attributes.identifier === serverID) {
            rserver = server;
            break;
        }
    }
    return rserver;
}
exports.getAllocationByPort = async function(serverID, apiKey, port) {
    let rallo = undefined;
    const allocations = await new PterodactylUser(apiKey).getNetworkAllocations(serverID);
    if (!allocations || allocations === 404 || allocations === 403) {
        return rallo;
    }
    for (const allo of allocations.data) {
        if (`${allo.attributes.port}` === `${port}`) {
            rallo = allo;
        }
    }
    return rallo;
}
exports.getDatabaseByName = async function(serverID, apiKey, name) {
    let rdb = undefined;
    const db = await new PterodactylUser(apiKey).listDatabases(serverID);
    if (!db || db === 404 || db === 403) {
        return rdb;
    }
    for (const d of db.data) {
        if (`${d.attributes.name}` === `${name}`) {
            rdb = d;
        }
    }
    return rdb;
}
exports.msToTime = async function(ms) {
    let seconds = (ms / 1000).toFixed(1);
    let minutes = (ms / (1000 * 60)).toFixed(1);
    let hours = (ms / (1000 * 60 * 60)).toFixed(1);
    let days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
    if (seconds < 60) return seconds + "s";
    else if (minutes < 60) return minutes + "m";
    else if (hours < 24) return hours + "h";
    else return days + "d"
}
exports.getInternalIdFromPublic = async function(serverID, apiKey, user) {
    let rserver = undefined;
    const servers = await new PterodactylAdmin(apiKey, user).serverList();
    if (!servers || servers === 404 || servers === 403) {
        return rserver;
    }
    for (const server of servers.data) {
        if (server.attributes.identifier === serverID) {
            rserver = server.attributes.id;
        }
    }
    return rserver;
}