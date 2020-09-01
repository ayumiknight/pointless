module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
      nick_name: {
          type: DataTypes.STRING,
          comment: "nickName",
      },
      avatar: {
          type: DataTypes.STRING,
          comment: "avatar"
      },
      end_point: {
          type: DataTypes.STRING,
          comment: "end_point for web notification subscription"
      },
      key: {
        type: DataTypes.STRING,
      },
      secret: {
        type: DataTypes.STRING
      }
  });

  User.associate = function(models) {
      models.User.belongsToMany(models.R18, {
          as: 'likeR18s',
          through: {
              model: models.UserLikeR18
          },
          foreignKey: 'user_id',
          constraints: false
      });
  };
  return User;
};

