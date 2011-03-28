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

(function (window) {

    var vertebrae = vertebrae || {},

        libraryMap = {  // shortcuts for popular frameworks

            // jQuery
            'jQuery': 'https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js',
            'jQuery-d': 'https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.js',

            // jQuery UI
            'jQueryUI': 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/jquery-ui.min.js',
            'jQueryUI-d': 'https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/jquery-ui.js',
            
            // Vertebrae 1
            'Vertebrae1': 'http://cdn.vertebraejs.com/latest/v1/Vertebrae.min.js',
            'Vertebrae1-d': 'http://cdn.vertebraejs.com/latest/v1/Vertebrae.js',

            // Vertebrae 2
            'Sync': 'http://cdn.vertebraejs.com/latest/v2/sync.js',
            
            // Misc Libraries
            'JSON2': 'http://cdn.vertebraejs.com/misc/json2.min.js',
            'jqGrid-Eng': 'http://cdn.vertebraejs.com/misc/grid.locale-en.min.js',
            'jqGrid': 'http://cdn.vertebraejs.com/misc/jquery.jqGrid.min.js',
            'Mustache': 'http://cdn.vertebraejs.com/misc/mustache.js',
            'jqTips': 'http://cdn.vertebraejs.com/misc/jQueryToolTips.js',
            'AjaxUpload': 'http://cdn.vertebraejs.com/misc/ajaxupload.js',

            // jQuery UI Themes
            'Cupertino': 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.11/themes/cupertino/jquery-ui.css'
        },
		
		loader = {
			callbacks: [],     //stack to hold callbacks
			reqscripts: [],	   // array to hold all loaded files
			argsTotal: 0,      // how many files in total are being inserted
			argsLoaded: 0,     // how many files completed
			watched: false	   // determine if tracking function has already been loaded
		},
		
		execute = function() {
			for (var i = 0, len = loader.callbacks.length; i < len; i += 1) (function () {
				var d = loader.callbacks.shift(); 
				d();
			})();
		},
		
		watch = function () {
			if (loader.watched === false) {
				var timer = window.setInterval(function () {
					if (loader.argsTotal === loader.argsLoaded) {
						window.clearInterval(timer);
						loader.watched = false;
						execute();
					}
				}, 5);
				loader.watched = true;
			}
		};
	
    vertebrae.require = (function () {

        var require = function (script, callback) {
            if (arguments.length == 0) return;

			loader.callbacks.unshift(callback); //add callback to beginning of stack
			
            if (typeof script === 'string') {
                loader.argsTotal += 1;
                if (libraryMap[script]) {   // see if shortcut was used
                    load(libraryMap[script]);
                } else {
                    load(script);
                }
            } else if (script instanceof Array) {
                loader.argsTotal += script.length;
                for (var i in script) {
                    if (libraryMap[script[i]]) {
                        load(libraryMap[script[i]]);
                    } else {
                        load(script[i]);
                    }
                }
            }
			
			watch();
					
            function load(url) {
                
                var head = document.head || document.getElementsByTagName('head')[0], // we add tags to <head>
                    id = 'script' + Math.floor(Math.random() * 1234),   // random id generator
                    tag = null; // used for building tag to insert

                // check to see if url is loaded already
                function notLoaded(src, type) { 

                    var nodes,      // element list for checking if file is included in page
                        property,   // property = 'src' for <script> and 'href' for <link>
                        nodeArray,  // function to get nodes in array
                        i = 0,
                        scrlen = loader.reqscripts.length;

                    // see if file is in global script array
                    for (; i < scrlen; i += 1) {  
                        if (loader.reqscripts[i] === src) {
                            return false;
                        }
                    }

                    if (type === 'js') {
                        nodes = document.getElementsByTagName('script');
                        property = 'src';
                    } else if (type === 'css') {
                        nodes = document.getElementsByTagName('link');
                        property = 'href';
                    }

                    nodeArray = (function () {
                        var arr = [],
                            count = nodes.length;
                        for (; count-- > 0; ) {
                            if (count in nodes) {
                                arr.push(nodes.count);
                            }
                        }
                        return arr;
                    });

                    var c = 0,
                        len = nodeArray.length;
                    for (; c < len; c += 1) {
                        if ((property in nodeArray[c]) && nodeArray[c][property] === src) return false;
                    }

                    return true; // file isnt loaded already
                }

                // if inserting a js file, create <script> tag
				if (url.indexOf('.js') > -1 && notLoaded(url, 'js')) {  
					loader.reqscripts.push(url);
					tag = document.createElement('script');
					tag.setAttribute('type', 'text/javascript');
					tag.src = url;
					tag.id = id;

					if (tag.onload || tag.onload === null || /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)) {
						tag.onload = function () {
							loader.argsLoaded += 1;
						}
					} else {
						tag.onreadystatechange = function () {
							if (this.readyState === "loaded" || this.readyState === "complete") {
								loader.argsLoaded += 1;
							}
						}
					}
                }

                // if inserting a css file, create <link> tag
                else if (url.indexOf('.css') > -1 && notLoaded(url, 'css')) { 
					loader.reqscripts.push(url);
					loader.argsLoaded += 1; // there is no onload event for link tags, so just increment
					tag = document.createElement('link');
					tag.rel = 'stylesheet';
					tag.type = 'text/css';
					tag.href = url;
					tag.id = id;
				}
				
                if (tag) {
					head.appendChild(tag);
                } else {
					loader.argsLoaded += 1; // already loaded so increment counter
				}
				
            }
        }
        return (require);
    })();

    return (window._v = vertebrae);

})(window);