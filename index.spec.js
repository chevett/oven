var ShortBread = require('./index');
var expect = require('chai').expect;
var _ = require('underscore').expect;

describe('short-bread', function(){
	it('should require options', function(){
		expect(ShortBread).to.throw;
	});
	it('should require a domain', function(){
		expect(ShortBread.bind(null, {})).to.throw;
	});
	it('should not throw when passed a domain', function(){
		expect(ShortBread.bind(null, {url:'github.com'})).to.not.throw;
	});
	describe('#setCookie', function(){
		it('should not throw', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			expect(shortBread.setCookie).to.not.throw;
		});
		it('should parse the expires field', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var date = Date.parse('Sat, 02 May 2109 23:38:25 GMT');

			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT');

			expect(cookie.expires).to.be.equal(date);
		});
		it('should parse the expires field regardless of case', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var date = Date.parse('Sat, 02 May 2109 23:38:25 GMT');

			var cookie = shortBread.setCookie('shitName=shitValue; exPIRes=Sat, 02 May 2109 23:38:25 GMT');

			expect(cookie.expires).to.be.equal(date);
		});
		it('should parse the secure field', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT; secure');

			expect(cookie.secure).to.be.true;
		});
		it('should default secure field to false', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT; ');

			expect(cookie.secure).to.be.false;
		});
		it('should parse the httponly field', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT; httponly');

			expect(cookie.httpOnly).to.be.true;
		});
		it('should parse the httponly field regardless of case', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT; secure;HTTPONLY');

			expect(cookie.httpOnly).to.be.true;
		});
		it('should default httponly field to false', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT; ');
			expect(cookie.httpOnly).to.be.false;
		});
		it('should default the domain', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT; ');

			expect(cookie.domain).to.be.equal('www.google.com');
		});
		it('should default the path', function(){
			var shortBread = new ShortBread({url: 'www.google.com/uno'});
			var cookie = shortBread.setCookie('shitName=shitValue; expires=Sat, 02 May 2109 23:38:25 GMT; ');

			expect(cookie.path).to.be.equal('/uno');
		});
		it('should parse the path', function(){
			var shortBread = new ShortBread({url: 'www.google.com/uno'});
			var cookie = shortBread.setCookie('shitName=shitValue; Path=/dos;secure; expires=Sat, 02 May 2109 23:38:25 GMT; ');

			expect(cookie.path).to.be.equal('/dos');
		});
		it('should not default the domain when supplied', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			var cookie = shortBread.setCookie('shitName=shitValue; domain=.google.com; expires=Sat, 02 May 2109 23:38:25 GMT; ');

			expect(cookie.domain).to.be.equal('.google.com');
		});

	});

	describe('#getCookies', function(){
		it('should return only cookies that match the domain', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.google.com;expires=Sat, 02 May 2109 23:38:25 GMT; ');
			shortBread.setCookie('shitName=shitValue; domain=.github.com;');
			shortBread.setCookie('shitName=shitValue; domain=plus.google.com;');
			shortBread.setCookie('mmmm=shitValue');
			shortBread.setCookie('what=shitValue');
			shortBread.setCookie('hello=shitValue');
			var cookies = shortBread.getCookies('www.google.com');

			expect(cookies.length).to.be.equal(4);

			cookies.forEach(function(c){
				expect(c.domain).to.match(/\.google\.com$/);
			});
		});
		it('should work on partial domain cookie and subdomain', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.fartbutt.com;');

			expect(shortBread.getCookies('www.fartbutt.com').length).to.be.equal(1);
		});
		it('should work on partial domain cookie and two subdomains', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.fartbutt.com;');

			expect(shortBread.getCookies('super.www.fartbutt.com').length).to.be.equal(1);
		});
		it('should work on partial domain cookie and no subdomain', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.fartbutt.com;');

			expect(shortBread.getCookies('fartbutt.com').length).to.be.equal(1);
		});
		it('should not work on partial domain cookie and different domain', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.fartbutt.com;');

			expect(shortBread.getCookies('wwwfartbutt.com').length).to.be.equal(0);
		});
		it('should return a cookie with a matching path', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; path=/feet');

			expect(shortBread.getCookies('www.google.com/feet').length).to.be.equal(1);
		});
		it('should return a cookie with a matching path and trailing slash', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; path=/feet');

			expect(shortBread.getCookies('www.google.com/feet/').length).to.be.equal(1);
		});
		it('should not return a cookie with a differt path', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; path=/feet');

			expect(shortBread.getCookies('www.google.com/hands').length).to.be.equal(0);
		});
		it('should not return a cookie with a slightly differt path', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; path=/feet');

			expect(shortBread.getCookies('www.google.com/feets').length).to.be.equal(0);
		});
		it('should return a cookie with a matching subpath', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; path=/feet');

			expect(shortBread.getCookies('www.google.com/feet/toes/pinky.html').length).to.be.equal(1);
		});
		it('should not return an expired cookie', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.google.com; expires=Sat, 02 May 2009 23:38:25 GMT; ');

			expect(shortBread.getCookies('www.google.com').length).to.be.equal(0);
		});
		it('should return an unexpired cookie', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.google.com; expires=Sat, 02 May 2019 23:38:25 GMT; ');

			expect(shortBread.getCookies('www.google.com').length).to.be.equal(1);
		});
		it('should not return a secure cookie for an http url', function(){
			var shortBread = new ShortBread({url: 'www.google.com'});
			shortBread.setCookie('shitName=shitValue; domain=.google.com;secure; expires=Sat, 02 May 2019 23:38:25 GMT; ');

			expect(shortBread.getCookies('https://www.google.com').length).to.be.equal(0);
		});
	});
	
});
