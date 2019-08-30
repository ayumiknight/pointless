module.exports = (sequelize, DataTypes) => {
    var RecentClick = sequelize.define('RecentClick', {
    	clickId: {
    	    type: DataTypes.INTEGER,
    	    comment: "链接内容Id",
    	},
        type: {
            type: DataTypes.STRING,
            comment: "链接种类",
        }
    });

    return RecentClick;
};

