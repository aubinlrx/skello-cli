function parseSorter(args) {
  const sorter = args.find((arg) => {
    return (
      arg.startsWith('--sort=') ||
      arg.startsWith('--sort-asc=') ||
      arg.startsWith('--sort-desc=')
    )
  });

  if (!sorter) return undefined;

  let [direction, fields] = sorter.split('=');
  
  switch(direction) {
    case '--sort':
    case '--sort-asc':
      direction = 'asc';
      break;
    case '--sort-desc':
      direction = 'desc';
      break;
    default:
      direction = 'asc';
  }

  fields = fields.split(',');

  return {
    direction,
    fields,
  };
}

module.exports = {
  parseSorter,
};