const mysql = require('mysql2/promise');
const mainConfig = require('../../../Configs/config.json');
module.exports = class SQL {
    constructor() {}

    async getConnection() {
        return mysql.createConnection({
            host: mainConfig.mySQL.host,
            port: mainConfig.mySQL.port,
            user: mainConfig.mySQL.username,
            database: mainConfig.mySQL.database,
            password: mainConfig.mySQL.password
        });
    }

    async initDb() {
        const sql = await this.getConnection();
        let query = `CREATE TABLE IF NOT EXISTS apiKeys(userId VARCHAR(30), apiKey VARCHAR(100))`;
        sql.query(query);
        query = `CREATE TABLE IF NOT EXISTS adminKeys(userId VARCHAR(30), apiKey VARCHAR(100))`;
        sql.query(query);
    }
    async logApiKey(userId, apiKey) {
        const sql = await this.getConnection();
        let query = `INSERT INTO apiKeys(userId, apiKey) VALUES('${userId}', '${apiKey}')`;
        sql.query(query);
		sql.end();
    }
    async getApiKey(userId) {
        const sql = await this.getConnection();
        let query = `SELECT * FROM apiKeys WHERE userId = '${userId}'`;
        let res = await sql.query(query);
        sql.end();
        if (!res[0][0]) return undefined;
        else return res[0][0].apiKey;
    }
    async deleteApiKey(userId) {
        const sql = await this.getConnection();
        let query = `DELETE FROM apiKeys WHERE userId = '${userId}'`;
        await sql.query(query);
		sql.end();
    }

    async logAdminApiKey(userId, apiKey) {
        const sql = await this.getConnection();
        let query = `INSERT INTO adminKeys(userId, apiKey) VALUES('${userId}', '${apiKey}')`;
        sql.query(query);
		sql.end();
    }
    async getAdminApiKey(userId) {
        const sql = await this.getConnection();
        let query = `SELECT * FROM adminKeys WHERE userId = '${userId}'`;
        let res = await sql.query(query);
        sql.end();
        if (!res[0][0]) return undefined;
        else return res[0][0].apiKey;
    }
    async deleteAdminApiKey(userId) {
        const sql = await this.getConnection();
        let query = `DELETE FROM adminKeys WHERE userId = '${userId}'`;
        await sql.query(query);
		sql.end();
    }
}