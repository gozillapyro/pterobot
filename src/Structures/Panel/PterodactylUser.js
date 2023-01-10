const fetch = require('axios');
const mainConfig = require('../../Configs/config.json');
module.exports = class PterodactylUser {
    constructor(key) {
        this.key = key;
    }

    async verifyAPIKey() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return true;
            else return false;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return false;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }

    async getAccount() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/account`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/account: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }

    async getServers() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data.data ? res.data.data : [];
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return [];
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getServer(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data ? res.data : [];
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return [];
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async sendCommand(cmd, serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/command`,
            method: "POST",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: {
                'command': cmd,
            },
        }).then((res) => {
            return `Command \`${cmd}\` has successfully been sent to \`${serverId}\`.`;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 'Invalid API key.';
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 502') return 'Cannot send message to server: \`Server is not online!\`';
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/command: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getResources(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/resources`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data.attributes;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/resources: ${err.message}`);

                return undefined;
            }
        });
        return response;
    }
    async setPowerState(serverId, state) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/power`,
            method: "POST",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: {
                'signal': state,
            }
        }).then((res) => {
            return res.status;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/power: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getNetworkAllocations(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/network/allocations`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/network/allocations: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async deleteNetworkAllocation(serverId, id) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/network/allocations/${id}`,
            method: "DELETE",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return "success";
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 400') return 400;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/network/allocations/${id}: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async createNetworkAllocation(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/network/allocations`,
            method: "POST",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/network/allocations: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getUsers(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/users`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/users: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getBackups(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/backups`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/backups: ${err.message}`);

                return undefined;
            }
        });
        return response;
    }
    async renameServer(serverId, newName) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/settings/rename`,
            method: "POST",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: {
                'name': newName,
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/settings/renmae: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async listDatabases(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/databases`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/databases: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async deleteDatabase(serverId, dbId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/databases/${dbId}`,
            method: "DELETE",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/databases/${dbId}: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async createDatabase(serverId, name, connfrom) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/databases`,
            method: "POST",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: {
                database: name,
                remote: connfrom,
            }
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/databases: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async createServerBackup(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/backups`,
            method: "POST",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/backups: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async restoreServerBackup(serverId, backupId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/backups/${backupId}/restore`,
            method: "POST",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: {
                'truncate': true,
            }
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/backups/${backupId}/restore: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async downloadServerBackup(serverId, backupId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/backups/${backupId}/download`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/backups/${backupId}/download: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getWebsocket(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/websocket`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/websocket: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getStartup(serverId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/startup`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/startup: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async setStartupVariable(serverId, name, val) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/client/servers/${serverId}/startup/variable`,
            method: "PUT",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: {
                "key": name,
                "value": val
            }
        }).then((res) => {
            return res.data;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/client/servers/${serverId}/startup/variable: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
}