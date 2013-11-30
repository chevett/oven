oven [![Build Status](https://travis-ci.org/chevett/oven.png)](https://travis-ci.org/chevett/oven) [![NPM](https://nodei.co/npm-dl/oven.png?months=1)](https://nodei.co/npm/oven/)
=========


Put incoming set-cookie header values in the oven and get outgoing cookie header values.

```js
var defaultDomain = 'www.miketown3.com';
var Oven = require('oven');
var oven = new Oven({url: defaultDomain});

var parsedCookie = oven.setCookie('test=mt3');
oven.setCookie('test=goog; Domain=.google.com');
oven.setCookie('test=mt3_4real');
oven.setCookie('search=heyGuy; Path=/my-path');
oven.setCookie('notTemp=555');
oven.setCookie('tmp=555');
oven.setCookie('tmp=someone; Expires=25, Dec 1999');
oven.setCookie('tmp=someone; Domain=.no-no-no.com');

console.log(defaultDomain + ': ' + oven.getCookie());
console.log(defaultDomain + '/my-path: ' + oven.getCookie('/my-path'));
console.log('www.google.com: ' + oven.getCookie('www.google.com'));
console.log('www.google.com: ' + oven.getCookie('www.google.com/my-path'));
console.log('\n-----');
console.dir(parsedCookie);
```
output:
```js
www.miketown3.com: test=mt3_4real; notTemp=555
www.miketown3.com/my-path: test=mt3_4real; search=heyGuy; notTemp=555
www.google.com: test=goog
www.google.com/my-path:

------
{ value: 'test=mt3',
  expires: undefined,
  path: '/',
  domain: 'www.miketown3.com',
  priority: undefined,
  secure: false,
  httpOnly: false,
  values: [ 'test=mt3' ],
  name: 'test',
  id: 'test_www.miketown3.com' }
```
