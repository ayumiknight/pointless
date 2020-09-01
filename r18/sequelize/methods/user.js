const db = require('../index.js');
const { User, R18, UserLikeR18 } = db;
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

async function login({
  key,
  secret
}) {
	return User.findOne({
    where: {
      key,
      secret
    }
  })
}

async function register({
  key,
  secret,
  avatar,
  nick_name
}) {
  const alreadyExist = await User.findOne({
    where: {
      key
    }
  })
  if (alreadyExist) throw new Error(1)
  const user = await User.create({
    key,
    secret,
    avatar,
    nick_name
  })
  return user
}

async function userLikeTag({
  user_id,
  r18_ids = []
}) {

	return UserLikeR18.findAll({
    where: {
      user_id,
      r18_id: {
        [Op.in]: r18_ids
      }
    }
  })
}

module.exports = {
  login,
  register,
	userLikeTag
}
