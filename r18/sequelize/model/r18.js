module.exports = (sequelize, DataTypes) => {
	var R18 = sequelize.define('R18', {
		code: {
			type: DataTypes.STRING,
			comment: "番号",
			unique: true
		},
		title: {
			type: DataTypes.STRING(1000),
			comment: "标题",
		},
		cover: {
			type: DataTypes.STRING,
			comment: "封面图",
		},
		fullCover: {
			type: DataTypes.STRING,
			comment: "封面图大",
		},
		released: {
			type: DataTypes.DATE,
			comment: "发行时间"
		},
		duration: {
			type: DataTypes.INTEGER,
			comment: "影片时常"
		},
		director: {
			type: DataTypes.STRING,
			comment: "导演"
		},
		referer: {
			type: DataTypes.STRING,
			comment: "原始URL"
		},
		video: {
			type: DataTypes.STRING,
			comment: "预览视频URL"
		},
		channel: {
			type: DataTypes.STRING,
			comment: "CHANNEL"
		},
		thumbup: {
			type: DataTypes.INTEGER,
			comment: "Thumbup"
		}
	});

	R18.associate = function(models) {
		models.R18.Categories = models.R18.belongsToMany(models.Category, {
			as: 'Categories',
			through: {
				model: models.R18Category,
				unique: false,
			},
			foreignKey: 'r18Id',
			constraints: false
		});

		models.R18.Actresses = models.R18.belongsToMany(models.Actress, {
			as: 'Actresses',
			through: {
				model: models.R18Actress,
				unique: false,
			},
			foreignKey: 'r18Id',
			constraints: false
		});
		models.R18.Series = models.R18.belongsTo(models.Series, {
			constraints: false
		});
		models.R18.Studio = models.R18.belongsTo(models.Studio, {
			constraints: false
		});
		models.R18.Galleries = models.R18.hasMany(models.Gallery, {
			as: 'Galleries'
		});
	};
	return R18;
};
