!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?t(exports):"function"==typeof define&&define.amd?define(["exports"],t):t((e=e||self).Domponent={})}(this,function(e){"use strict";e.byString=function(e,t,n){for(var o=n||this,i=(e=(e=e.toString().replace(/\[(\w+)\]/g,".$1")).toString().replace(/^\./,"")).split("."),r=0;r<i.length;++r){var f=i[r];f in o?o.hasOwnProperty(f)&&(t!==undefined&&r===i.length-1&&(o[f]=t),o=o[f]):o[f]=t}return o},Object.defineProperty(e,"__esModule",{value:!0})});
