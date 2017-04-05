webpackJsonp([1],{

/***/ 647:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Promise.resolve().then((function() {
__webpack_require__.e/* require.ensure */(0/* duplicate */).then((function() {
__webpack_require__.e/* require.ensure */(0).then((function() {
__webpack_require__.e/* require.ensure */(4).then((function() {
// ---------------------------------------------------------------
var ScreenState = __webpack_require__(32);
var ScreenView = __webpack_require__(145);

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
window.addEventListener('resize', __webpack_require__(96)(resize, 100));
setTimeout(resize, 1500);
// ---------------------------------------------------------------
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);
}).bind(null, __webpack_require__)).catch(__webpack_require__.oe);

/***/ })

},[647]);
//# sourceMappingURL=screen-build.js.map