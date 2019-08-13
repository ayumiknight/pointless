module.exports = (sequelize, DataTypes) => {
    var Studio = sequelize.define('Studio', {
    	studio_id: {
    	    type: DataTypes.INTEGER,
    	    comment: "制作公司id",
    	    unique: true
    	},
        en: {
            type: DataTypes.STRING,
            comment: "英文名",
        },
        zh: {
            type: DataTypes.STRING,
            comment: "中文名"
        },
        logo: {
            type: DataTypes.STRING,
            comment: 'logo'
        }
    });

    Studio.associate = function(models) {
        models.Studio.hasMany(models.R18, {
            constraints: false
        });
    };
    return Studio;
};

