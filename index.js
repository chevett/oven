var _ = require('lodash');
var Absolurl = require('absolurl');
var url = require('url');


var Oven = function(options){
	function _getUrlObject(myUrl){
		if (!myUrl) return;
		return url.parse(absolurl.resolve(myUrl));
	}

	function _doesPathMatch(path, cookiePath){
		if (!path || !cookiePath) return true;
		if (path === cookiePath) return true;

		cookiePath = cookiePath.replace('/', '\\/');
		if (!/\/$/.test(cookiePath)) cookiePath += '/';
		if (!/\/$/.test(path)) path += '/';

		return new RegExp('^' + cookiePath).test(path);
	}

	function _doesDomainMatch(domain, cookieDomain){
		if (!domain || !cookieDomain) return true;
		if (!/^\./.test(cookieDomain)) cookieDomain = '.' + cookieDomain;
		if (!/^\./.test(domain)) domain = '.' + domain;

		cookieDomain = cookieDomain.replace('.', '\\.');

		return new RegExp(cookieDomain + '$').test(domain);
	}

	function _isCookieExpired(currentTime, cookieExpiration){
		if (!cookieExpiration) return false;

		return currentTime >= cookieExpiration;
	}

	function _getCookieName(headerValue){
		var match = headerValue.match(/^\s*([^=]+)/i);
		return match ? match[1] : undefined;
	}

	function _parseCookieField(o, fieldName){
		var regex = new RegExp('\\s*;\\s*' + fieldName, 'i');
		var match = o.value.match(regex);
		
		o[fieldName] = !!match;
		o.value = o.value.replace(regex, '');
	}

	function _parseCookieFieldValue(o, fieldName, defaultFieldValue){
		var regex = new RegExp(fieldName + '\\s*=([^;]+)(;|$)', 'i');
		var match = o.value.match(regex);
		var fieldValue;
		
		if (match && match[1]) {
			fieldValue = (match[1]||'').trim();
			// don't include port in domain
			// re: https://github.com/chevett/oven/pull/3#issuecomment-44389062
			if (fieldName == 'domain') fieldValue = fieldValue.split(':')[0];
		}

		o[fieldName] = fieldValue || defaultFieldValue;
		o.value = o.value.replace(regex, '');
	}

	function _parseSetCookieHeader(header){
		var o = new ParsedCookie();
		o.value = header;

		_parseCookieFieldValue(o, 'expires');
		_parseCookieFieldValue(o, 'path', oDefaultUrl.pathname);
		_parseCookieFieldValue(o, 'domain', oDefaultUrl.hostname);
		_parseCookieFieldValue(o, 'priority');
		_parseCookieField(o, 'secure');
		_parseCookieField(o, 'httpOnly');

		o.expires = o.expires ? Date.parse(o.expires) : undefined;
		o.values = _.chain(o.value.split(/;/g))
			.flatten()
			.map(function(v){return v.trim();})
			.filter(function(v){ return v; })
			.value();

		o.name = _getCookieName(header);
		o.id = o.name + '_' + o.domain;

		return o;
	}

	if (!options || !options.url) throw {};
	
	var cookies = {},
		absolurl = new Absolurl(),
		oDefaultUrl = _getUrlObject(options.url);
	

	this.setCookie = function(rawSetCookieHeaderValue){
		var oCookie = _parseSetCookieHeader(rawSetCookieHeaderValue);
		cookies[oCookie.id] = oCookie;
		
		return oCookie;
	};

	this.getCookies = function(myUrl, dateTime){
		var oUrl = _getUrlObject(absolurl.resolve(myUrl, options.url) || options.url) || {};
		dateTime = dateTime || new Date();

		return _.chain(cookies)
				.filter(function(c){ return !_isCookieExpired(dateTime, c.expires); })
				.filter(function(c){ return _doesDomainMatch(oUrl.hostname, c.domain); })
				.filter(function(c){ return _doesPathMatch(oUrl.pathname, c.path); })
				.filter(function(c){ return !c.secure || /^https/i.test(oUrl.protocol);  })
				.value();
	};

	this.getCookie = this.getCookieHeader = function(myUrl, dateTime){
		return _.chain(this.getCookies(myUrl, dateTime))
				.map(function(c){ return c.values;})
				.flatten()
				.value()
				.join('; ');
	};
};


var ParsedCookie = function(){
};

Oven.prototype.setCookies = function(lst){
	for (var i=0; i<lst.length; i++){
		this.setCookie(lst[i]);
	}
};

ParsedCookie.prototype.toString = function(){
	var str = this.values.join('; ')
		+ '; Domain='+this.domain 
		+ '; Path=' +this.path;

	if (this.expires) str+= '; Expires=' + new Date(this.expires).toUTCString();
	if (this.secure) str += '; secure';
	if (this.httpOnly) str += '; httponly';
	
	return str;
};

module.exports = Oven;
