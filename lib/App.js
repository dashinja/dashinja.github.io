"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _ProjectCard = _interopRequireDefault(require("./ProjectCard"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function App(props) {
  return _react.default.createElement(_ProjectCard.default, null);
} // const App = props => <ProjectCard />;


var _default = App;
exports.default = _default;