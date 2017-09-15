'use strict';

const pathToRegexp = require('path-to-regexp');

module.exports = function(options) {
  options = options || {};
  if (options.match && options.ignore) throw new Error('options.match and options.ignore can not both present');
  if (!options.match && !options.ignore) return () => true;

  const matchFn = options.match ? toPathMatch(options.match) : toPathMatch(options.ignore);

  return function pathMatch(ctx) {
    const matched = matchFn(ctx);
    return options.match ? matched : !matched;
  };
};

function toPathMatch(pattern) {
  if (typeof pattern === 'string') {
    const reg = pathToRegexp(pattern, [], { end: false });
    return ctx => !!ctx.path.match(reg);
  }
  if (pattern instanceof RegExp) return ctx => !!ctx.path.match(pattern);
  if (typeof pattern === 'function') return pattern;
  if (Array.isArray(pattern)) {
    const matchs = pattern.map(item => toPathMatch(item));
    return ctx => matchs.some(match => match(ctx));
  }
  throw new Error('match/ignore pattern must be RegExp, Array or String, but got ' + pattern);
}
