/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// These are passed from the web app. Do not change
// without coordination with the web app code.

const USER_BACKGROUND_OPTION_CUSTOM = 'custom'
/* harmony export (immutable) */ __webpack_exports__["g"] = USER_BACKGROUND_OPTION_CUSTOM;

const USER_BACKGROUND_OPTION_COLOR = 'color'
/* harmony export (immutable) */ __webpack_exports__["f"] = USER_BACKGROUND_OPTION_COLOR;

const USER_BACKGROUND_OPTION_PHOTO = 'photo'
/* harmony export (immutable) */ __webpack_exports__["i"] = USER_BACKGROUND_OPTION_PHOTO;

const USER_BACKGROUND_OPTION_DAILY = 'daily'
/* harmony export (immutable) */ __webpack_exports__["h"] = USER_BACKGROUND_OPTION_DAILY;


const POST_MESSAGE_TYPE_BACKGROUND_SETTINGS = 'background-settings'
/* harmony export (immutable) */ __webpack_exports__["a"] = POST_MESSAGE_TYPE_BACKGROUND_SETTINGS;


// localStorage keys. Do not change, or it may
// break storage for existing users.

const STORAGE_BACKGROUND_OPTION = 'tabExt.user.background.option'
/* harmony export (immutable) */ __webpack_exports__["e"] = STORAGE_BACKGROUND_OPTION;

const STORAGE_BACKGROUND_CUSTOM_IMAGE = 'tabExt.user.background.customImage'
/* harmony export (immutable) */ __webpack_exports__["c"] = STORAGE_BACKGROUND_CUSTOM_IMAGE;

const STORAGE_BACKGROUND_COLOR = 'tabExt.user.background.color'
/* harmony export (immutable) */ __webpack_exports__["b"] = STORAGE_BACKGROUND_COLOR;

const STORAGE_BACKGROUND_IMAGE_URL = 'tabExt.user.background.imageURL'
/* harmony export (immutable) */ __webpack_exports__["d"] = STORAGE_BACKGROUND_IMAGE_URL;



/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__ = __webpack_require__(4);
/* globals Image */




const getBackgroundSettings = () => {
  return {
    backgroundOption: __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].getItem(__WEBPACK_IMPORTED_MODULE_0__constants__["e" /* STORAGE_BACKGROUND_OPTION */]),
    customImage: __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].getItem(__WEBPACK_IMPORTED_MODULE_0__constants__["c" /* STORAGE_BACKGROUND_CUSTOM_IMAGE */]),
    backgroundColor: __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].getItem(__WEBPACK_IMPORTED_MODULE_0__constants__["b" /* STORAGE_BACKGROUND_COLOR */]),
    imageURL: __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].getItem(__WEBPACK_IMPORTED_MODULE_0__constants__["d" /* STORAGE_BACKGROUND_IMAGE_URL */])
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = getBackgroundSettings;


// Update background settings.
const updateBackgroundSettings = (settings) => {
  __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].setItem(__WEBPACK_IMPORTED_MODULE_0__constants__["e" /* STORAGE_BACKGROUND_OPTION */], settings.backgroundOption)
  __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].setItem(__WEBPACK_IMPORTED_MODULE_0__constants__["c" /* STORAGE_BACKGROUND_CUSTOM_IMAGE */], settings.customImage)
  __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].setItem(__WEBPACK_IMPORTED_MODULE_0__constants__["b" /* STORAGE_BACKGROUND_COLOR */], settings.backgroundColor)
  __WEBPACK_IMPORTED_MODULE_1__localstorage_mgr__["a" /* default */].setItem(__WEBPACK_IMPORTED_MODULE_0__constants__["d" /* STORAGE_BACKGROUND_IMAGE_URL */], settings.imageURL)
}
/* harmony export (immutable) */ __webpack_exports__["d"] = updateBackgroundSettings;


const showBackgroundColor = (color) => {
  const bkgElem = document.getElementById('user-background')
  const bkgTintElem = document.getElementById('background-tint')
  bkgElem.style.background = color
  bkgElem.style.opacity = '1'
  bkgTintElem.style.backgroundColor = 'rgba(0, 0, 0, 0.03)'
  bkgTintElem.style.visibility = 'visible'
  bkgTintElem.style.opacity = '1'
}
/* harmony export (immutable) */ __webpack_exports__["b"] = showBackgroundColor;


