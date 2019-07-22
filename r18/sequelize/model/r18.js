module.exports = (sequelize, DataTypes) => {
		var r18 = sequelize.define('r18', {
				cover: {
						type: DataTypes.STRING,
						comment: "封面图",
				},
				fullCover: {
						type: DataTypes.STRING,
						comment: "封面图大",
				},
				released: {
						type: Sequelize.DATE,
						comment: "发行时间"
				}
				duration: {
						type: Sequelize.INTEGER,
						comment: "影片时常"
				},
				director: {
						type: DataTypes.STRING,
						comment: "导演"
				}
		});

		return r18;
};
