module.exports = (sequelize, DataTypes) => {
    var Message = sequelize.define('Message', {
        message: {
            type: DataTypes.STRING(1000),
            comment: "消息"
        },
        type: {
        	type: DataTypes.STRING(10),
        	comment: "消息类型"
        },
        room: {
        	type: DataTypes.STRING(50),
        	comment: 'room'
        },
        fromId: {
        	type: DataTypes.STRING(100),
        	comment: '消息人'
        },
        image: {
        	type: DataTypes.STRING(1000),
        	comment: "图片链接"
        },
        name: {
        	type: DataTypes.STRING(50),
        	comment: '消息人name'
        },
        avatar: {
        	type: DataTypes.STRING(50),
        	comment: '消息人avatar'
        }
    });

    return Message;
};