const showBackgroundImg = (imgSrc) => {
  const img = new Image()
  img.addEventListener('load', function () {
    const bkgElem = document.getElementById('user-background')
    const bkgTintElem = document.getElementById('background-tint')
    bkgElem.style.backgroundImage = `url(${imgSrc})`
    bkgElem.style.opacity = '1'
    bkgTintElem.style.backgroundColor = 'rgba(0, 0, 0, 0.15)'
    bkgTintElem.style.visibility = 'visible'
    bkgTintElem.style.opacity = '1'
  })
  img.src = imgSrc
}
/* harmony export (immutable) */ __webpack_exports__["c"] = showBackgroundImg;



/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__render_background__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__msg_handling__ = __webpack_require__(5);




Object(__WEBPACK_IMPORTED_MODULE_0__render_background__["a" /* default */])()
Object(__WEBPACK_IMPORTED_MODULE_1__msg_handling__["a" /* addListener */])()


/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__background__ = __webpack_require__(1);





/* harmony default export */ __webpack_exports__["a"] = (function () {
  const settings = Object(__WEBPACK_IMPORTED_MODULE_1__background__["a" /* getBackgroundSettings */])()
  if (!settings.backgroundOption) {
    return
  }

  switch (settings.backgroundOption) {
    case __WEBPACK_IMPORTED_MODULE_0__constants__["g" /* USER_BACKGROUND_OPTION_CUSTOM */]:
      if (settings.customImage) {
        Object(__WEBPACK_IMPORTED_MODULE_1__background__["c" /* showBackgroundImg */])(settings.customImage)
      }
      break
    case __WEBPACK_IMPORTED_MODULE_0__constants__["f" /* USER_BACKGROUND_OPTION_COLOR */]:
      if (settings.backgroundColor) {
        Object(__WEBPACK_IMPORTED_MODULE_1__background__["b" /* showBackgroundColor */])(settings.backgroundColor)
      }
      break
    case __WEBPACK_IMPORTED_MODULE_0__constants__["i" /* USER_BACKGROUND_OPTION_PHOTO */]:
      if (settings.imageURL) {
        Object(__WEBPACK_IMPORTED_MODULE_1__background__["c" /* showBackgroundImg */])(settings.imageURL)
      }
      break
    case __WEBPACK_IMPORTED_MODULE_0__constants__["h" /* USER_BACKGROUND_OPTION_DAILY */]:
      if (settings.imageURL) {
        Object(__WEBPACK_IMPORTED_MODULE_1__background__["c" /* showBackgroundImg */])(settings.imageURL)
      }
      break
    default:
  }
});


/***/ }),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* global localStorage */

const localStorageMgr = {}

localStorageMgr.setItem = function (key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (e) {
    console.log('localStorage not supported. ', e)
  }
}

localStorageMgr.getItem = function (key) {
  try {
    var value = localStorage.getItem(key)
    return value
  } catch (e) {
    console.log('localStorage not supported. ', e)
    return null
  }
}

localStorageMgr.removeItem = function (key) {
  try {
    localStorage.removeItem(key)
  } catch (e) {
    console.log('localStorage not supported. ', e)
  }
}

/* harmony default export */ __webpack_exports__["a"] = (localStorageMgr);


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__constants__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__background__ = __webpack_require__(1);




// Handle messages from webpage.

var trustedOrigins = [
  'http://tab.gladly.io',
  'https://tab.gladly.io',
  'http://www.tabforacause.org',
  'https://www.tabforacause.org',
  'http://gladly.io',
  'https://gladly.io',
  // Used in development
  'http://localhost:3000',
  'http://test-tab2017.gladly.io',
  'https://test-tab2017.gladly.io',
  'http://dev-tab2017.gladly.io',
  'https://dev-tab2017.gladly.io',
  'http://prod-tab2017.gladly.io',
  'https://prod-tab2017.gladly.io'
]

// Called sometime after postMessage is called
function receiveMessage (event) {
  // Make sure we trust the sender.
  if (trustedOrigins.indexOf(event.origin) === -1) {
    console.error(`Received message from untrusted domain: ${event.origin}`)
    return
  }
  switch (event.data.type) {
    case __WEBPACK_IMPORTED_MODULE_0__constants__["a" /* POST_MESSAGE_TYPE_BACKGROUND_SETTINGS */]:
      Object(__WEBPACK_IMPORTED_MODULE_1__background__["d" /* updateBackgroundSettings */])(event.data.data)
      break
    default:
  }
}

// Listen for messages from the web app.
const addListener = () => {
  try {
    window.addEventListener('message', receiveMessage, false)
  } catch (e) {
    console.error(e)
  }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = addListener;



/***/ })
/******/ ]);