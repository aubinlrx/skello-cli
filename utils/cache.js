const fs = require('fs');
const _ = require('lodash');
const cache = require('node-persist');

async function init() {
  await cache.init({
    dir: 'tmp',
    ttl: true,
    expiredInterval: 1 * 60 * 1000, // 1 minutes
  });
}

async function get(key) {
  await init();
  const data = await cache.getItem(key);
  return data;
}

async function set(key, data, ttl) {
  await init();
  const res = await cache.setItem(key, data, { ttl });
  return res;
}

module.exports = {
  get,
  set,
};