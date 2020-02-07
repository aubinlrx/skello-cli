function substring(string, count, suffix = '...') {
  if (string.length >= count) return string;

  return string.substring(count) + '...';
}

module.exports = {
  substring,
};