module.exports = (sequelize, DataTypes) => {
    var Series = sequelize.define('Series', {
    	series_id: {
    	    type: DataTypes.INTEGER,
    	    comment: "系列id",
    	    unique: true
    	},
        en: {
            type: DataTypes.STRING,
            comment: "英文名",
        },
        zh: {
            type: DataTypes.STRING,
            comment: "中文名"
        }
    });

    Series.associate = function(models) {
        models.Series.hasMany(models.R18, {
            constraints: false
        });
    };
    return Series;
};

