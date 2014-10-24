(function (module, verbose) {
    'use strict';

    var querystring = require('querystring');

    var debug = !verbose ? function () {
    } : function (message) {
        console.log(message);
      };

    var MockList = (function () {
        /*jshint validthis: true */
        function findMock(url) {
            for(var i = 0; i < this._mocks.length; i++) {
              debug(this._mocks[i]);
              if(this._mocks[i].url.test(url)) {
                return this._mocks[i].mock;
              }
            }
          }
        function addMock(url, mock) {
            this._mocks.push({
                url: url,
                mock: mock
              });
          }
        var MockList = function() {
            this._mocks = [];

          };
        MockList.prototype = {
            findMock: findMock,
            addMock: addMock
          };
        return MockList;
      })();

    var mocks = {
        'GET': new MockList(),
        'POST': new MockList(),
        'DELETE': new MockList(),
        'PUT': new MockList()
      };

    function paginate(data, request) {
        var query = querystring.parse(request._parsedUrl.query);
        var page = parseInt(query.p) || 0;
        var count = parseInt(query.c) || 10;
        var total = data.length;
        debug('slice:' + page * count + ' ' + (page + 1) * count);
        return {
            data: data.slice(page * count, (page + 1) * count),
            contentRange: page + '-' + count + '/' + total
          };
      }

    function extend(dst, src) {
        for(var property in src) {
          if(src.hasOwnProperty(property)) {
            dst[property] = dst[property] || src[property];
          }
        }
      }

    function mock(json) {
        return function (request, response) {
            var data = json;
            var headers = { 'Content-Type': 'application/json' };
            if(data instanceof Array) {
              var page = paginate(data, request);
              data = page.data;
              extend(headers, { 'Content-Range': page.contentRange });
            }
            response.writeHead(200, headers);
            response.end(JSON.stringify(data));
          };
      }

    function when(method, url) {
        return {
            respond: function (json) {
                debug(url + ' => ' + JSON.stringify(json));
                mocks[method].addMock(url, mock(json));
              }
          };
      }

    module.exports = function (request, response, next) {
        debug(request.method + ' ' + request.url);
        ((mocks[request.method] && mocks[request.method].findMock(request.url)) || function () {
            next();
          })(request, response);
      };


    //when('GET', /^\/API\/bpm\/case\?p=0&c=25&$/).respond(require('./cases-list-28-mocks.json'));
    when('GET', /^\/API\/bpm\/case.*$/).respond(require('./cases-list-320-results-mocks.json'));
    //http://localhost:9002/API/system/i18ntranslation?f=locale%3Den
    when('GET', /^\/API\/system\/i18ntranslation.*$/).respond([]);

    /*when('POST', '/bonita/API/livingApps').respond(
        {
        "icon": "path/to/icon",
        "name": "Holiday",
        "version": "1.0",
        "url": "lapps/holiday",
        "createdOn": "11/07/14",
        "createdBy": "Julien Mege",
        "updatedOn": "16/07/14",
        "updatedBy": "Vincent Elcrin",
        "status": "Activated"
    });*/

  })(module, false);
