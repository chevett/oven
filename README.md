oven [![Build Status](https://travis-ci.org/chevett/oven.png)](https://travis-ci.org/chevett/oven)
=========


Put incoming set-cookie header values in the oven and get outgoing cookie header values.

```js
var Oven = require('oven');
var oven = new Oven({
  url: 'www.miketown3.com'
});

oven.setCookie('nameee=valueee; Domain=.miketown.com; Path=/;');
oven.setCookie('nameee=value2;');

var cookieHeaderValue = oven.getCookie();
console.log(cookieHeaderValue)
```
output:
```
nameee=value2
```
