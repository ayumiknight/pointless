module.exports = (sequelize, DataTypes) => {
	var R18 = sequelize.define('R18', {
		code: {
			type: DataTypes.STRING,
			comment: "番号",
			unique: true
		},
		codeBackUp: {
			type: DataTypes.STRING,
			comment: "番号备份，用于unique鉴别",
			unique: true
		},
		title: {
			type: DataTypes.STRING(1000),
			comment: "标题",
		},
		zhTitle: {
			type: DataTypes.STRING(1000),
			comment: "中文标题",
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
		},
		order: {
			type: DataTypes.INTEGER,
			comment: "爬虫的默认顺序，新的在前面"
		},
		coden: {
			type: DataTypes.INTEGER,
			comment: 'code编号大小'
		},
		torrent: {
			type: DataTypes.INTEGER,
			comment: '是否有种子'
		},
		javlibrary: {
			type: DataTypes.BOOLEAN,
			comment: 'javlibrary是否同步过'
		},
		vr: {
			type: DataTypes.BOOLEAN,
			comment: '是否是vr电影'
		},
		lastPost: {
			type: DataTypes.DATE,
			comment: '最后一次尝试post'
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
		models.R18.Extras = models.R18.hasOne(models.Extra, {
			as: 'Extras',
			foreignKey: 'R18Id'
		});
		models.R18.Users = models.R18.belongsToMany(models.User, {
			as: 'likeUsers',
			through: {
				model: models.UserLikeR18
			},
			foreignKey: 'r18_id',
			constraints: false
		});
	};
	return R18;
};
