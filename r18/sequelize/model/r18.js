module.exports = (sequelize, DataTypes) => {
    var R18 = sequelize.define('R18', {
        code: {
            type: DataTypes.STRING,
            comment: "番号",
            unique: true
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
        }
    });

    R18.associate = function(models) {
        models.R18._category = models.R18.belongsToMany(models.Category, {
            as: 'R18',
            through: {
                model: models.R18Category,
                unique: false,
            },
            foreignKey: 'r18Id',
            constraints: false
        });
    };
    return R18;
};
