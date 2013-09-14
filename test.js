var fs = require('fs');
var archiver = require('archiver');

var output = fs.createWriteStream(__dirname + '/output.zip');
var archive = archiver('zip');

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

var file1 = __dirname + '/package.json';
var file2 = __dirname + '/app.js';

archive
  .append(fs.createReadStream(file1), { name: 'package.json' })
  .append(fs.createReadStream(file2), { name: 'app.js' });

archive.finalize(function(err, written) {
  if (err) {
    throw err;
  }

  console.log(written + ' total bytes written');
});