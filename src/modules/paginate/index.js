function paginate(array, limit) {
  const results = [''];
  array.forEach((el) => {
    const newItem = results[results.length - 1] === '' ? el : ', ' + el;
    if(results[results.length - 1].length + newItem.length > limit) {
      if(el.length > limit) {
        throw `Item ${el} greater than limit ${limit}`;
      }
      results.push(el);
      return;
    }
    results[results.length  -1] += newItem;
  });
  return results;
}

module.exports = paginate;

