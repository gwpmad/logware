# logware
Simple, flexible and unobtrusive logging middleware for Express. Will look great in your `devDependencies`.

## Why?
Because you want to see the journey your `req` and `res` objects are taking once your route is hit, or you just want to log *something* to prove things are going where you expect.

## Why... this?
Because you want the logs to be
* colourful, clearly demarcated and easy to read, with no `[Function: x]` silliness
* easy to add, with no need to type something hideous in the vein of `function(req,res,next){console.log(12345,req.thing);next()},` and then find the app has crashed because of a missing bracket or comma
* numbered, so you can easily tell which is which
* ERROR FREE. This library is unlikely ever to throw an error. Nobody wants that from their `console.log`

## How?
```
import lw from 'logware'

app.post('/route',
  middleware1,
  lw({ req: 'body.data.thing' }) // tell logware what to log
  middleware2,
  lw({ req: 'user', res: ['body.data', 'locals.thing']}) // you can use an array to log multiple things
  middleware3,
  lw('Hello!!!') // or just pass a message
  middleware4,
  lw({ message: 'Hello', req: 'body', res: ['body.data', 'locals.thing']}) // or do it all!
  middleware5
)
```

## Sample log
```
╔══
║ 1. hello



  req.prop
  ───────
  'utu9nk'



  res.body.data.thing
  ──────────────────
  'gqcym'

// foo bar log from your middleware

╔══
║ 2. another log



  req.number
  ─────────
  8.988784079044443
```