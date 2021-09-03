const redis = require('redis');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

client.on('connect', () => {
  console.log('terhubung ke database Redis!');
});

client.on('error', (err) => {
  console.log('tidak dapat terhubung ke database Redis!');
  throw err;
});

module.exports = client;
