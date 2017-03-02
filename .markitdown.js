'use strict';
var marked = require('marked');
var fs = require('fs');
var readFileSync = fs.readFileSync;
var writeFileSync = fs.writeFileSync;
[
  './index.html'
].forEach(function (transformedFilePath) {
  var src = readFileSync(transformedFilePath, 'utf8');

  var out = '';
  var startTag = 'marked-start';
  var openTag;

  src.split(/<!--\s*(marked-start\s+[^\s]+|marked-end)\s*-->/igm)
  .forEach(function(piece, p) {
    var filepath;

    if (piece.indexOf('marked-start') === 0) {
      openTag = true;
      filepath = piece.slice(startTag.length).trim();
      out = out + '<!-- marked-start ' + filepath + ' -->\n';
      out = out + marked(readFileSync(filepath, 'utf8'));
    }
    else if (piece.indexOf('marked-end') === 0) {
      out = out + '\n<!-- marked-end -->';
      openTag = false;
    }
    else if (!openTag) {
      out = out + piece;
    }
  });

  writeFileSync(transformedFilePath, out);
});