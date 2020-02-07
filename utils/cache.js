const fs = require('fs');
const _ = require('lodash');
const Cache = require('persistent-cache');
const AppCache = new Cache({
  name: 'skello-cli-cache',
  duration: 30000,
});

function get(key) {
  return AppCache.getSync(key);
}

function set(key, data) {
  return AppCache.putSync(key, data);
}

module.exports = {
  get,
  set,
};