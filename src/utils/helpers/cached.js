const redisClient = require('@utils/database/redis');

const cached = {
  getOrSet: (key, cb) => new Promise((resolve, reject) => {
    redisClient.get(key, async (err, data) => {
      if (err) reject(err);
      else if (data) {
        console.log('data redis');
        resolve(JSON.parse(data));
      } else {
        const freshData = await cb();
        resolve(freshData);
        await redisClient.setex(key, process.env.CACHED_EXPIRATION, JSON.stringify(freshData));
        console.log('data mongo');
      }
    });
  }),

  delete: (key) => redisClient.del(key, (err, response) => {
    if (response === 1) {
      console.log('Deleted Successfully!');
    } else {
      console.log('Cannot delete');
    }
  }),
};

module.exports = cached;
