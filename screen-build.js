webpackJsonp([2],{

/***/ 341:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Promise.resolve().then((function() {
Promise.resolve().then((function() {
__webpack_require__.e/* require.ensure */(1).then((function() {
Promise.resolve().then((function() {
__webpack_require__.e/* require.ensure */(4).then((function() {
__webpack_require__.e/* require.ensure */(6).then((function() {
// ---------------------------------------------------------------
var ScreenState = __webpack_require__(14);
var ScreenView = __webpack_require__(88);

var bdy = document.body;

var screenView = new ScreenView({
  model: new ScreenState({}),
  broadcastId: window.location.hash.slice(1) || 'vfBus',
  el: document.querySelector('.screen'),
  width: bdy.clientWidth,
  height: bdy.clientHeight
});
screenView.render();

function resize() {
  screenView.resize(bdy);
}
window.addEventListener('resize', __webpack_require__(54)(resize, 100));
setTimeout(resize, 1500);
// ---------------------------------------------------------------
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

/***/ })

},[341]);
//# sourceMappingURL=screen-build.js.map