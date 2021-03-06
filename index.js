require('rootpath')();

var one = function(object, model, type, data) {
  if (object && typeof object !== 'object') {
    // If only ID is provided - load a full object.
    return sails.models[model].findOne(object).then(function(object) {
      return one(object, model, type);
    });
  }

  var formatterPath = 'api/formatters/%model/%type'
    .replace('%model', model)
    .replace('%type', type);

  return require(formatterPath)(object, data || {});
};

var many = function(objects, model, type, data) {
  objects = objects || [];

  var promises = objects.map(function(object) {
    return one(object, model, type, data);
  });

  return Promise.all(promises);
};

module.exports.one = one;
module.exports.many = many;
