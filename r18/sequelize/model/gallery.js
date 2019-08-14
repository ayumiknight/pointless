module.exports = (sequelize, DataTypes) => {
    var Gallery = sequelize.define('Gallery', {
        url: {
            type: DataTypes.STRING,
            comment: "图片链接",
            unique: true
        }
    });

    Gallery.associate = function(models) {
        models.Gallery.belongsTo(models.R18);
    };
    return Gallery;
};

