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
