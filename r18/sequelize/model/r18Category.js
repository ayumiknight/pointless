module.exports = (sequelize, DataTypes) => {
   
    var R18Category = sequelize.define('R18Category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
        r18Id: {
            type: DataTypes.INTEGER,
            unique: 'r18CategoryUnique',
            reference: null
        },
        categoryId: {
            type: DataTypes.INTEGER,
            unique: 'r18CategoryUnique'
        }
    });
    return R18Category;
};
