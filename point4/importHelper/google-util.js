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
	async getFirstAvailable() {
		let	currentEntryIndex = 0,
			currentFileIndex = 0;

		while (this.files[currentFileIndex].checked) {
			currentFileIndex++;
		}
		if (currentFileIndex === this.files.length) {
			throw new Error(' all files checked');
		}

		let currentFilePath = path.join(this.dir, '/' + this.files[currentFileIndex]),
			fileContent = JSON.parse(await fs.readFileSync(currentFilePath)),	
			contentKeys = Object.keys(fileContent),
			contentLength = contentKeys.length - 1;

		this.filesCached[currentFileIndex] = fileContent;

		while(fileContent[contentKeys[currentEntryIndex]].checked ) {
			currentEntryIndex++;
		}
		
		this.currentIndexs = {
			currentEntryIndex,
			currentFileIndex
		}
	},
	getCurrentEntry() {
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
			contentLength = Object.keys(currentFile).length - 1;


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
