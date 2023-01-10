const fetch = require('axios');
const mainConfig = require('../../Configs/config.json');
module.exports = class PterodactylAdmin {
    constructor(key) {
        this.key = key;
    }
    async verifyAPIKey() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/users`,
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
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/users': ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async serverList() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/servers?per_page=1000000`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/servers?per_page=1000000': ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
	
    async userList() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/users?per_page=1000000`,
            method: "GET",
            followRedirects: false,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/users?per_page=1000000': ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getUser(id) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/users/${id}`,
            method: "GET",
            followRedirects: false,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/users/${id}: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getLocation(id) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/locations/${id}`,
            method: "GET",
            followRedirects: false,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/locations/${id}: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getServer(id) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/servers/${id}`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/servers/${id}: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async setDatabaseCount(id, count, allocation) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/servers/${id}/build`,
            method: "PATCH",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: {
                'allocation': allocation,
                'feature_limits': {
                    'databases': count,
                }
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            console.error(err);
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/servers/${id}/build: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async nodeList() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/nodes`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/nodes: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async nodeIP(nodeId) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/nodes/${nodeId}/configuration`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return `${res.api.host}`;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return 403;
            else if (err.message === 'Request failed with status code 404') return 404;
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/nodes/${nodeId}/configuration: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getNodes() {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/nodes`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data.data;
            else return [404];
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return [403];
            else if (err.message === 'Request failed with status code 404') return [404];
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/nodes: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
    async getNode(id) {
        let response = await fetch.default({
            url: `${mainConfig.panel.url}/api/application/nodes/${id}`,
            method: "GET",
            followRedirects: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer '+this.key,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then((res) => {
            if (res.status === 200) return res.data;
            else return 404;
        }).catch(err => {
            if (err.message === 'Request failed with status code 403') return [403];
            else if (err.message === 'Request failed with status code 404') return [404];
            else if (err.message === 'Request failed with status code 401') return undefined;
            else {
                console.error(`Error while contacting '${mainConfig.panel.url}/api/application/nodes/${id}: ${err.message}`);
                return undefined;
            }
        });
        return response;
    }
}