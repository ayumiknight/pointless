module.exports = (sequelize, DataTypes) => {
  var Point = sequelize.define('Point', {
    lat: { 
    	type: DataTypes.FLOAT,
    	unique: 'coord'
    },
    lng: { 
    	type: DataTypes.FLOAT,
    	unique: 'coord'
    },
    heading: DataTypes.INTEGER,
    pitch: DataTypes.INTEGER
  });

  return Point;
};
