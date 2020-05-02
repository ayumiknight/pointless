const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const RConfig = require('./rapidgatorConfig.js');

axiosRretry(axios, { retries: 3 });

class Rapidgator {
	constructor() {
		this.token = '';
		this.b = 'https://rapidgator.net/api/v2';
	}

	async login() {
		let res = await axios({
			url: this.b + `/user/login?login=${encodeURIComponent(RConfig.email)}&password=${encodeURIComponent(RConfig.password)}`,
			method: 'GET'
		});
		let token = res.data && res.data.response && res.data.response.token;
		
		token && (this.token = token);
		if (!this.token) {
			throw new Error('login response having issues' + JSON.stringify(res.data || {}));
		}
	}

	async createFolder(name) {
		let folder;
		let res = await axios({
			url: this.b + `/folder/create?name=${encodeURIComponent(name)}&token=${this.token}`,
			method: 'GET'
		});
		if (res.data && res.data.response && res.data.response.folder) {
			return res.data.response.folder.folder_id;
		} else {
			throw new Error('create folder having issues')
		}
	}


	async xCopyLinks({
		folderId,
		fileLinks
	}) {
		let res = await Promise.all(fileLinks.map(link => {
			return axios({
				url: this.b + `/file/xcopy?url=${encodeURIComponent(link)}&folder_id_dest=${folderId}&token=${this.token}`,
				method: 'GET'
			});
		}))
		let myLinks = res.map(r => {
			return r.data && r.data.response && r.data.response.file && r.data.response.file.url || ''
		}).filter( r => !!r);
		if (!myLinks.length) {
			await this.deleteFolder({ folderId });
			throw new Error('xcopy process having issues');
		}
		return myLinks;
	}

	async deleteFolder({
		folderId
	}) {
		let res = await axios({
			url: this.b + `/folder/delete?folder_id=${folderId}&token=${this.token}`,
			method: 'GET'
		});
		if (res.data && res.data.response && res.data.response.result) {
			return true;
		} else {
			throw new Error('delete empty folder having issues', folderId)
		}
	}

	async getAll({
		page = 1,
		pagesize = 200,
		folderId = RConfig.root
	}) {
		let res = await axios({
			url: this.b + `/folder/content?folder_id=${folderId}&token=${this.token}&page=${page}&per_page=${pagesize}`,
			method: 'GET'
		});
		if (res.data && res.data.response && res.data.response.folder) {
			return res.data.response.folder;
		} else {
			throw new Error('get root folder having issues')
		}
	}

	getFileInfo(fid) {
		return axios({
			url: this.b + `/file/info?file_id=${fid}&token=${this.token}`,
			method: 'GET'
		});
	}

	async saveLinksToFolder({
		fileLinks,
		name
	}) {
		let folderId = await this.createFolder(name);
		let myLinks= await this.xCopyLinks({
			fileLinks,
			folderId
		});
		return myLinks;
	}
	async generateOneTimeLink(myLink) {
		//http://rapidgator.net/file/7d9252a17c5603109f597ebe3654dc41/KMVR-816-A.part2.rar.html
		let fid = myLink.replace(/^(.+)\/file\/(.+)\/(.+)$/, "$2");
		let res = await axios({
			url: this.b + `/file/onetimelink_create?token=${this.token}&file_id=${fid}`,
			method: 'GET'
		});
		let data = res.data;
		return data.response.link.url;
	}

}

module.exports = Rapidgator;