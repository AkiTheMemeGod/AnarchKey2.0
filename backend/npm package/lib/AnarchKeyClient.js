'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios');

const BASE_URL = 'https://anarchkey2-0.onrender.com';
const INIT_ENDPOINT = 'anarchkey_init';
const INIT_FILENAME = '.anarchkey';

class AnarchKeyClient {
  constructor({ apiKey = '', username = '', password = '', baseUrl = BASE_URL } = {}) {
    this.api_key = apiKey;
    this.base_url = baseUrl;
    this.username = username;
    this.password = password;

    const p = path.join(os.homedir(), INIT_FILENAME);
    this.token = '';
    try {
      if (fs.existsSync(p)) {
        this.token = fs.readFileSync(p, { encoding: 'utf8' }).trim();
      }
    } catch (e) {
      this.token = '';
    }

    this.init_file = p;
    this.init_token = this._readInitToken();
  }

  _readInitToken() {
    try {
      if (fs.existsSync(this.init_file)) {
        const t = fs.readFileSync(this.init_file, { encoding: 'utf8' }).trim();
        return t === '' ? null : t;
      }
    } catch (e) { }
    return null;
  }

  async getApiKey(projectName) {
    if (this.token !== '') {
      const payload = {
        project_name: projectName,
        username: this.username,
        api_key: this.api_key + this.token
      };

      const headers = {
        'Content-Type': 'application/json'
      };
      if (this.init_token) {
        headers['X-AnarchKey-Init'] = this.init_token;
      }

      try {
        const resp = await axios.post(this.base_url + 'get_api_key', payload, { headers });
        const data = resp.data;
        if (data && typeof data === 'object' && 'api_key' in data) {
          return data.api_key;
        }
        return data;
      } catch (err) {
        if (err.response && err.response.data) {
          return err.response.data;
        }
        throw err;
      }
    } else {
      return new Error(' ERROR! : start your anarchkey service using the command:  anarchkey init --username YourName --password YourPassword');
    }
  }

  static async doInit({ baseUrl = BASE_URL, outFile = null, username = null, password = null, timeout = 10000 } = {}) {
    const initFilePath = outFile ? outFile : path.join(os.homedir(), INIT_FILENAME);

    try {
      if (fs.existsSync(initFilePath)) {
        const existing = fs.readFileSync(initFilePath, { encoding: 'utf8' }).trim();
        if (existing !== '') {
          console.log(`Init token already exists at ${initFilePath}`);
          return String(existing);
        }
      }
    } catch (e) {
      // continue with init if any fs error occurs
    }

    const url = baseUrl + INIT_ENDPOINT;
    const payload = {};
    if (username) payload.username = username;
    if (password) payload.password = password;

    let resp;
    try {
      resp = await axios.post(url, payload, { timeout });
    } catch (err) {
      throw new Error(`Failed to contact ${url}: ${err.message}`);
    }

    let token = null;
    const data = resp.data;
    if (data && typeof data === 'object') {
      for (const key of ['token', 'secret', 'key', 'data']) {
        if (key in data) {
          token = data[key];
          break;
        }
      }
    }
    if (!token && (typeof data === 'string' && data.trim() !== '')) {
      token = data.trim();
    }

    if (!token) {
      throw new Error('Init endpoint did not return a token');
    }

    try {
      fs.writeFileSync(initFilePath, String(token), { encoding: 'utf8', mode: 0o600 });
      try { fs.chmodSync(initFilePath, 0o600); } catch (e) { }
    } catch (e) {
      throw new Error(`Failed to write init token to ${initFilePath}: ${e.message}`);
    }

    return String(token);
  }
}

module.exports = AnarchKeyClient;
