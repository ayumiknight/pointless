module.exports = (sequelize, DataTypes) => {
    var Extra = sequelize.define('Extra', {
        extra: {
            type: DataTypes.STRING(10000),
            comment: "pixhost与rapidgator",
        },
        syncFrom: {
            type: DataTypes.INTEGER,
            comment: "1为rapidgator movie",
        },
        partialOK: {
            type: DataTypes.TINYINT(1),
            comment: "部分文件已失效",
        },
        source: {
            type: DataTypes.STRING(2500),
            comment: "备选链接"
        }
    });

    Extra.associate = function(models) {
        models.Extra.belongsTo(models.R18);
    };
    return Extra;
};

