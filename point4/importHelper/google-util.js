const path = require('path');
const fs = require('fs');
const util = {
	dir: path.join(__dirname,'../crawler/google.com/data'),
	async sync() {

		let files = await fs.readdirSync(this.dir),
			filesCached = {};

		this.files = files;
		this.filesCached = filesCached;

		if (!files.length) {
			throw new Error(`no files in ${ dir }!`)
		}
	},
	async initWith(query) {
		let {
			currentEntryIndex,
			currentFileIndex
		} = query;

		await this.sync();
		
		let currentFilePath = path.join(this.dir, '/' + this.files[currentFileIndex]),
			fileContent = JSON.parse(await fs.readFileSync(currentFilePath)),	
			contentKeys = Object.keys(fileContent),
			contentLength = contentKeys.length - 1;
		console.log('here ')
		this.filesCached[currentFileIndex] = fileContent;
		this.inited = true;
		console.log('here ', {
			currentEntryIndex,
			currentFileIndex
		})
		this.currentIndexs = {
			currentEntryIndex,
			currentFileIndex
		}
	},
	async getCurrentEntry(query) {
		if (!isNaN(query.pageIndex) && !this.inited) {

			await this.initWith({
				currentFileIndex: query.pageIndex * 1,
				currentEntryIndex: query.entryIndex * 1
			});
		}
		let {
			currentEntryIndex,
			currentFileIndex
		} = this.currentIndexs;

		let currentFile = this.filesCached[currentFileIndex];
		let	currentKey = Object.keys(currentFile)[currentEntryIndex];

		return {
			current: currentFile[currentKey],
			parent: currentFile['parent'],
			currentEntryIndex,
			currentFileIndex
		};
	},
	async stepToNext() {
		let {
			currentEntryIndex,
			currentFileIndex
		} = this.currentIndexs;
		let currentFile = this.filesCached[currentFileIndex],
			contentLength = Object.keys(currentFile).length;


		if (currentEntryIndex < contentLength - 1) {
			this.currentIndexs = {
				currentEntryIndex: currentEntryIndex + 1,
				currentFileIndex
			}
		} else {
			if (currentFileIndex < this.files.length - 1) {
				let newCurrentFileIndex= currentFileIndex + 1,
					currentFilePath = path.join(this.dir, '/' + this.files[newCurrentFileIndex]),
					fileContent = JSON.parse(await fs.readFileSync(currentFilePath));
				
				this.filesCached[newCurrentFileIndex] = fileContent;

				this.currentIndexs = {
					currentEntryIndex: 0,
					currentFileIndex: newCurrentFileIndex
				} 
			} else {
				throw new Error('all entries checked');	
			}
		}
	}
}

module.exports = util;
