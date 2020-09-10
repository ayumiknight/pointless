const db = require('../index.js');
const { User, Subscription, UserLikeR18 } = db;
const Sequelize = require('sequelize');
const { CITEXT } = require('sequelize');
const { useMediaQuery } = require('@material-ui/core');

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

async function oneUser({
  user_id
}) {
  return User.findOne({
    where: {
      id: user_id
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
  const nickName = await User.findOne({
    where: {
      nick_name
    }
  })
  if (nickName) throw new Error(2)
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

async function updateUserEndpoint(sub, user, regOrUnReg) {
  if (regOrUnReg) {
    const subscription = await Subscription.findOrCreate({
      where: {
        endpoint: sub.endpoint
      },
      defaults: {
        endpoint: sub.endpoint,
        keys: sub.keys.p256dh + '|' + sub.keys.auth
      }
    })
    if (user && user.user_id) {
      const _user = await User.findOne({
        where: {
          id: user.user_id
        }
      })
      await _user.addSubscription(subscription)
    }
  } else {
    await Subscription.destroy({
      where: {
        endpoint: sub.endpoint
      }
    })
  }
}

async function checkSubscription(endpoint) {
  return Subscription.findOne({
    where: {
      endpoint
    }
  })
} 

async function getSubscriptionWithUser({
  pagesize = 20,
  page = 1
}) {
  return Subscription.findAndCountAll({
    offset: (page - 1) * pagesize,
    limit: pagesize,
    include: [{
      model: User
    }]
  })
}

async function trackNotification(endpoint) {
  const sub = await Subscription.findOne({
    where: {
      endpoint
    }
  });
  if (!sub || !sub.endpoint ) return;
  await sub.update({
    clickTimes: (sub.clickTimes || 0) + 1,
    lastClicked: new Date()
  })
}

module.exports = {
  login,
  register,
  userLikeTag,
  updateUserEndpoint,
  getSubscriptionWithUser,
  checkSubscription,
  oneUser,
  trackNotification
}
