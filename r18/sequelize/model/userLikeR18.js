module.exports = (sequelize, DataTypes) => {
  var UserLikeR18 = sequelize.define('UserLikeR18', {
      user_id: {
          type: DataTypes.INTEGER
      },
      r18_id: {
          type: DataTypes.INTEGER,
      }
  });
  return UserLikeR18;
};

