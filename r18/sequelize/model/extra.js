module.exports = (sequelize, DataTypes) => {
    var Extra = sequelize.define('Extra', {
        extra: {
            type: DataTypes.STRING(5000),
            comment: "pixhost与rapidgator",
        }
    });

    Extra.associate = function(models) {
        models.Extra.belongsTo(models.R18);
    };
    return Extra;
};

