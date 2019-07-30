module.exports = (sequelize, DataTypes) => {
   
    var R18Actress = sequelize.define('R18Actress', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
          },
        r18Id: {
            type: DataTypes.INTEGER,
            unique: 'r18ActressUnique',
            reference: null
        },
        actressId: {
            type: DataTypes.INTEGER,
            unique: 'r18ActressUnique'
        }
    });
    return R18Actress;
};
