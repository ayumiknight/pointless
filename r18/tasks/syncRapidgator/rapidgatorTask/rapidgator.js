const fs = require('fs');
const axios = require('axios');
const axiosRretry = require('axios-retry');
const RConfig = require('./rapidgatorConfig.js');
const formData = require('form-data');
const {
	tezP
} = require('./k2sConfig')
axiosRretry(axios, { retries: 3 });

class Rapidgator {
	constructor() {
		this.token = '';
		this.b = 'https://rapidgator.net/api/v2';
		this.lastLogin = null;
	}

	async login() {
		if (this.token) return;

		let res = await axios({
			url: this.b + `/user/login?login=${encodeURIComponent(RConfig.email)}&password=${encodeURIComponent(RConfig.password)}`,
			method: 'GET'
		});
		let token = res.data && res.data.response && res.data.response.token;
		
		if (token) {
			this.token = token;
			this.lastLogin = new Date() * 1;
		}

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
		fileLinks,
		code
	}) {
		let myLinks = []
		try {
			let res = await Promise.all(fileLinks.map(link => {
				return axios({
					url: this.b + `/file/xcopy?url=${encodeURIComponent(link)}&folder_id_dest=${folderId}&token=${this.token}`,
					method: 'GET'
				});
			}))
			const copied = res.filter(r => {
				if (r.data && r.data.response && r.data.response.file && r.data.response.file.file_id) {
					return true
				} else {
					console.log(r.data && r.data.response, '===========some thing wrong with xcopy====')
					return false
				}
			})
			myLinks = await Promise.all(copied.map((r, index) => {
				return new Promise(async (resolve, reject) => {
					const {
						file_id,
						name,
						url
					} = r.data.response.file;
					const nameFrag = name.split('.');
					const extension = nameFrag.pop();
					nameFrag.push('jvrlibrary');
					nameFrag.push(extension);
					const newName = nameFrag.join('.');
					const res = await axios({
						url: this.b + `/file/rename?name=${newName}&file_id=${file_id}&token=${this.token}`
					})
					if (res.data.status === 200) {
						let urlFrag = url.split('/')
						urlFrag.pop()
						urlFrag.push(newName + '.html');
						resolve(urlFrag.join('/'))
					} else {
						resolve(url)
					}
				})
			}))
		} catch(e) { console.log(e) }

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

	async getFileInfoByLinks(links = []) {
		const result = [];
		let index = 0;
		while(index <　links.length) {
			const frag = links[index].split('/');
			const fid = frag[frag.length - 2];
			const res = await this.getFileInfo(fid);
			if (res && res.data && res.data.status == 200) {
				result.push(res.data.response.file)
			}
			index++;
		}
		if (links.length  && !result.length) {
			throw new Error('error getFileInfo by links')
		}
		return result

	}

	async saveLinksToFolder({
		fileLinks,
		name
	}) {
		let folderId = await this.createFolder(name);
		let myLinks= await this.xCopyLinks({
			fileLinks,
			folderId,
			code: name
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

	async tezToRpSingle({
		newName,
		detail,
		folderId
	}) {
		const upload = await axios.get(this.b + `/file/upload?token=${this.token}&name=${newName}&hash=${detail.md5}&size=${detail.contentLength}&folder_id=${folderId}`)		
		const uploadRes = upload.data.response.upload
		// already exist
		if (uploadRes.file && uploadRes.file.url) {
			return uploadRes.file.url
		} else if (uploadRes.url) {
			await new Promise((resolve, reject) => {
				const form = new formData()
				axios({
					url: detail.tempUrl,
					method: 'get',
					responseType: 'stream'
				}).then( res => {
					form.append('file', res.data);
					form.submit(uploadRes.url, function(err, res) {
						if (err) reject(e);
						resolve(res);
					});
				}).catch(e => {
					reject(e)
				})
			})
			let finalUrl;
			while(!finalUrl) {
				await new Promise(res => {
					setTimeout(res, 1000)
				})
				const check = await axios.get(this.b + `/file/upload?token=${this.token}&name=${newName}&hash=${detail.md5}&size=${detail.contentLength}&folder_id=${folderId}`)
				if (check.data.response.upload.file && check.data.response.upload.file.url) {
					finalUrl = check.data.response.upload.file.url
				}
			}
			return finalUrl
		}
	}
	
	async cleanEmptyFolder() {
		let folderList = []
		const res = await axios({
			url: this.b + `/folder/content?token=${this.token}&folder_id=${RConfig.root}`,
			method: 'GET'
		});
		if (res.data && res.data.response && res.data.response.folder && res.data.response.folder.folders) {
			folderList = folderList.concat(res.data.response.folder.folders)
		}
		const length = folderList.length
		console.log(folderList.length, '=====total folder count=========');
		let index = 0;
		while(index < length) {
			const currentFolder = folderList[index];
			if (currentFolder.nb_files === 0 && currentFolder.nb_folders === 0) {
				await this.deleteFolder(currentFolder.folder_id)
				console.log('deleting', currentFolder)
			}
			index++;
		}
	}
}

module.exports = Rapidgator;