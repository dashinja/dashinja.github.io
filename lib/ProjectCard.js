"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ProjectCard(props) {
  return _react.default.createElement("div", {
    className: "card bg-dark text-white rounded border border-success"
  }, _react.default.createElement("a", {
    href: "https://dashinja.github.io/recipeciprocity/",
    target: "_blank",
    className: "text-white"
  }, _react.default.createElement("img", {
    className: "card-img",
    style: {
      height: 200,
      width: 200
    },
    src: "http://via.placeholder.com/200/200",
    alt: "Recipeciprocity Hero Image"
  }), _react.default.createElement("div", {
    className: "card-img-overlay container p-1 d-flex d-column justify-content-center align-items-end"
  }, _react.default.createElement("div", {
    className: "row bg-success w-100 text-center mb-2 py-2 rounded"
  }, _react.default.createElement("h5", {
    className: "card-title w-100 m-0 p-0 col rounded"
  }, "Recipeciprocity")))));
}

var _default = ProjectCard;
exports.default = _default;