module.exports = (sequelize, DataTypes) => {
  var Subscription = sequelize.define('Subscription', {
      endpoint: {
          type: DataTypes.STRING(1000),
          comment: "end_point for web notification subscription",
          unique: true
      },
      keys: {
        type: DataTypes.STRING(500),
        comment: "end_point key"
      },
      failTimes: {
        type: DataTypes.INTEGER
      },
      clickTimes: {
        type: DataTypes.INTEGER
      },
      lastClicked: {
        type: DataTypes.DATE
      }
  });

  Subscription.associate = function(models) {
      models.Subscription.belongsTo(models.User, {
          constraints: false
      });
  };
  return Subscription;
};
