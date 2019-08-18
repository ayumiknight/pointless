module.exports = (sequelize, DataTypes) => {
    var Category = sequelize.define('Category', {
        category_id: {
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
        },
        parent: {
            type: DataTypes.INTEGER,
            comment: "目标签序号 类别 类型 服装 种类 play 其他 1 - 6"
        },
        topAdult: {
            type: DataTypes.INTEGER,
            comment: "是否置顶"
        },
        topAmateur: {
            type: DataTypes.INTEGER,
            comment: "是否置顶"
        },
        topAnime: {
            type: DataTypes.INTEGER,
            comment: "是否置顶"
        },
        logo: {
            type: DataTypes.STRING,
            comment: 'logo'
        },
        fromAdult: {
            type: DataTypes.INTEGER,
            comment: "来源"
        }
    });

    Category.associate = function(models) {
        models.Category.belongsToMany(models.R18, {
            as: 'R18s',
            through: {
                model: models.R18Category,
                unique: false,
            },
            foreignKey: 'categoryId',
            constraints: false
        });
    };
    return Category;
};
