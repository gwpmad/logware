# logware
Simple, flexible and unobtrusive console-logging middleware for Express. Will look great in your `devDependencies`.

## Why?
Because you want to see the journey your `req` and `res` objects are taking once your route is hit, or you just want to log *something* to prove things are going where you expect.

## Why... this?
Because you want your logs to be
* colourful, clearly demarcated and easy to read, with no `[Function: foo]` silliness
* easy to add, with no need to type something hideous and then find the app has crashed because of a missing bracket or comma
* numbered, so you can easily tell which is which
* ERROR FREE. This library is unlikely ever to throw an error. Nobody wants that from console logging.

It's also free from dependencies.

## How?
```js
import lw from 'logware'

app.post('/route',
  middleware1,
  lw({ req: 'body.data.thing' }) // tell logware what to log
  middleware2,
  lw({ req: 'user', res: ['app.data', 'locals.thing']}) // you can use an array to log multiple things
  middleware3,
  lw('Hello!!!') // or just pass a message
  middleware4,
  lw({ message: 'Hello', req: 'body', res: ['app.data', 'locals.thing']}) // or do it all!
  middleware5
)
```

## Logs look like this
```
╔══
║ 1. hello



  req.prop
  ───────
  'foo bar'



  res.locals.data.thing
  ──────────────────
  'bar foo'

// some log from your real middleware

╔══
║ 2. another log



  req.number
  ─────────
  8.988784079044443
```

## Also
You can tell logware to log a certain message or certain properties every time using the `options` object, which works exactly the same way as the object you would pass to `lw()`:

```js
lw.options = {
  message: 'This will be logged every time',
  req: 'params.thingToLogEveryTime',
  res: 'headersSent'
}

// these things will be logged each time lw() is called, along with anything passed in

```

## Yes...
This middleware does add a tiny `_logwareCounter` property to the response's `locals` object. It's hard to see how this could affect your app at all though (especially as you shouldn't be using this library anywhere but locally) unless you really want it to, in which case more power to you.