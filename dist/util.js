!function(e){"function"==typeof define&&define.amd?define(e):e()}(function(){"use strict";module.exports=function(e,n,t){for(var i=e,r=(n=(n=n.toString().replace(/\[(\w+)\]/g,".$1")).toString().replace(/^\./,"")).split("."),o=0;o<r.length;++o){var f=r[o];f in i?i.hasOwnProperty(f)&&(t!==undefined&&o===r.length-1&&(i[f]=t),i=i[f]):i[f]=t}return i}});
