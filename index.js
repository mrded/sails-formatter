require('rootpath')();

var one = function(object, model, type) {
  var formatterPath = 'api/formatters/%model/%type'
    .replace('%model', model)
    .replace('%type', type);

  return require(formatterPath)(object);
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
