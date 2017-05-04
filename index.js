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

var load = function(fields, output) {
  var outputPromises = fields.map(function(field) {
    var formatter = Array.isArray(field.data) ? many : one;
    
    return formatter(field.data, field.model, field.type).then(function(refObjects) {
      output[field.field] = refObjects;
    });
  });

  return Promise.all(outputPromises).then(function() {
    return output;
  });
};

module.exports.one = one;
module.exports.many = many;
module.exports.load = load;
