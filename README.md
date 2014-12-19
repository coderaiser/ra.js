# RaJS

`require` + `ajax` in browser with ES6 generators.

## Example

```js
ra(function*(require, ajax) {
    var JQUERY  = '//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js',
    $           = yield require(JQUERY),
    zen         = yield ajax('https://api.github.com/zen');
   
   console.log(zen);
   $('body').append(zen);
}).on('error', function(error) {
   console.log(error);
}).on('end', function() {
   console.log('end');
});
```

## License

MIT
