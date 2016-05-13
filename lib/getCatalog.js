var fs = require('fs');
var path = require('path');
var rootPath = process.cwd();
var style = '';
style = fs.readFileSync(path.resolve(__dirname, 'body_style.css'), 'utf-8');
if (style) {
    style = '<style>' + style + '</style>';
}

var FilterNames = ['^[./w+]', 'node_modules'];

function GetCatalog(req, res, next) {
    var _path = req.path;
    var _html = style + '<ul><li><a href="../">...</a></li>';
    var re = /.[a-zA-Z0-9_]+$/;
    if (!_path.match(re)) {
        fs.readdir(path.join(rootPath, _path), function (err, files) {
            if (err) {

            } else {
                var _files = FilterFilesArray(files, FilterNames);
                _files.forEach(function (item) {
                    var tmpPath = _path + item;
                    var itemType = 'file';
                    _html += '<li><a data-fileType="' + itemType + '" href="' + tmpPath + '">' + item + '</a></li>'
                });
                _html += '</ul>';
                res.send(_html);
            }
        });
    } else {
        next();
    }
}

function FilterFilesArray(files, filterNames) {
    var _files = [];
    var _filters = filterNames;
    files.forEach(function (item) {
        if (!filterNames.isArray(item)) {
            _files.push(item);
        }
    });
    return _files;
}

Array.prototype.isArray = function (name) {
    var arr = this;
    var _is = false;
    arr.forEach(function (item) {
        var re = new RegExp(item);
        if (name.match(re)) {
            _is = true;
        }
    });
    return _is;
};

module.exports = GetCatalog;