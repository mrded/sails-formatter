require('rootpath')();

var one = function(object, model, type) { // object is (object || numeric)
  if (typeof object === 'number') {
    // If object is not loaded - load it.
    return sails.models[model].findOne(object).then(function(object) {
      return one(object, model, type);
    });
  }

  else { // Expect typeof object === 'object'.
    var formatterPath = 'api/formatters/%model/%type'
      .replace('%model', model).replace('%type', type);

    return require(formatterPath)(object);
  }
};

var many = function(objects, model, type) {
  var output = [];

  if (objects && objects.length > 0) {
    objects.map(function(object) {
      output.push(one(object, model, type));
    });
  }

  return Promise.all(output);
};

module.exports.one = one;
module.exports.many = many;
