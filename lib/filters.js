var _ = require('underscore');
var SafeString = require('nunjucks/src/runtime').SafeString;

exports.timeago = function(date) {
  var html = '<time class="timeago" datetime="' +
             _.escape(date.toISOString()) + 
             '">' + _.escape(date.toUTCString()) + '</time>';
  return new SafeString(html);
};
