# Sails Formatter
Helps to specify how objects are displayed.

## Motivation
I was thinking about modern MVCs. Nowadays these frameworks are mainly used for providing REST.
That means that they're not MVC anymore, because there are no **V**iews.

Why don't we introduce something like **Formatters** instead of **Views**? It is the same idea, but it will define how to build a JSON.

We use to have [.toJSON()](http://sailsjs.com/documentation/reference/waterline-orm/records/to-json) function, unfortunately it was very limited and deprecated now. Currently we have to define how to return an object in a `Controller`. It's usually very messy.

Not always you can print an object the same way as it's written in the model. You may need to load some additional data before print it, and frontend may also require different format of fields.

Forum is a good example. To print `ForumModel` you need to load and calculate how many related topics are inside, how many of them are new, etc.

That code to build one single forum object, can be quite big and messy, especially if you need to reuse it, or print it slightly different (full, teaser).

I think it make sense to move it out of controller, and organise somehow.

## Installation
`npm install sails-formatter --save`

## Files structure
All formatters must be placed under `api/formatters/{Model}/{type}.js` folder.

## Usage
### .one()
`Formatter.one(object, model, type);`

|   | Argument | Type     | Details                                   |
|---|----------|----------|-------------------------------------------|
| 1 | object   | `Object` | Object to be formatted.                   |
| 2 | model    | `String` | Model name of the object to be formatted. |
| 3 | type     | `String` | Type of the formatter.                    |

#### Returns
**Type:** `Promise`

Promise with formated object.

#### Examples

```javascript
var Formatter = require('sails-formatter');

User.findOne().then(function(user) {
  Formatter.one(user, 'user', 'full').then(console.log);
});
```

---

### .many()
`Formatter.many(objects, model, type);`

|   | Argument | Type     | Details                                    |
|---|----------|----------|--------------------------------------------|
| 1 | objects  | `Array`  | Array of objects which you want to format. |
| 2 | model    | `String` | Model name of the object to be formatted.  |
| 3 | type     | `String` | Type of the formatter.                     |

#### Returns
**Type:** `Promise`

Promise with formated objects.

#### Examples

```javascript
var Formatter = require('sails-formatter');

User.find().then(function(users) {
  Formatter.many(users, 'user', 'teaser').then(console.log);
});
```

---

### .load()
`Formatter.load(fields, output);`

|   | Argument    | Type                        | Details                                                    |
|---|-------------|-----------------------------|------------------------------------------------------------|
| 1 | fields      | `Array`                     | Array of fields to load.                                   |
|   | field.field | `String`                    | Field name in the output there formatter will be returned. |
|   | field.model | `String`                    | Model name of the object to be formatted.                  |
|   | field.data  | `Object` or `Array` or `Id` | Object(s) to be formatted.                                 |
|   | field.type  | `String`                    | Type of the formatter.                                     |
| 2 | output      | `Object`                    | Object there all fields will be loaded.                    |

#### Returns
**Type:** `Promise`

Promise of `output` object with formatted fields.

#### Examples

```javascript
var Formatter = require('sails-formatter');

Topic.findOne().then(function(object) {
  var output = {
    id: object.id,
    name: object.name
  };
  
  var requiredFields = [
    // Load formatters for following fields:
    { field: 'meta', model: 'meta', data: object.meta, type: 'ref' },
    { field: 'user', model: 'user', data: object.user, type: 'ref' },
    { field: 'forum', model: 'forum', data: object.forum, type: 'ref' },

    // object.comments is Array, it's fine.
    { field: 'comments', model: 'commen', data: object.comments, type: 'ref' },
  ];

  FormatterService.load(requiredFields, output).then(console.log);
});
```

## More examples
Let's create two formatters for `User` model.

All formatters must input an object to be formatter and return a [promise](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Promise).

```javascript
// api/formatters/user/teaser.js
module.exports = function(object) {
  return Promise.resolve({
    id: object.id,
    name: object.name
  });
};
```

You can reuse formatters inside a formatter:
```javascript
// api/formatters/user/full.js
var Formatter = require('sails-formatter');

module.exports = function(object) {
  return Formatter.one(object, 'user', 'teaser').then(function(output) {
    output.first_name = object.firstName;
    output.last_name = object.lastName;
    
    return output; 
  });
};
```

Now, we can use them in the `UserController`:

```javascript
// api/controllers/UserController.js
module.exports = {
  findOne: function (req, res) {
    var promise = User.findOne(req.param('id')).then(function(user) {
      return Formatter.one(user, 'user', 'full');
    });
    
    promise.then(res.ok).catch(res.badRequest);
  },
  
  find: function (req, res) {
    var promise = User.find().then(function(users) {
      return Formatter.many(users, 'user', 'full');
    });
    
    promise.then(res.ok).catch(res.badRequest);
  }
};
```

## Ideas

[@sgress454](https://github.com/sgress454) [commented](https://github.com/balderdashy/sails/issues/4049#issuecomment-288526987):
> You could definitely create a hook that would load formatters from api/formatters and publish your hook to NPM.
>
> Another idea of how to go about this sort of thing would be to create custom responses, so instead of using res.ok() you would do `res.outputSomeModel()`. You can [put custom responses in `api/responses`](http://sailsjs.com/documentation/concepts/custom-responses/adding-a-custom-response) and then call them from any controller.
