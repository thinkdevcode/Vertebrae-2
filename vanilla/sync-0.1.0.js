/// <reference path="http://damianedwards.com/files/jquery/jquery-1.5-vsdoc.js" />

// Vertebrae 2 Framework
// Version: 0.1.3, Last updated: 3/23/2011
//
// Project Home - http://www.vertebraejs.com
// Blog         - http://thinkdevcode.wordpress.com
// GitHub       - https://github.com/thinkdevcode/Vertebrae-2
// Contact      - ea@pexelu.com [Eugene Alfonso]
// 
// See License.txt for full license
// 
// Copyright (c) 2011 Eugene Alfonso,
// Licensed under the MIT license.

// Sync Module
// Version: 0.1.0, Last updated: 3/23/2011

(function (window) {

    if (!_v) return;

    _v.require(['https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js', 
				'http://cdn.vertebraejs.com/misc/json2.min.js'], function () {

        /*
        *   sync() - calling directly will create a data handler
        *
        *       options [object] OR [array(objects)] [not optional]
        *           { 
        *                       url : the url to the service, example inputs: 'Default.aspx/Method', 'Method' [not optional]
        *                      name : an alternative name to use for the method [optional]
        *               defaultName : The default page name in case JS can't find it in navbar (such as index.html, default.aspx, etc)
        *           }
        *
        */
        _v.sync = _v.sync || (function () {
            
            var sync = function (options) {

                if (options instanceof Object) {

                    if (options instanceof Array) jQuery.each(options, function (i, x) { sync(x); });

                    else if (typeof options.url === 'string') {

                        var name = options.name || options.url;
                        if (!sync[name]) {
                            sync[name] = function (obj, succ, err, pre, sync) {

                                var currpage = getPage(),
                                    fnarray = [],
                                    paramtest = (typeof obj === 'function'),
                                    synctype = sync || pre;

                                if (paramtest) {
                                    fnarray[0] = obj || function () { };
                                    fnarray[1] = succ || function () { };
                                    fnarray[2] = err || function () { };
                                }
                                else {
                                    fnarray[0] = succ || function () { };
                                    fnarray[1] = err || function () { };
                                    fnarray[2] = pre || function () { };
                                }

                                jQuery.ajax({
                                    type: 'POST',
                                    async: synctype || true,
                                    url: (/.*\..*/i.test(options.url)) ? options.url :              // see if its a full url
                                            (currpage !== '') ?
                                                (currpage + '/' + options.url) :                    // try to use pagename/url
                                                    (typeof options.defaultName === 'string') ?
                                                        (options.defaultName + '/' + options.url) : // try to use defaultname/url
                                                            options.url,                            // if worst comes to worse just try the url, haha
                                    data: (paramtest) ? '{}' : JSON.stringify(obj),
                                    contentType: 'application/json; charset=utf-8',
                                    dataType: 'json',
                                    beforeSend: fnarray[2],
                                    error: fnarray[1],
                                    success: function (e) {
                                        if (typeof e.d === 'string' && /[{:}]/.test(e.d))
                                            fnarray[0].call(this, JSON.parse(e.d));
                                        else
                                            fnarray[0].call(this, e.d);
                                    }
                                });
                            };
                        }
                    }
                } 
            }

            function getPage() {
                return (window.location.pathname).substring((window.location.pathname).lastIndexOf('/') + 1);
            }

            return (sync);

        })();

        return (window._v = _v);

    });

})(window);