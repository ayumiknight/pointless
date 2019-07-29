module.exports = (sequelize, DataTypes) => {
    var Category = sequelize.define('Category', {
        category_id: {
            type: DataTypes.INTEGER,
            comment: "分类id",
        },
        en: {
            type: DataTypes.STRING,
            comment: "英文标签",
        },
        zh: {
            type: DataTypes.DATE,
            comment: "中文标签"
        }
    });

    Category.associate = function(models) {
        models.Category.belongsToMany(models.R18, {
            as: 'Category',
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



// Employee.bulkCreate(dataArray, 
//     {
//         fields:["id", "name", "address"] ,
//         updateOnDuplicate: ["name"] 
//     } )
