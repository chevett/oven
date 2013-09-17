var _ = require('underscore');
var absolurl = require('absolurl');
var url = require('url');
var moment = require('moment');

function _getUrlObject(myUrl){
	if (!myUrl) return;
	return url.parse(absolurl.ensureComplete(myUrl));
}

function _doesPathMatch(path, cookiePath){
	if (!path || !cookiePath) return true;
	
	if (path === '/') return true; // i think this is how it should be...

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
	
	if (match && match[1]) fieldValue = match[1];

	o[fieldName] = fieldValue || defaultFieldValue;
	o.value = o.value.replace(regex, '');
}

var ShortBread = function(options){
	if (!options || !options.url) throw {};
	
	var cookies = {}, 
		oDefaultUrl = _getUrlObject(options.url);
	
	function _parseSetCookieHeader(header){
		var o = new ParsedCookie();
		o.value = header;

		_parseCookieFieldValue(o, 'expires');
		_parseCookieFieldValue(o, 'path', oDefaultUrl.pathname);
		_parseCookieFieldValue(o, 'domain', oDefaultUrl.hostname);
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

	this.setCookie = function(rawSetCookieHeaderValue){
		var oCookie = _parseSetCookieHeader(rawSetCookieHeaderValue);
		cookies[oCookie.id] = oCookie;
		
		return oCookie;
	};

	this.getCookies = function(myUrl, dateTime){
		var oUrl = _getUrlObject(myUrl) || {};
		dateTime = dateTime || new Date();

		return _.chain(cookies)
				.filter(function(c){ return !_isCookieExpired(dateTime, c.expires); })
				.filter(function(c){ return _doesDomainMatch(oUrl.hostname, c.domain); })
				.filter(function(c){ return _doesPathMatch(oUrl.pathname, c.path); })
				.filter(function(c){ return !c.secure || /^https/i.test(oUrl.protocol);  })
				.value();
	};

	this.getCookieHeader = function(myUrl, dateTime){
		return _.chain(this.getCookies(myUrl, dateTime))
				.map(function(c){ return c.values;})
				.flatten()
				.value()
				.join('; ');
	};
};


var ParsedCookie = function(){
};

ParsedCookie.prototype.toString = function(){
	var str = this.values.join('; ')
		+ '; Domain='+this.domain 
		+ '; Path=' +this.path;

	if (this.expires) str+= '; expires=' + moment(this.expires).format('ddd, DD MMM YYYY HH:mm:ss');
	if (this.secure) str += '; secure';
	if (this.httpOnly) str += '; httponly';
	
	return str;
};

module.exports = ShortBread;
