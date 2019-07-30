module.exports = (sequelize, DataTypes) => {
    var Actress = sequelize.define('Actress', {
        actress_id: {
            type: DataTypes.INTEGER,
            comment: "分类id",
            unique: true
        },
        en: {
            type: DataTypes.STRING,
            comment: "英文标签",
        },
        zh: {
            type: DataTypes.STRING,
            comment: "中文标签"
        }
    });

    Actress.associate = function(models) {
        models.Actress.belongsToMany(models.R18, {
            as: 'R18s',
            through: {
                model: models.R18Actress,
                unique: false,
            },
            foreignKey: 'actressId',
            constraints: false
        });
    };
    return Actress;
};

