(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["cytoscapeEuler"] = factory();
	else
		root["cytoscapeEuler"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = Object.assign != null ? Object.assign.bind(Object) : function (tgt) {
  for (var _len = arguments.length, srcs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  srcs.forEach(function (src) {
    Object.keys(src).forEach(function (k) {
      return tgt[k] = src[k];
    });
  });

  return tgt;
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assign = __webpack_require__(0);

var defaults = Object.freeze({
  source: null,
  target: null,
  length: 80,
  coeff: 0.0002,
  weight: 1
});

function makeSpring(spring) {
  return assign({}, defaults, spring);
}

function applySpring(spring) {
  var body1 = spring.source,
      body2 = spring.target,
      length = spring.length < 0 ? defaults.length : spring.length,
      dx = body2.pos.x - body1.pos.x,
      dy = body2.pos.y - body1.pos.y,
      r = Math.sqrt(dx * dx + dy * dy);

  if (r === 0) {
    dx = (Math.random() - 0.5) / 50;
    dy = (Math.random() - 0.5) / 50;
    r = Math.sqrt(dx * dx + dy * dy);
  }

  var d = r - length;
  var coeff = (!spring.coeff || spring.coeff < 0 ? defaults.springCoeff : spring.coeff) * d / r * spring.weight;

  body1.force.x += coeff * dx;
  body1.force.y += coeff * dy;

  body2.force.x -= coeff * dx;
  body2.force.y -= coeff * dy;
}

module.exports = { makeSpring: makeSpring, applySpring: applySpring };

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
The implementation of the Euler layout algorithm
*/

var Layout = __webpack_require__(13);
var assign = __webpack_require__(0);
var defaults = __webpack_require__(4);

var _require = __webpack_require__(10),
    _tick = _require.tick;

var _require2 = __webpack_require__(7),
    makeQuadtree = _require2.makeQuadtree;

var _require3 = __webpack_require__(3),
    makeBody = _require3.makeBody;

var _require4 = __webpack_require__(1),
    makeSpring = _require4.makeSpring;

var isFn = function isFn(fn) {
  return typeof fn === 'function';
};
var isParent = function isParent(n) {
  return n.isParent();
};
var notIsParent = function notIsParent(n) {
  return !isParent(n);
};
var isLocked = function isLocked(n) {
  return n.locked();
};
var notIsLocked = function notIsLocked(n) {
  return !isLocked(n);
};
var isParentEdge = function isParentEdge(e) {
  return isParent(e.source()) || isParent(e.target());
};
var notIsParentEdge = function notIsParentEdge(e) {
  return !isParentEdge(e);
};
var getBody = function getBody(n) {
  return n.scratch('euler').body;
};
var getNonParentDescendants = function getNonParentDescendants(n) {
  return isParent(n) ? n.descendants().filter(notIsParent) : n;
};

var getScratch = function getScratch(el) {
  var scratch = el.scratch('euler');

  if (!scratch) {
    scratch = {};

    el.scratch('euler', scratch);
  }

  return scratch;
};

var optFn = function optFn(opt, ele) {
  if (isFn(opt)) {
    return opt(ele);
  } else {
    return opt;
  }
};

var Euler = function (_Layout) {
  _inherits(Euler, _Layout);

  function Euler(options) {
    _classCallCheck(this, Euler);

    return _possibleConstructorReturn(this, (Euler.__proto__ || Object.getPrototypeOf(Euler)).call(this, assign({}, defaults, options)));
  }

  _createClass(Euler, [{
    key: 'prerun',
    value: function prerun(state) {
      var s = state;

      s.quadtree = makeQuadtree();

      var bodies = s.bodies = [];

      // regular nodes
      s.nodes.filter(function (n) {
        return notIsParent(n);
      }).forEach(function (n) {
        var scratch = getScratch(n);

        var body = makeBody({
          pos: { x: scratch.x, y: scratch.y },
          mass: optFn(s.mass, n),
          locked: scratch.locked
        });

        body._cyNode = n;

        scratch.body = body;

        body._scratch = scratch;

        bodies.push(body);
      });

      var springs = s.springs = [];

      // regular edge springs
      s.edges.filter(notIsParentEdge).forEach(function (e) {
        var spring = makeSpring({
          source: getBody(e.source()),
          target: getBody(e.target()),
          length: optFn(s.springLength, e),
          coeff: optFn(s.springCoeff, e)
        });

        spring._cyEdge = e;

        var scratch = getScratch(e);

        spring._scratch = scratch;

        scratch.spring = spring;

        springs.push(spring);
      });

      // compound edge springs
      s.edges.filter(isParentEdge).forEach(function (e) {
        var sources = getNonParentDescendants(e.source());
        var targets = getNonParentDescendants(e.target());

        // just add one spring for perf
        sources = [sources[0]];
        targets = [targets[0]];

        sources.forEach(function (src) {
          targets.forEach(function (tgt) {
            springs.push(makeSpring({
              source: getBody(src),
              target: getBody(tgt),
              length: optFn(s.springLength, e),
              coeff: optFn(s.springCoeff, e)
            }));
          });
        });
      });
    }
  }, {
    key: 'tick',
    value: function tick(state) {
      var movement = _tick(state);

      var isDone = movement <= state.movementThreshold;

      return isDone;
    }
  }]);

  return Euler;
}(Layout);

module.exports = Euler;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = Object.freeze({
  pos: { x: 0, y: 0 },
  prevPos: { x: 0, y: 0 },
  force: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  mass: 1
});

var copyVec = function copyVec(v) {
  return { x: v.x, y: v.y };
};
var getValue = function getValue(val, def) {
  return val != null ? val : def;
};
var getVec = function getVec(vec, def) {
  return copyVec(getValue(vec, def));
};

function makeBody(opts) {
  var b = {};

  b.pos = getVec(opts.pos, defaults.pos);
  b.prevPos = getVec(opts.prevPos, b.pos);
  b.force = getVec(opts.force, defaults.force);
  b.velocity = getVec(opts.velocity, defaults.velocity);
  b.mass = opts.mass != null ? opts.mass : defaults.mass;
  b.locked = opts.locked;

  return b;
}

module.exports = { makeBody: makeBody };

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaults = Object.freeze({
  // The ideal legth of a spring
  // - This acts as a hint for the edge length
  // - The edge length can be longer or shorter if the forces are set to extreme values
  springLength: function springLength(edge) {
    return 80;
  },

  // Hooke's law coefficient
  // - The value ranges on [0, 1]
  // - Lower values give looser springs
  // - Higher values give tighter springs
  springCoeff: function springCoeff(edge) {
    return 0.0008;
  },

  // The mass of the node in the physics simulation
  // - The mass affects the gravity node repulsion/attraction
  mass: function mass(node) {
    return 4;
  },

  // Coulomb's law coefficient
  // - Makes the nodes repel each other for negative values
  // - Makes the nodes attract each other for positive values
  gravity: -1.2,

  // A force that pulls nodes towards the origin (0, 0)
  // Higher values keep the components less spread out
  pull: 0.001,

  // Theta coefficient from Barnes-Hut simulation
  // - Value ranges on [0, 1]
  // - Performance is better with smaller values
  // - Very small values may not create enough force to give a good result
  theta: 0.666,

  // Friction / drag coefficient to make the system stabilise over time
  dragCoeff: 0.02,

  // When the total of the squared position deltas is less than this value, the simulation ends
  movementThreshold: 1,

  // The amount of time passed per tick
  // - Larger values result in faster runtimes but might spread things out too far
  // - Smaller values produce more accurate results
  timeStep: 20
});

module.exports = defaults;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var defaultCoeff = 0.02;

function applyDrag(body, manualDragCoeff) {
  var dragCoeff = void 0;

  if (manualDragCoeff != null) {
    dragCoeff = manualDragCoeff;
  } else if (body.dragCoeff != null) {
    dragCoeff = body.dragCoeff;
  } else {
    dragCoeff = defaultCoeff;
  }

  body.force.x -= dragCoeff * body.velocity.x;
  body.force.y -= dragCoeff * body.velocity.y;
}

module.exports = { applyDrag: applyDrag };

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// use euler method for force integration http://en.wikipedia.org/wiki/Euler_method
// return sum of squared position deltas
function integrate(bodies, timeStep) {
  var dx = 0,
      tx = 0,
      dy = 0,
      ty = 0,
      i,
      max = bodies.length;

  if (max === 0) {
    return 0;
  }

  for (i = 0; i < max; ++i) {
    var body = bodies[i],
        coeff = timeStep / body.mass;

    if (body.grabbed) {
      continue;
    }

    if (body.locked) {
      body.velocity.x = 0;
      body.velocity.y = 0;
    } else {
      body.velocity.x += coeff * body.force.x;
      body.velocity.y += coeff * body.force.y;
    }

    var vx = body.velocity.x,
        vy = body.velocity.y,
        v = Math.sqrt(vx * vx + vy * vy);

    if (v > 1) {
      body.velocity.x = vx / v;
      body.velocity.y = vy / v;
    }

    dx = timeStep * body.velocity.x;
    dy = timeStep * body.velocity.y;

    body.pos.x += dx;
    body.pos.y += dy;

    tx += Math.abs(dx);ty += Math.abs(dy);
  }

  return (tx * tx + ty * ty) / max;
}

module.exports = { integrate: integrate };

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// impl of barnes hut
// http://www.eecs.berkeley.edu/~demmel/cs267/lecture26/lecture26.html
// http://en.wikipedia.org/wiki/Barnes%E2%80%93Hut_simulation

var Node = __webpack_require__(9);
var InsertStack = __webpack_require__(8);

var resetVec = function resetVec(v) {
  v.x = 0;v.y = 0;
};

var isSamePosition = function isSamePosition(p1, p2) {
  var threshold = 1e-8;
  var dx = Math.abs(p1.x - p2.x);
  var dy = Math.abs(p1.y - p2.y);

  return dx < threshold && dy < threshold;
};

function makeQuadtree() {
  var updateQueue = [],
      insertStack = new InsertStack(),
      nodesCache = [],
      currentInCache = 0,
      root = newNode();

  function newNode() {
    // To avoid pressure on GC we reuse nodes.
    var node = nodesCache[currentInCache];
    if (node) {
      node.quad0 = null;
      node.quad1 = null;
      node.quad2 = null;
      node.quad3 = null;
      node.body = null;
      node.mass = node.massX = node.massY = 0;
      node.left = node.right = node.top = node.bottom = 0;
    } else {
      node = new Node();
      nodesCache[currentInCache] = node;
    }

    ++currentInCache;
    return node;
  }

  function update(sourceBody, gravity, theta, pull) {
    var queue = updateQueue,
        v = void 0,
        dx = void 0,
        dy = void 0,
        r = void 0,
        fx = 0,
        fy = 0,
        queueLength = 1,
        shiftIdx = 0,
        pushIdx = 1;

    queue[0] = root;

    resetVec(sourceBody.force);

    var px = -sourceBody.pos.x;
    var py = -sourceBody.pos.y;
    var pr = Math.sqrt(px * px + py * py);
    var pv = sourceBody.mass * pull / pr;

    fx += pv * px;
    fy += pv * py;

    while (queueLength) {
      var node = queue[shiftIdx],
          body = node.body;

      queueLength -= 1;
      shiftIdx += 1;
      var differentBody = body !== sourceBody;
      if (body && differentBody) {
        // If the current node is a leaf node (and it is not source body),
        // calculate the force exerted by the current node on body, and add this
        // amount to body's net force.
        dx = body.pos.x - sourceBody.pos.x;
        dy = body.pos.y - sourceBody.pos.y;
        r = Math.sqrt(dx * dx + dy * dy);

        if (r === 0) {
          // Poor man's protection against zero distance.
          dx = (Math.random() - 0.5) / 50;
          dy = (Math.random() - 0.5) / 50;
          r = Math.sqrt(dx * dx + dy * dy);
        }

        // This is standard gravition force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        fx += v * dx;
        fy += v * dy;
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        dx = node.massX / node.mass - sourceBody.pos.x;
        dy = node.massY / node.mass - sourceBody.pos.y;
        r = Math.sqrt(dx * dx + dy * dy);

        if (r === 0) {
          // Sorry about code duplucation. I don't want to create many functions
          // right away. Just want to see performance first.
          dx = (Math.random() - 0.5) / 50;
          dy = (Math.random() - 0.5) / 50;
          r = Math.sqrt(dx * dx + dy * dy);
        }
        // If s / r < θ, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.right - node.left) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was squarified during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          fx += v * dx;
          fy += v * dy;
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
          if (node.quad0) {
            queue[pushIdx] = node.quad0;
            queueLength += 1;
            pushIdx += 1;
          }
          if (node.quad1) {
            queue[pushIdx] = node.quad1;
            queueLength += 1;
            pushIdx += 1;
          }
          if (node.quad2) {
            queue[pushIdx] = node.quad2;
            queueLength += 1;
            pushIdx += 1;
          }
          if (node.quad3) {
            queue[pushIdx] = node.quad3;
            queueLength += 1;
            pushIdx += 1;
          }
        }
      }
    }

    sourceBody.force.x += fx;
    sourceBody.force.y += fy;
  }

  function insertBodies(bodies) {
    if (bodies.length === 0) {
      return;
    }

    var x1 = Number.MAX_VALUE,
        y1 = Number.MAX_VALUE,
        x2 = Number.MIN_VALUE,
        y2 = Number.MIN_VALUE,
        i = void 0,
        max = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    i = max;
    while (i--) {
      var x = bodies[i].pos.x;
      var y = bodies[i].pos.y;
      if (x < x1) {
        x1 = x;
      }
      if (x > x2) {
        x2 = x;
      }
      if (y < y1) {
        y1 = y;
      }
      if (y > y2) {
        y2 = y;
      }
    }

    // Squarify the bounds.
    var dx = x2 - x1,
        dy = y2 - y1;
    if (dx > dy) {
      y2 = y1 + dx;
    } else {
      x2 = x1 + dy;
    }

    currentInCache = 0;
    root = newNode();
    root.left = x1;
    root.right = x2;
    root.top = y1;
    root.bottom = y2;

    i = max - 1;
    if (i >= 0) {
      root.body = bodies[i];
    }
    while (i--) {
      insert(bodies[i], root);
    }
  }

  function insert(newBody) {
    insertStack.reset();
    insertStack.push(root, newBody);

    while (!insertStack.isEmpty()) {
      var stackItem = insertStack.pop(),
          node = stackItem.node,
          body = stackItem.body;

      if (!node.body) {
        // This is internal node. Update the total mass of the node and center-of-mass.
        var x = body.pos.x;
        var y = body.pos.y;
        node.mass = node.mass + body.mass;
        node.massX = node.massX + body.mass * x;
        node.massY = node.massY + body.mass * y;

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0,
            // Assume we are in the 0's quad.
        left = node.left,
            right = (node.right + left) / 2,
            top = node.top,
            bottom = (node.bottom + top) / 2;

        if (x > right) {
          // somewhere in the eastern part.
          quadIdx = quadIdx + 1;
          left = right;
          right = node.right;
        }
        if (y > bottom) {
          // and in south.
          quadIdx = quadIdx + 2;
          top = bottom;
          bottom = node.bottom;
        }

        var child = getChild(node, quadIdx);
        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          child.left = left;
          child.top = top;
          child.right = right;
          child.bottom = bottom;
          child.body = body;

          setChild(node, quadIdx, child);
        } else {
          // continue searching in this quadrant.
          insertStack.push(child, body);
        }
      } else {
        // We are trying to add to the leaf node.
        // We have to convert current leaf into internal node
        // and continue adding two nodes.
        var oldBody = node.body;
        node.body = null; // internal nodes do not cary bodies

        if (isSamePosition(oldBody.pos, body.pos)) {
          // Prevent infinite subdivision by bumping one node
          // anywhere in this quadrant
          var retriesCount = 3;
          do {
            var offset = Math.random();
            var dx = (node.right - node.left) * offset;
            var dy = (node.bottom - node.top) * offset;

            oldBody.pos.x = node.left + dx;
            oldBody.pos.y = node.top + dy;
            retriesCount -= 1;
            // Make sure we don't bump it out of the box. If we do, next iteration should fix it
          } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

          if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
            // This is very bad, we ran out of precision.
            // if we do not return from the method we'll get into
            // infinite loop here. So we sacrifice correctness of layout, and keep the app running
            // Next layout iteration should get larger bounding box in the first step and fix this
            return;
          }
        }
        // Next iteration should subdivide node further.
        insertStack.push(node, oldBody);
        insertStack.push(node, body);
      }
    }
  }

  return {
    insertBodies: insertBodies,
    updateBodyForce: update
  };
}

function getChild(node, idx) {
  if (idx === 0) return node.quad0;
  if (idx === 1) return node.quad1;
  if (idx === 2) return node.quad2;
  if (idx === 3) return node.quad3;
  return null;
}

function setChild(node, idx, child) {
  if (idx === 0) node.quad0 = child;else if (idx === 1) node.quad1 = child;else if (idx === 2) node.quad2 = child;else if (idx === 3) node.quad3 = child;
}

module.exports = { makeQuadtree: makeQuadtree };

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = InsertStack;

/**
 * Our implmentation of QuadTree is non-recursive to avoid GC hit
 * This data structure represent stack of elements
 * which we are trying to insert into quad tree.
 */
function InsertStack() {
    this.stack = [];
    this.popIdx = 0;
}

InsertStack.prototype = {
    isEmpty: function isEmpty() {
        return this.popIdx === 0;
    },
    push: function push(node, body) {
        var item = this.stack[this.popIdx];
        if (!item) {
            // we are trying to avoid memory pressue: create new element
            // only when absolutely necessary
            this.stack[this.popIdx] = new InsertStackElement(node, body);
        } else {
            item.node = node;
            item.body = body;
        }
        ++this.popIdx;
    },
    pop: function pop() {
        if (this.popIdx > 0) {
            return this.stack[--this.popIdx];
        }
    },
    reset: function reset() {
        this.popIdx = 0;
    }
};

function InsertStackElement(node, body) {
    this.node = node; // QuadTree node
    this.body = body; // physical body which needs to be inserted to node
}

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Internal data structure to represent 2D QuadTree node
 */
module.exports = function Node() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain boides:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // 0 | 1
  // -----
  // 2 | 3
  this.quad0 = null;
  this.quad1 = null;
  this.quad2 = null;
  this.quad3 = null;

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  this.massX = 0;
  this.massY = 0;

  // bounding box coordinates
  this.left = 0;
  this.top = 0;
  this.bottom = 0;
  this.right = 0;
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _require = __webpack_require__(6),
    integrate = _require.integrate;

var _require2 = __webpack_require__(5),
    applyDrag = _require2.applyDrag;

var _require3 = __webpack_require__(1),
    applySpring = _require3.applySpring;

function tick(_ref) {
  var bodies = _ref.bodies,
      springs = _ref.springs,
      quadtree = _ref.quadtree,
      timeStep = _ref.timeStep,
      gravity = _ref.gravity,
      theta = _ref.theta,
      dragCoeff = _ref.dragCoeff,
      pull = _ref.pull;

  // update body from scratch in case of any changes
  bodies.forEach(function (body) {
    var p = body._scratch;

    if (!p) {
      return;
    }

    body.locked = p.locked;
    body.grabbed = p.grabbed;
    body.pos.x = p.x;
    body.pos.y = p.y;
  });

  quadtree.insertBodies(bodies);

  for (var i = 0; i < bodies.length; i++) {
    var body = bodies[i];

    quadtree.updateBodyForce(body, gravity, theta, pull);
    applyDrag(body, dragCoeff);
  }

  for (var _i = 0; _i < springs.length; _i++) {
    var spring = springs[_i];

    applySpring(spring);
  }

  var movement = integrate(bodies, timeStep);

  // update scratch positions from body positions
  bodies.forEach(function (body) {
    var p = body._scratch;

    if (!p) {
      return;
    }

    p.x = body.pos.x;
    p.y = body.pos.y;
  });

  return movement;
}

module.exports = { tick: tick };

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var Euler = __webpack_require__(2);

// registers the extension on a cytoscape lib ref
var register = function register(cytoscape) {
  if (!cytoscape) {
    return;
  } // can't register if cytoscape unspecified

  cytoscape('layout', 'euler', Euler); // register with cytoscape.js
};

if (typeof cytoscape !== 'undefined') {
  // expose to global cytoscape (i.e. window.cytoscape)
  register(cytoscape);
}

module.exports = register;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


// general default options for force-directed layout

module.exports = Object.freeze({
  animate: true, // whether to show the layout as it's running; special 'end' value makes the layout animate like a discrete layout
  refresh: 10, // number of ticks per frame; higher is faster but more jerky
  maxIterations: 1000, // max iterations before the layout will bail out
  maxSimulationTime: 4000, // max length in ms to run the layout
  ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
  fit: true, // on every layout reposition of nodes, fit the viewport
  padding: 30, // padding around the simulation
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

  // layout event callbacks
  ready: function ready() {}, // on layoutready
  stop: function stop() {}, // on layoutstop

  // positioning options
  randomize: false, // use random node positions at beginning of layout

  // infinite layout options
  infinite: false // overrides all other options for a forces-all-the-time mode
});

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
A generic continuous layout class
*/

var assign = __webpack_require__(0);
var defaults = __webpack_require__(12);
var makeBoundingBox = __webpack_require__(14);

var _require = __webpack_require__(15),
    setInitialPositionState = _require.setInitialPositionState,
    refreshPositions = _require.refreshPositions,
    getNodePositionData = _require.getNodePositionData;

var _require2 = __webpack_require__(16),
    multitick = _require2.multitick;

var Layout = function () {
  function Layout(options) {
    _classCallCheck(this, Layout);

    var o = this.options = assign({}, defaults, options);

    var s = this.state = assign({}, o, {
      layout: this,
      nodes: o.eles.nodes(),
      edges: o.eles.edges(),
      tickIndex: 0,
      firstUpdate: true
    });

    s.animateEnd = o.animate && o.animate === 'end';
    s.animateContinuously = o.animate && !s.animateEnd;
  }

  _createClass(Layout, [{
    key: 'run',
    value: function run() {
      var l = this;
      var s = this.state;

      s.tickIndex = 0;
      s.firstUpdate = true;
      s.startTime = Date.now();
      s.running = true;

      s.currentBoundingBox = makeBoundingBox(s.boundingBox, s.cy);

      if (s.ready) {
        l.one('ready', s.ready);
      }
      if (s.stop) {
        l.one('stop', s.stop);
      }

      s.nodes.forEach(function (n) {
        return setInitialPositionState(n, s);
      });

      l.prerun(s);

      if (s.animateContinuously) {
        var ungrabify = function ungrabify(node) {
          if (!s.ungrabifyWhileSimulating) {
            return;
          }

          var grabbable = getNodePositionData(node, s).grabbable = node.grabbable();

          if (grabbable) {
            node.ungrabify();
          }
        };

        var regrabify = function regrabify(node) {
          if (!s.ungrabifyWhileSimulating) {
            return;
          }

          var grabbable = getNodePositionData(node, s).grabbable;

          if (grabbable) {
            node.grabify();
          }
        };

        var updateGrabState = function updateGrabState(node) {
          return getNodePositionData(node, s).grabbed = node.grabbed();
        };

        var onGrab = function onGrab(_ref) {
          var target = _ref.target;

          updateGrabState(target);
        };

        var onFree = onGrab;

        var onDrag = function onDrag(_ref2) {
          var target = _ref2.target;

          var p = getNodePositionData(target, s);
          var tp = target.position();

          p.x = tp.x;
          p.y = tp.y;
        };

        var listenToGrab = function listenToGrab(node) {
          node.on('grab', onGrab);
          node.on('free', onFree);
          node.on('drag', onDrag);
        };

        var unlistenToGrab = function unlistenToGrab(node) {
          node.removeListener('grab', onGrab);
          node.removeListener('free', onFree);
          node.removeListener('drag', onDrag);
        };

        var fit = function fit() {
          if (s.fit && s.animateContinuously) {
            s.cy.fit(s.padding);
          }
        };

        var onNotDone = function onNotDone() {
          refreshPositions(s.nodes, s);
          fit();

          requestAnimationFrame(_frame);
        };

        var _frame = function _frame() {
          multitick(s, onNotDone, _onDone);
        };

        var _onDone = function _onDone() {
          refreshPositions(s.nodes, s);
          fit();

          s.nodes.forEach(function (n) {
            regrabify(n);
            unlistenToGrab(n);
          });

          s.running = false;

          l.emit('layoutstop');
        };

        l.emit('layoutstart');

        s.nodes.forEach(function (n) {
          ungrabify(n);
          listenToGrab(n);
        });

        _frame(); // kick off
      } else {
        var done = false;
        var _onNotDone = function _onNotDone() {};
        var _onDone2 = function _onDone2() {
          return done = true;
        };

        while (!done) {
          multitick(s, _onNotDone, _onDone2);
        }

        s.eles.layoutPositions(this, s, function (node) {
          return getNodePositionData(node, s);
        });
      }

      l.postrun(s);

      return this; // chaining
    }
  }, {
    key: 'prerun',
    value: function prerun() {}
  }, {
    key: 'postrun',
    value: function postrun() {}
  }, {
    key: 'tick',
    value: function tick() {}
  }, {
    key: 'stop',
    value: function stop() {
      this.state.running = false;

      return this; // chaining
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      return this; // chaining
    }
  }]);

  return Layout;
}();

module.exports = Layout;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


module.exports = function (bb, cy) {
  if (bb == null) {
    bb = { x1: 0, y1: 0, w: cy.width(), h: cy.height() };
  } else {
    // copy
    bb = { x1: bb.x1, x2: bb.x2, y1: bb.y1, y2: bb.y2, w: bb.w, h: bb.h };
  }

  if (bb.x2 == null) {
    bb.x2 = bb.x1 + bb.w;
  }
  if (bb.w == null) {
    bb.w = bb.x2 - bb.x1;
  }
  if (bb.y2 == null) {
    bb.y2 = bb.y1 + bb.h;
  }
  if (bb.h == null) {
    bb.h = bb.y2 - bb.y1;
  }

  return bb;
};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var assign = __webpack_require__(0);

var setInitialPositionState = function setInitialPositionState(node, state) {
  var p = node.position();
  var bb = state.currentBoundingBox;
  var scratch = node.scratch(state.name);

  if (scratch == null) {
    scratch = {};

    node.scratch(state.name, scratch);
  }

  assign(scratch, state.randomize ? {
    x: bb.x1 + Math.round(Math.random() * bb.w),
    y: bb.y1 + Math.round(Math.random() * bb.h)
  } : {
    x: p.x,
    y: p.y
  });

  scratch.locked = node.locked();
};

var getNodePositionData = function getNodePositionData(node, state) {
  return node.scratch(state.name);
};

var refreshPositions = function refreshPositions(nodes, state) {
  nodes.positions(function (node) {
    var scratch = node.scratch(state.name);

    return {
      x: scratch.x,
      y: scratch.y
    };
  });
};

module.exports = { setInitialPositionState: setInitialPositionState, getNodePositionData: getNodePositionData, refreshPositions: refreshPositions };

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var nop = function nop() {};

var tick = function tick(state) {
  var s = state;
  var l = state.layout;

  var tickIndicatesDone = l.tick(s);

  if (s.firstUpdate) {
    if (s.animateContinuously) {
      // indicate the initial positions have been set
      s.layout.emit('layoutready');
    }
    s.firstUpdate = false;
  }

  s.tickIndex++;

  var duration = Date.now() - s.startTime;

  return !s.infinite && (tickIndicatesDone || s.tickIndex >= s.maxIterations || duration >= s.maxSimulationTime);
};

var multitick = function multitick(state) {
  var onNotDone = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : nop;
  var onDone = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : nop;

  var done = false;
  var s = state;

  for (var i = 0; i < s.refresh; i++) {
    done = !s.running || tick(s);

    if (done) {
      break;
    }
  }

  if (!done) {
    onNotDone();
  } else {
    onDone();
  }
};

module.exports = { tick: tick, multitick: multitick };

/***/ })
/******/ ]);
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA5NzY1MWE5NDhlNDZmNWQ3ZTQyNyIsIndlYnBhY2s6Ly8vLi9zcmMvYXNzaWduLmpzIiwid2VicGFjazovLy8uL3NyYy9ldWxlci9zcHJpbmcuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V1bGVyL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9ldWxlci9ib2R5LmpzIiwid2VicGFjazovLy8uL3NyYy9ldWxlci9kZWZhdWx0cy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXVsZXIvZHJhZy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXVsZXIvaW50ZWdyYXRlLmpzIiwid2VicGFjazovLy8uL3NyYy9ldWxlci9xdWFkdHJlZS9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZXVsZXIvcXVhZHRyZWUvaW5zZXJ0U3RhY2suanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V1bGVyL3F1YWR0cmVlL25vZGUuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2V1bGVyL3RpY2suanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy8uL3NyYy9sYXlvdXQvZGVmYXVsdHMuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xheW91dC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbGF5b3V0L21ha2UtYmIuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2xheW91dC9wb3NpdGlvbi5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvbGF5b3V0L3RpY2suanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsIk9iamVjdCIsImFzc2lnbiIsImJpbmQiLCJ0Z3QiLCJzcmNzIiwiZm9yRWFjaCIsImtleXMiLCJzcmMiLCJrIiwicmVxdWlyZSIsImRlZmF1bHRzIiwiZnJlZXplIiwic291cmNlIiwidGFyZ2V0IiwibGVuZ3RoIiwiY29lZmYiLCJ3ZWlnaHQiLCJtYWtlU3ByaW5nIiwic3ByaW5nIiwiYXBwbHlTcHJpbmciLCJib2R5MSIsImJvZHkyIiwiZHgiLCJwb3MiLCJ4IiwiZHkiLCJ5IiwiciIsIk1hdGgiLCJzcXJ0IiwicmFuZG9tIiwiZCIsInNwcmluZ0NvZWZmIiwiZm9yY2UiLCJMYXlvdXQiLCJ0aWNrIiwibWFrZVF1YWR0cmVlIiwibWFrZUJvZHkiLCJpc0ZuIiwiZm4iLCJpc1BhcmVudCIsIm4iLCJub3RJc1BhcmVudCIsImlzTG9ja2VkIiwibG9ja2VkIiwibm90SXNMb2NrZWQiLCJpc1BhcmVudEVkZ2UiLCJlIiwibm90SXNQYXJlbnRFZGdlIiwiZ2V0Qm9keSIsInNjcmF0Y2giLCJib2R5IiwiZ2V0Tm9uUGFyZW50RGVzY2VuZGFudHMiLCJkZXNjZW5kYW50cyIsImZpbHRlciIsImdldFNjcmF0Y2giLCJlbCIsIm9wdEZuIiwib3B0IiwiZWxlIiwiRXVsZXIiLCJvcHRpb25zIiwic3RhdGUiLCJzIiwicXVhZHRyZWUiLCJib2RpZXMiLCJub2RlcyIsIm1hc3MiLCJfY3lOb2RlIiwiX3NjcmF0Y2giLCJwdXNoIiwic3ByaW5ncyIsImVkZ2VzIiwic3ByaW5nTGVuZ3RoIiwiX2N5RWRnZSIsInNvdXJjZXMiLCJ0YXJnZXRzIiwibW92ZW1lbnQiLCJpc0RvbmUiLCJtb3ZlbWVudFRocmVzaG9sZCIsInByZXZQb3MiLCJ2ZWxvY2l0eSIsImNvcHlWZWMiLCJ2IiwiZ2V0VmFsdWUiLCJ2YWwiLCJkZWYiLCJnZXRWZWMiLCJ2ZWMiLCJvcHRzIiwiYiIsImdyYXZpdHkiLCJwdWxsIiwidGhldGEiLCJkcmFnQ29lZmYiLCJ0aW1lU3RlcCIsImRlZmF1bHRDb2VmZiIsImFwcGx5RHJhZyIsIm1hbnVhbERyYWdDb2VmZiIsImludGVncmF0ZSIsInR4IiwidHkiLCJpIiwibWF4IiwiZ3JhYmJlZCIsInZ4IiwidnkiLCJhYnMiLCJOb2RlIiwiSW5zZXJ0U3RhY2siLCJyZXNldFZlYyIsImlzU2FtZVBvc2l0aW9uIiwicDEiLCJwMiIsInRocmVzaG9sZCIsInVwZGF0ZVF1ZXVlIiwiaW5zZXJ0U3RhY2siLCJub2Rlc0NhY2hlIiwiY3VycmVudEluQ2FjaGUiLCJyb290IiwibmV3Tm9kZSIsIm5vZGUiLCJxdWFkMCIsInF1YWQxIiwicXVhZDIiLCJxdWFkMyIsIm1hc3NYIiwibWFzc1kiLCJsZWZ0IiwicmlnaHQiLCJ0b3AiLCJib3R0b20iLCJ1cGRhdGUiLCJzb3VyY2VCb2R5IiwicXVldWUiLCJmeCIsImZ5IiwicXVldWVMZW5ndGgiLCJzaGlmdElkeCIsInB1c2hJZHgiLCJweCIsInB5IiwicHIiLCJwdiIsImRpZmZlcmVudEJvZHkiLCJpbnNlcnRCb2RpZXMiLCJ4MSIsIk51bWJlciIsIk1BWF9WQUxVRSIsInkxIiwieDIiLCJNSU5fVkFMVUUiLCJ5MiIsImluc2VydCIsIm5ld0JvZHkiLCJyZXNldCIsImlzRW1wdHkiLCJzdGFja0l0ZW0iLCJwb3AiLCJxdWFkSWR4IiwiY2hpbGQiLCJnZXRDaGlsZCIsInNldENoaWxkIiwib2xkQm9keSIsInJldHJpZXNDb3VudCIsIm9mZnNldCIsInVwZGF0ZUJvZHlGb3JjZSIsImlkeCIsInN0YWNrIiwicG9wSWR4IiwicHJvdG90eXBlIiwiaXRlbSIsIkluc2VydFN0YWNrRWxlbWVudCIsInAiLCJyZWdpc3RlciIsImN5dG9zY2FwZSIsImFuaW1hdGUiLCJyZWZyZXNoIiwibWF4SXRlcmF0aW9ucyIsIm1heFNpbXVsYXRpb25UaW1lIiwidW5ncmFiaWZ5V2hpbGVTaW11bGF0aW5nIiwiZml0IiwicGFkZGluZyIsImJvdW5kaW5nQm94IiwidW5kZWZpbmVkIiwicmVhZHkiLCJzdG9wIiwicmFuZG9taXplIiwiaW5maW5pdGUiLCJtYWtlQm91bmRpbmdCb3giLCJzZXRJbml0aWFsUG9zaXRpb25TdGF0ZSIsInJlZnJlc2hQb3NpdGlvbnMiLCJnZXROb2RlUG9zaXRpb25EYXRhIiwibXVsdGl0aWNrIiwibyIsImxheW91dCIsImVsZXMiLCJ0aWNrSW5kZXgiLCJmaXJzdFVwZGF0ZSIsImFuaW1hdGVFbmQiLCJhbmltYXRlQ29udGludW91c2x5IiwibCIsInN0YXJ0VGltZSIsIkRhdGUiLCJub3ciLCJydW5uaW5nIiwiY3VycmVudEJvdW5kaW5nQm94IiwiY3kiLCJvbmUiLCJwcmVydW4iLCJ1bmdyYWJpZnkiLCJncmFiYmFibGUiLCJyZWdyYWJpZnkiLCJncmFiaWZ5IiwidXBkYXRlR3JhYlN0YXRlIiwib25HcmFiIiwib25GcmVlIiwib25EcmFnIiwidHAiLCJwb3NpdGlvbiIsImxpc3RlblRvR3JhYiIsIm9uIiwidW5saXN0ZW5Ub0dyYWIiLCJyZW1vdmVMaXN0ZW5lciIsIm9uTm90RG9uZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsImZyYW1lIiwib25Eb25lIiwiZW1pdCIsImRvbmUiLCJsYXlvdXRQb3NpdGlvbnMiLCJwb3N0cnVuIiwiYmIiLCJ3Iiwid2lkdGgiLCJoIiwiaGVpZ2h0IiwibmFtZSIsInJvdW5kIiwicG9zaXRpb25zIiwibm9wIiwidGlja0luZGljYXRlc0RvbmUiLCJkdXJhdGlvbiJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbURBQTJDLGNBQWM7O0FBRXpEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7OztBQ2hFQUEsT0FBT0MsT0FBUCxHQUFpQkMsT0FB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LHVFQUFMYSxHQUFLOztBQUM5RCxNQUFJWCxPQUFPLEtBQVg7QUFDQSxNQUFJdEssSUFBSUQsS0FBUjs7QUFFQSxPQUFLLElBQUl3QyxJQUFJLENBQWIsRUFBZ0JBLElBQUl2QyxFQUFFa0gsT0FBdEIsRUFBK0IzRSxHQUEvQixFQUFvQztBQUNsQytILFdBQU8sQ0FBQ3RLLEVBQUU4SSxPQUFILElBQWMxSyxLQUFNNEIsQ0FBTixDQUFyQjs7QUFFQSxRQUFJc0ssSUFBSixFQUFVO0FBQUU7QUFBUTtBQUNyQjs7QUFFRCxNQUFJLENBQUNBLElBQUwsRUFBVztBQUNUTDtBQUNELEdBRkQsTUFFTztBQUNMRztBQUNEO0FBQ0YsQ0FmRDs7QUFpQkFyTyxPQUFPQyxPQUFQLEdBQWlCLEVBQUVvQyxVQUFGLEVBQVE4SixvQkFBUixFQUFqQixDIiwiZmlsZSI6ImN5dG9zY2FwZS1ldWxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcImN5dG9zY2FwZUV1bGVyXCJdID0gZmFjdG9yeSgpO1xuXHRlbHNlXG5cdFx0cm9vdFtcImN5dG9zY2FwZUV1bGVyXCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svdW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbiIsIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGlkZW50aXR5IGZ1bmN0aW9uIGZvciBjYWxsaW5nIGhhcm1vbnkgaW1wb3J0cyB3aXRoIHRoZSBjb3JyZWN0IGNvbnRleHRcbiBcdF9fd2VicGFja19yZXF1aXJlX18uaSA9IGZ1bmN0aW9uKHZhbHVlKSB7IHJldHVybiB2YWx1ZTsgfTtcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMTEpO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDk3NjUxYTk0OGU0NmY1ZDdlNDI3IiwibW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuYXNzaWduICE9IG51bGwgPyBPYmplY3QuYXNzaWduLmJpbmQoIE9iamVjdCApIDogZnVuY3Rpb24oIHRndCwgLi4uc3JjcyApe1xuICBzcmNzLmZvckVhY2goIHNyYyA9PiB7XG4gICAgT2JqZWN0LmtleXMoIHNyYyApLmZvckVhY2goIGsgPT4gdGd0W2tdID0gc3JjW2tdICk7XG4gIH0gKTtcblxuICByZXR1cm4gdGd0O1xufTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9hc3NpZ24uanMiLCJjb25zdCBhc3NpZ24gPSByZXF1aXJlKCcuLi9hc3NpZ24nKTtcblxuY29uc3QgZGVmYXVsdHMgPSBPYmplY3QuZnJlZXplKHtcbiAgc291cmNlOiBudWxsLFxuICB0YXJnZXQ6IG51bGwsXG4gIGxlbmd0aDogODAsXG4gIGNvZWZmOiAwLjAwMDIsXG4gIHdlaWdodDogMVxufSk7XG5cbmZ1bmN0aW9uIG1ha2VTcHJpbmcoIHNwcmluZyApe1xuICByZXR1cm4gYXNzaWduKCB7fSwgZGVmYXVsdHMsIHNwcmluZyApO1xufVxuXG5mdW5jdGlvbiBhcHBseVNwcmluZyggc3ByaW5nICl7XG4gIGxldCBib2R5MSA9IHNwcmluZy5zb3VyY2UsXG4gICAgICBib2R5MiA9IHNwcmluZy50YXJnZXQsXG4gICAgICBsZW5ndGggPSBzcHJpbmcubGVuZ3RoIDwgMCA/IGRlZmF1bHRzLmxlbmd0aCA6IHNwcmluZy5sZW5ndGgsXG4gICAgICBkeCA9IGJvZHkyLnBvcy54IC0gYm9keTEucG9zLngsXG4gICAgICBkeSA9IGJvZHkyLnBvcy55IC0gYm9keTEucG9zLnksXG4gICAgICByID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblxuICBpZiAociA9PT0gMCkge1xuICAgICAgZHggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgLyA1MDtcbiAgICAgIGR5ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpIC8gNTA7XG4gICAgICByID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgfVxuXG4gIGxldCBkID0gciAtIGxlbmd0aDtcbiAgbGV0IGNvZWZmID0gKCghc3ByaW5nLmNvZWZmIHx8IHNwcmluZy5jb2VmZiA8IDApID8gZGVmYXVsdHMuc3ByaW5nQ29lZmYgOiBzcHJpbmcuY29lZmYpICogZCAvIHIgKiBzcHJpbmcud2VpZ2h0O1xuXG4gIGJvZHkxLmZvcmNlLnggKz0gY29lZmYgKiBkeDtcbiAgYm9keTEuZm9yY2UueSArPSBjb2VmZiAqIGR5O1xuXG4gIGJvZHkyLmZvcmNlLnggLT0gY29lZmYgKiBkeDtcbiAgYm9keTIuZm9yY2UueSAtPSBjb2VmZiAqIGR5O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWFrZVNwcmluZywgYXBwbHlTcHJpbmcgfTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ldWxlci9zcHJpbmcuanMiLCIvKipcblRoZSBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgRXVsZXIgbGF5b3V0IGFsZ29yaXRobVxuKi9cblxuY29uc3QgTGF5b3V0ID0gcmVxdWlyZSgnLi4vbGF5b3V0Jyk7XG5jb25zdCBhc3NpZ24gPSByZXF1aXJlKCcuLi9hc3NpZ24nKTtcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuY29uc3QgeyB0aWNrIH0gPSByZXF1aXJlKCcuL3RpY2snKTtcbmNvbnN0IHsgbWFrZVF1YWR0cmVlIH0gPSByZXF1aXJlKCcuL3F1YWR0cmVlJyk7XG5jb25zdCB7IG1ha2VCb2R5IH0gPSByZXF1aXJlKCcuL2JvZHknKTtcbmNvbnN0IHsgbWFrZVNwcmluZyB9ID0gcmVxdWlyZSgnLi9zcHJpbmcnKTtcbmNvbnN0IGlzRm4gPSBmbiA9PiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbic7XG5jb25zdCBpc1BhcmVudCA9IG4gPT4gbi5pc1BhcmVudCgpO1xuY29uc3Qgbm90SXNQYXJlbnQgPSBuID0+ICFpc1BhcmVudChuKTtcbmNvbnN0IGlzTG9ja2VkID0gbiA9PiBuLmxvY2tlZCgpO1xuY29uc3Qgbm90SXNMb2NrZWQgPSBuID0+ICFpc0xvY2tlZChuKTtcbmNvbnN0IGlzUGFyZW50RWRnZSA9IGUgPT4gaXNQYXJlbnQoIGUuc291cmNlKCkgKSB8fCBpc1BhcmVudCggZS50YXJnZXQoKSApO1xuY29uc3Qgbm90SXNQYXJlbnRFZGdlID0gZSA9PiAhaXNQYXJlbnRFZGdlKGUpO1xuY29uc3QgZ2V0Qm9keSA9IG4gPT4gbi5zY3JhdGNoKCdldWxlcicpLmJvZHk7XG5jb25zdCBnZXROb25QYXJlbnREZXNjZW5kYW50cyA9IG4gPT4gaXNQYXJlbnQobikgPyBuLmRlc2NlbmRhbnRzKCkuZmlsdGVyKCBub3RJc1BhcmVudCApIDogbjtcblxuY29uc3QgZ2V0U2NyYXRjaCA9IGVsID0+IHtcbiAgbGV0IHNjcmF0Y2ggPSBlbC5zY3JhdGNoKCdldWxlcicpO1xuXG4gIGlmKCAhc2NyYXRjaCApe1xuICAgIHNjcmF0Y2ggPSB7fTtcblxuICAgIGVsLnNjcmF0Y2goJ2V1bGVyJywgc2NyYXRjaCk7XG4gIH1cblxuICByZXR1cm4gc2NyYXRjaDtcbn07XG5cbmNvbnN0IG9wdEZuID0gKCBvcHQsIGVsZSApID0+IHtcbiAgaWYoIGlzRm4oIG9wdCApICl7XG4gICAgcmV0dXJuIG9wdCggZWxlICk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9wdDtcbiAgfVxufTtcblxuY2xhc3MgRXVsZXIgZXh0ZW5kcyBMYXlvdXQge1xuICBjb25zdHJ1Y3Rvciggb3B0aW9ucyApe1xuICAgIHN1cGVyKCBhc3NpZ24oIHt9LCBkZWZhdWx0cywgb3B0aW9ucyApICk7XG4gIH1cblxuICBwcmVydW4oIHN0YXRlICl7XG4gICAgbGV0IHMgPSBzdGF0ZTtcblxuICAgIHMucXVhZHRyZWUgPSBtYWtlUXVhZHRyZWUoKTtcblxuICAgIGxldCBib2RpZXMgPSBzLmJvZGllcyA9IFtdO1xuXG4gICAgLy8gcmVndWxhciBub2Rlc1xuICAgIHMubm9kZXMuZmlsdGVyKCBuID0+IG5vdElzUGFyZW50KG4pICkuZm9yRWFjaCggbiA9PiB7XG4gICAgICBsZXQgc2NyYXRjaCA9IGdldFNjcmF0Y2goIG4gKTtcblxuICAgICAgbGV0IGJvZHkgPSBtYWtlQm9keSh7XG4gICAgICAgIHBvczogeyB4OiBzY3JhdGNoLngsIHk6IHNjcmF0Y2gueSB9LFxuICAgICAgICBtYXNzOiBvcHRGbiggcy5tYXNzLCBuICksXG4gICAgICAgIGxvY2tlZDogc2NyYXRjaC5sb2NrZWRcbiAgICAgIH0pO1xuXG4gICAgICBib2R5Ll9jeU5vZGUgPSBuO1xuXG4gICAgICBzY3JhdGNoLmJvZHkgPSBib2R5O1xuXG4gICAgICBib2R5Ll9zY3JhdGNoID0gc2NyYXRjaDtcblxuICAgICAgYm9kaWVzLnB1c2goIGJvZHkgKTtcbiAgICB9ICk7XG5cbiAgICBsZXQgc3ByaW5ncyA9IHMuc3ByaW5ncyA9IFtdO1xuXG4gICAgLy8gcmVndWxhciBlZGdlIHNwcmluZ3NcbiAgICBzLmVkZ2VzLmZpbHRlciggbm90SXNQYXJlbnRFZGdlICkuZm9yRWFjaCggZSA9PiB7XG4gICAgICBsZXQgc3ByaW5nID0gbWFrZVNwcmluZyh7XG4gICAgICAgIHNvdXJjZTogZ2V0Qm9keSggZS5zb3VyY2UoKSApLFxuICAgICAgICB0YXJnZXQ6IGdldEJvZHkoIGUudGFyZ2V0KCkgKSxcbiAgICAgICAgbGVuZ3RoOiBvcHRGbiggcy5zcHJpbmdMZW5ndGgsIGUgKSxcbiAgICAgICAgY29lZmY6IG9wdEZuKCBzLnNwcmluZ0NvZWZmLCBlIClcbiAgICAgIH0pO1xuXG4gICAgICBzcHJpbmcuX2N5RWRnZSA9IGU7XG5cbiAgICAgIGxldCBzY3JhdGNoID0gZ2V0U2NyYXRjaCggZSApO1xuXG4gICAgICBzcHJpbmcuX3NjcmF0Y2ggPSBzY3JhdGNoO1xuXG4gICAgICBzY3JhdGNoLnNwcmluZyA9IHNwcmluZztcblxuICAgICAgc3ByaW5ncy5wdXNoKCBzcHJpbmcgKTtcbiAgICB9ICk7XG5cbiAgICAvLyBjb21wb3VuZCBlZGdlIHNwcmluZ3NcbiAgICBzLmVkZ2VzLmZpbHRlciggaXNQYXJlbnRFZGdlICkuZm9yRWFjaCggZSA9PiB7XG4gICAgICBsZXQgc291cmNlcyA9IGdldE5vblBhcmVudERlc2NlbmRhbnRzKCBlLnNvdXJjZSgpICk7XG4gICAgICBsZXQgdGFyZ2V0cyA9IGdldE5vblBhcmVudERlc2NlbmRhbnRzKCBlLnRhcmdldCgpICk7XG5cbiAgICAgIC8vIGp1c3QgYWRkIG9uZSBzcHJpbmcgZm9yIHBlcmZcbiAgICAgIHNvdXJjZXMgPSBbIHNvdXJjZXNbMF0gXTtcbiAgICAgIHRhcmdldHMgPSBbIHRhcmdldHNbMF0gXTtcblxuICAgICAgc291cmNlcy5mb3JFYWNoKCBzcmMgPT4ge1xuICAgICAgICB0YXJnZXRzLmZvckVhY2goIHRndCA9PiB7XG4gICAgICAgICAgc3ByaW5ncy5wdXNoKCBtYWtlU3ByaW5nKHtcbiAgICAgICAgICAgIHNvdXJjZTogZ2V0Qm9keSggc3JjICksXG4gICAgICAgICAgICB0YXJnZXQ6IGdldEJvZHkoIHRndCApLFxuICAgICAgICAgICAgbGVuZ3RoOiBvcHRGbiggcy5zcHJpbmdMZW5ndGgsIGUgKSxcbiAgICAgICAgICAgIGNvZWZmOiBvcHRGbiggcy5zcHJpbmdDb2VmZiwgZSApXG4gICAgICAgICAgfSkgKTtcbiAgICAgICAgfSApO1xuICAgICAgfSApO1xuICAgIH0gKTtcbiAgfVxuXG4gIHRpY2soIHN0YXRlICl7XG4gICAgbGV0IG1vdmVtZW50ID0gdGljayggc3RhdGUgKTtcblxuICAgIGxldCBpc0RvbmUgPSBtb3ZlbWVudCA8PSBzdGF0ZS5tb3ZlbWVudFRocmVzaG9sZDtcblxuICAgIHJldHVybiBpc0RvbmU7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFdWxlcjtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ldWxlci9pbmRleC5qcyIsImNvbnN0IGRlZmF1bHRzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIHBvczogeyB4OiAwLCB5OiAwIH0sXG4gIHByZXZQb3M6IHsgeDogMCwgeTogMCB9LFxuICBmb3JjZTogeyB4OiAwLCB5OiAwIH0sXG4gIHZlbG9jaXR5OiB7IHg6IDAsIHk6IDAgfSxcbiAgbWFzczogMVxufSk7XG5cbmNvbnN0IGNvcHlWZWMgPSB2ID0+ICh7IHg6IHYueCwgeTogdi55IH0pO1xuY29uc3QgZ2V0VmFsdWUgPSAoIHZhbCwgZGVmICkgPT4gdmFsICE9IG51bGwgPyB2YWwgOiBkZWY7XG5jb25zdCBnZXRWZWMgPSAoIHZlYywgZGVmICkgPT4gY29weVZlYyggZ2V0VmFsdWUoIHZlYywgZGVmICkgKTtcblxuZnVuY3Rpb24gbWFrZUJvZHkoIG9wdHMgKXtcbiAgbGV0IGIgPSB7fTtcblxuICBiLnBvcyA9IGdldFZlYyggb3B0cy5wb3MsIGRlZmF1bHRzLnBvcyApO1xuICBiLnByZXZQb3MgPSBnZXRWZWMoIG9wdHMucHJldlBvcywgYi5wb3MgKTtcbiAgYi5mb3JjZSA9IGdldFZlYyggb3B0cy5mb3JjZSwgZGVmYXVsdHMuZm9yY2UgKTtcbiAgYi52ZWxvY2l0eSA9IGdldFZlYyggb3B0cy52ZWxvY2l0eSwgZGVmYXVsdHMudmVsb2NpdHkgKTtcbiAgYi5tYXNzID0gb3B0cy5tYXNzICE9IG51bGwgPyBvcHRzLm1hc3MgOiBkZWZhdWx0cy5tYXNzO1xuICBiLmxvY2tlZCA9IG9wdHMubG9ja2VkO1xuXG4gIHJldHVybiBiO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgbWFrZUJvZHkgfTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ldWxlci9ib2R5LmpzIiwiY29uc3QgZGVmYXVsdHMgPSBPYmplY3QuZnJlZXplKHtcbiAgLy8gVGhlIGlkZWFsIGxlZ3RoIG9mIGEgc3ByaW5nXG4gIC8vIC0gVGhpcyBhY3RzIGFzIGEgaGludCBmb3IgdGhlIGVkZ2UgbGVuZ3RoXG4gIC8vIC0gVGhlIGVkZ2UgbGVuZ3RoIGNhbiBiZSBsb25nZXIgb3Igc2hvcnRlciBpZiB0aGUgZm9yY2VzIGFyZSBzZXQgdG8gZXh0cmVtZSB2YWx1ZXNcbiAgc3ByaW5nTGVuZ3RoOiBlZGdlID0+IDgwLFxuXG4gIC8vIEhvb2tlJ3MgbGF3IGNvZWZmaWNpZW50XG4gIC8vIC0gVGhlIHZhbHVlIHJhbmdlcyBvbiBbMCwgMV1cbiAgLy8gLSBMb3dlciB2YWx1ZXMgZ2l2ZSBsb29zZXIgc3ByaW5nc1xuICAvLyAtIEhpZ2hlciB2YWx1ZXMgZ2l2ZSB0aWdodGVyIHNwcmluZ3NcbiAgc3ByaW5nQ29lZmY6IGVkZ2UgPT4gMC4wMDA4LFxuXG4gIC8vIFRoZSBtYXNzIG9mIHRoZSBub2RlIGluIHRoZSBwaHlzaWNzIHNpbXVsYXRpb25cbiAgLy8gLSBUaGUgbWFzcyBhZmZlY3RzIHRoZSBncmF2aXR5IG5vZGUgcmVwdWxzaW9uL2F0dHJhY3Rpb25cbiAgbWFzczogbm9kZSA9PiA0LFxuXG4gIC8vIENvdWxvbWIncyBsYXcgY29lZmZpY2llbnRcbiAgLy8gLSBNYWtlcyB0aGUgbm9kZXMgcmVwZWwgZWFjaCBvdGhlciBmb3IgbmVnYXRpdmUgdmFsdWVzXG4gIC8vIC0gTWFrZXMgdGhlIG5vZGVzIGF0dHJhY3QgZWFjaCBvdGhlciBmb3IgcG9zaXRpdmUgdmFsdWVzXG4gIGdyYXZpdHk6IC0xLjIsXG5cbiAgLy8gQSBmb3JjZSB0aGF0IHB1bGxzIG5vZGVzIHRvd2FyZHMgdGhlIG9yaWdpbiAoMCwgMClcbiAgLy8gSGlnaGVyIHZhbHVlcyBrZWVwIHRoZSBjb21wb25lbnRzIGxlc3Mgc3ByZWFkIG91dFxuICBwdWxsOiAwLjAwMSxcblxuICAvLyBUaGV0YSBjb2VmZmljaWVudCBmcm9tIEJhcm5lcy1IdXQgc2ltdWxhdGlvblxuICAvLyAtIFZhbHVlIHJhbmdlcyBvbiBbMCwgMV1cbiAgLy8gLSBQZXJmb3JtYW5jZSBpcyBiZXR0ZXIgd2l0aCBzbWFsbGVyIHZhbHVlc1xuICAvLyAtIFZlcnkgc21hbGwgdmFsdWVzIG1heSBub3QgY3JlYXRlIGVub3VnaCBmb3JjZSB0byBnaXZlIGEgZ29vZCByZXN1bHRcbiAgdGhldGE6IDAuNjY2LFxuXG4gIC8vIEZyaWN0aW9uIC8gZHJhZyBjb2VmZmljaWVudCB0byBtYWtlIHRoZSBzeXN0ZW0gc3RhYmlsaXNlIG92ZXIgdGltZVxuICBkcmFnQ29lZmY6IDAuMDIsXG5cbiAgLy8gV2hlbiB0aGUgdG90YWwgb2YgdGhlIHNxdWFyZWQgcG9zaXRpb24gZGVsdGFzIGlzIGxlc3MgdGhhbiB0aGlzIHZhbHVlLCB0aGUgc2ltdWxhdGlvbiBlbmRzXG4gIG1vdmVtZW50VGhyZXNob2xkOiAxLFxuXG4gIC8vIFRoZSBhbW91bnQgb2YgdGltZSBwYXNzZWQgcGVyIHRpY2tcbiAgLy8gLSBMYXJnZXIgdmFsdWVzIHJlc3VsdCBpbiBmYXN0ZXIgcnVudGltZXMgYnV0IG1pZ2h0IHNwcmVhZCB0aGluZ3Mgb3V0IHRvbyBmYXJcbiAgLy8gLSBTbWFsbGVyIHZhbHVlcyBwcm9kdWNlIG1vcmUgYWNjdXJhdGUgcmVzdWx0c1xuICB0aW1lU3RlcDogMjBcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRlZmF1bHRzO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2V1bGVyL2RlZmF1bHRzLmpzIiwiY29uc3QgZGVmYXVsdENvZWZmID0gMC4wMjtcblxuZnVuY3Rpb24gYXBwbHlEcmFnKCBib2R5LCBtYW51YWxEcmFnQ29lZmYgKXtcbiAgbGV0IGRyYWdDb2VmZjtcblxuICBpZiggbWFudWFsRHJhZ0NvZWZmICE9IG51bGwgKXtcbiAgICBkcmFnQ29lZmYgPSBtYW51YWxEcmFnQ29lZmY7XG4gIH0gZWxzZSBpZiggYm9keS5kcmFnQ29lZmYgIT0gbnVsbCApe1xuICAgIGRyYWdDb2VmZiA9IGJvZHkuZHJhZ0NvZWZmO1xuICB9IGVsc2Uge1xuICAgIGRyYWdDb2VmZiA9IGRlZmF1bHRDb2VmZjtcbiAgfVxuXG4gIGJvZHkuZm9yY2UueCAtPSBkcmFnQ29lZmYgKiBib2R5LnZlbG9jaXR5Lng7XG4gIGJvZHkuZm9yY2UueSAtPSBkcmFnQ29lZmYgKiBib2R5LnZlbG9jaXR5Lnk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBhcHBseURyYWcgfTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ldWxlci9kcmFnLmpzIiwiLy8gdXNlIGV1bGVyIG1ldGhvZCBmb3IgZm9yY2UgaW50ZWdyYXRpb24gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9FdWxlcl9tZXRob2Rcbi8vIHJldHVybiBzdW0gb2Ygc3F1YXJlZCBwb3NpdGlvbiBkZWx0YXNcbmZ1bmN0aW9uIGludGVncmF0ZSggYm9kaWVzLCB0aW1lU3RlcCApe1xuICB2YXIgZHggPSAwLCB0eCA9IDAsXG4gICAgICBkeSA9IDAsIHR5ID0gMCxcbiAgICAgIGksXG4gICAgICBtYXggPSBib2RpZXMubGVuZ3RoO1xuXG4gIGlmIChtYXggPT09IDApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGZvciAoaSA9IDA7IGkgPCBtYXg7ICsraSkge1xuICAgIHZhciBib2R5ID0gYm9kaWVzW2ldLFxuICAgICAgICBjb2VmZiA9IHRpbWVTdGVwIC8gYm9keS5tYXNzO1xuXG4gICAgaWYoIGJvZHkuZ3JhYmJlZCApeyBjb250aW51ZTsgfVxuXG4gICAgaWYoIGJvZHkubG9ja2VkICl7XG4gICAgICBib2R5LnZlbG9jaXR5LnggPSAwO1xuICAgICAgYm9keS52ZWxvY2l0eS55ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgYm9keS52ZWxvY2l0eS54ICs9IGNvZWZmICogYm9keS5mb3JjZS54O1xuICAgICAgYm9keS52ZWxvY2l0eS55ICs9IGNvZWZmICogYm9keS5mb3JjZS55O1xuICAgIH1cblxuICAgIHZhciB2eCA9IGJvZHkudmVsb2NpdHkueCxcbiAgICAgICAgdnkgPSBib2R5LnZlbG9jaXR5LnksXG4gICAgICAgIHYgPSBNYXRoLnNxcnQodnggKiB2eCArIHZ5ICogdnkpO1xuXG4gICAgaWYgKHYgPiAxKSB7XG4gICAgICBib2R5LnZlbG9jaXR5LnggPSB2eCAvIHY7XG4gICAgICBib2R5LnZlbG9jaXR5LnkgPSB2eSAvIHY7XG4gICAgfVxuXG4gICAgZHggPSB0aW1lU3RlcCAqIGJvZHkudmVsb2NpdHkueDtcbiAgICBkeSA9IHRpbWVTdGVwICogYm9keS52ZWxvY2l0eS55O1xuXG4gICAgYm9keS5wb3MueCArPSBkeDtcbiAgICBib2R5LnBvcy55ICs9IGR5O1xuXG4gICAgdHggKz0gTWF0aC5hYnMoZHgpOyB0eSArPSBNYXRoLmFicyhkeSk7XG4gIH1cblxuICByZXR1cm4gKHR4ICogdHggKyB0eSAqIHR5KS9tYXg7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBpbnRlZ3JhdGUgfTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ldWxlci9pbnRlZ3JhdGUuanMiLCIvLyBpbXBsIG9mIGJhcm5lcyBodXRcbi8vIGh0dHA6Ly93d3cuZWVjcy5iZXJrZWxleS5lZHUvfmRlbW1lbC9jczI2Ny9sZWN0dXJlMjYvbGVjdHVyZTI2Lmh0bWxcbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvQmFybmVzJUUyJTgwJTkzSHV0X3NpbXVsYXRpb25cblxuY29uc3QgTm9kZSA9IHJlcXVpcmUoJy4vbm9kZScpO1xuY29uc3QgSW5zZXJ0U3RhY2sgPSByZXF1aXJlKCcuL2luc2VydFN0YWNrJyk7XG5cbmNvbnN0IHJlc2V0VmVjID0gdiA9PiB7IHYueCA9IDA7IHYueSA9IDA7IH07XG5cbmNvbnN0IGlzU2FtZVBvc2l0aW9uID0gKHAxLCBwMikgPT4ge1xuICBsZXQgdGhyZXNob2xkID0gMWUtODtcbiAgbGV0IGR4ID0gTWF0aC5hYnMocDEueCAtIHAyLngpO1xuICBsZXQgZHkgPSBNYXRoLmFicyhwMS55IC0gcDIueSk7XG5cbiAgcmV0dXJuIGR4IDwgdGhyZXNob2xkICYmIGR5IDwgdGhyZXNob2xkO1xufTtcblxuZnVuY3Rpb24gbWFrZVF1YWR0cmVlKCl7XG4gIGxldCB1cGRhdGVRdWV1ZSA9IFtdLFxuICAgIGluc2VydFN0YWNrID0gbmV3IEluc2VydFN0YWNrKCksXG4gICAgbm9kZXNDYWNoZSA9IFtdLFxuICAgIGN1cnJlbnRJbkNhY2hlID0gMCxcbiAgICByb290ID0gbmV3Tm9kZSgpO1xuXG4gIGZ1bmN0aW9uIG5ld05vZGUoKSB7XG4gICAgLy8gVG8gYXZvaWQgcHJlc3N1cmUgb24gR0Mgd2UgcmV1c2Ugbm9kZXMuXG4gICAgbGV0IG5vZGUgPSBub2Rlc0NhY2hlW2N1cnJlbnRJbkNhY2hlXTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgbm9kZS5xdWFkMCA9IG51bGw7XG4gICAgICBub2RlLnF1YWQxID0gbnVsbDtcbiAgICAgIG5vZGUucXVhZDIgPSBudWxsO1xuICAgICAgbm9kZS5xdWFkMyA9IG51bGw7XG4gICAgICBub2RlLmJvZHkgPSBudWxsO1xuICAgICAgbm9kZS5tYXNzID0gbm9kZS5tYXNzWCA9IG5vZGUubWFzc1kgPSAwO1xuICAgICAgbm9kZS5sZWZ0ID0gbm9kZS5yaWdodCA9IG5vZGUudG9wID0gbm9kZS5ib3R0b20gPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBub2RlID0gbmV3IE5vZGUoKTtcbiAgICAgIG5vZGVzQ2FjaGVbY3VycmVudEluQ2FjaGVdID0gbm9kZTtcbiAgICB9XG5cbiAgICArK2N1cnJlbnRJbkNhY2hlO1xuICAgIHJldHVybiBub2RlO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlKCBzb3VyY2VCb2R5LCBncmF2aXR5LCB0aGV0YSwgcHVsbCApIHtcbiAgICBsZXQgcXVldWUgPSB1cGRhdGVRdWV1ZSxcbiAgICAgIHYsXG4gICAgICBkeCxcbiAgICAgIGR5LFxuICAgICAgciwgZnggPSAwLFxuICAgICAgZnkgPSAwLFxuICAgICAgcXVldWVMZW5ndGggPSAxLFxuICAgICAgc2hpZnRJZHggPSAwLFxuICAgICAgcHVzaElkeCA9IDE7XG5cbiAgICBxdWV1ZVswXSA9IHJvb3Q7XG5cbiAgICByZXNldFZlYyggc291cmNlQm9keS5mb3JjZSApO1xuXG4gICAgbGV0IHB4ID0gLXNvdXJjZUJvZHkucG9zLng7XG4gICAgbGV0IHB5ID0gLXNvdXJjZUJvZHkucG9zLnk7XG4gICAgbGV0IHByID0gTWF0aC5zcXJ0KHB4ICogcHggKyBweSAqIHB5KTtcbiAgICBsZXQgcHYgPSBzb3VyY2VCb2R5Lm1hc3MgKiBwdWxsIC8gcHI7XG5cbiAgICBmeCArPSBwdiAqIHB4O1xuICAgIGZ5ICs9IHB2ICogcHk7XG5cbiAgICB3aGlsZSAocXVldWVMZW5ndGgpIHtcbiAgICAgIGxldCBub2RlID0gcXVldWVbc2hpZnRJZHhdLFxuICAgICAgICBib2R5ID0gbm9kZS5ib2R5O1xuXG4gICAgICBxdWV1ZUxlbmd0aCAtPSAxO1xuICAgICAgc2hpZnRJZHggKz0gMTtcbiAgICAgIGxldCBkaWZmZXJlbnRCb2R5ID0gKGJvZHkgIT09IHNvdXJjZUJvZHkpO1xuICAgICAgaWYgKGJvZHkgJiYgZGlmZmVyZW50Qm9keSkge1xuICAgICAgICAvLyBJZiB0aGUgY3VycmVudCBub2RlIGlzIGEgbGVhZiBub2RlIChhbmQgaXQgaXMgbm90IHNvdXJjZSBib2R5KSxcbiAgICAgICAgLy8gY2FsY3VsYXRlIHRoZSBmb3JjZSBleGVydGVkIGJ5IHRoZSBjdXJyZW50IG5vZGUgb24gYm9keSwgYW5kIGFkZCB0aGlzXG4gICAgICAgIC8vIGFtb3VudCB0byBib2R5J3MgbmV0IGZvcmNlLlxuICAgICAgICBkeCA9IGJvZHkucG9zLnggLSBzb3VyY2VCb2R5LnBvcy54O1xuICAgICAgICBkeSA9IGJvZHkucG9zLnkgLSBzb3VyY2VCb2R5LnBvcy55O1xuICAgICAgICByID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblxuICAgICAgICBpZiAociA9PT0gMCkge1xuICAgICAgICAgIC8vIFBvb3IgbWFuJ3MgcHJvdGVjdGlvbiBhZ2FpbnN0IHplcm8gZGlzdGFuY2UuXG4gICAgICAgICAgZHggPSAoTWF0aC5yYW5kb20oKSAtIDAuNSkgLyA1MDtcbiAgICAgICAgICBkeSA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAvIDUwO1xuICAgICAgICAgIHIgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBpcyBzdGFuZGFyZCBncmF2aXRpb24gZm9yY2UgY2FsY3VsYXRpb24gYnV0IHdlIGRpdmlkZVxuICAgICAgICAvLyBieSByXjMgdG8gc2F2ZSB0d28gb3BlcmF0aW9ucyB3aGVuIG5vcm1hbGl6aW5nIGZvcmNlIHZlY3Rvci5cbiAgICAgICAgdiA9IGdyYXZpdHkgKiBib2R5Lm1hc3MgKiBzb3VyY2VCb2R5Lm1hc3MgLyAociAqIHIgKiByKTtcbiAgICAgICAgZnggKz0gdiAqIGR4O1xuICAgICAgICBmeSArPSB2ICogZHk7XG4gICAgICB9IGVsc2UgaWYgKGRpZmZlcmVudEJvZHkpIHtcbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBjYWxjdWxhdGUgdGhlIHJhdGlvIHMgLyByLCAgd2hlcmUgcyBpcyB0aGUgd2lkdGggb2YgdGhlIHJlZ2lvblxuICAgICAgICAvLyByZXByZXNlbnRlZCBieSB0aGUgaW50ZXJuYWwgbm9kZSwgYW5kIHIgaXMgdGhlIGRpc3RhbmNlIGJldHdlZW4gdGhlIGJvZHlcbiAgICAgICAgLy8gYW5kIHRoZSBub2RlJ3MgY2VudGVyLW9mLW1hc3NcbiAgICAgICAgZHggPSBub2RlLm1hc3NYIC8gbm9kZS5tYXNzIC0gc291cmNlQm9keS5wb3MueDtcbiAgICAgICAgZHkgPSBub2RlLm1hc3NZIC8gbm9kZS5tYXNzIC0gc291cmNlQm9keS5wb3MueTtcbiAgICAgICAgciA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cbiAgICAgICAgaWYgKHIgPT09IDApIHtcbiAgICAgICAgICAvLyBTb3JyeSBhYm91dCBjb2RlIGR1cGx1Y2F0aW9uLiBJIGRvbid0IHdhbnQgdG8gY3JlYXRlIG1hbnkgZnVuY3Rpb25zXG4gICAgICAgICAgLy8gcmlnaHQgYXdheS4gSnVzdCB3YW50IHRvIHNlZSBwZXJmb3JtYW5jZSBmaXJzdC5cbiAgICAgICAgICBkeCA9IChNYXRoLnJhbmRvbSgpIC0gMC41KSAvIDUwO1xuICAgICAgICAgIGR5ID0gKE1hdGgucmFuZG9tKCkgLSAwLjUpIC8gNTA7XG4gICAgICAgICAgciA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgcyAvIHIgPCDOuCwgdHJlYXQgdGhpcyBpbnRlcm5hbCBub2RlIGFzIGEgc2luZ2xlIGJvZHksIGFuZCBjYWxjdWxhdGUgdGhlXG4gICAgICAgIC8vIGZvcmNlIGl0IGV4ZXJ0cyBvbiBzb3VyY2VCb2R5LCBhbmQgYWRkIHRoaXMgYW1vdW50IHRvIHNvdXJjZUJvZHkncyBuZXQgZm9yY2UuXG4gICAgICAgIGlmICgobm9kZS5yaWdodCAtIG5vZGUubGVmdCkgLyByIDwgdGhldGEpIHtcbiAgICAgICAgICAvLyBpbiB0aGUgaWYgc3RhdGVtZW50IGFib3ZlIHdlIGNvbnNpZGVyIG5vZGUncyB3aWR0aCBvbmx5XG4gICAgICAgICAgLy8gYmVjYXVzZSB0aGUgcmVnaW9uIHdhcyBzcXVhcmlmaWVkIGR1cmluZyB0cmVlIGNyZWF0aW9uLlxuICAgICAgICAgIC8vIFRodXMgdGhlcmUgaXMgbm8gZGlmZmVyZW5jZSBiZXR3ZWVuIHVzaW5nIHdpZHRoIG9yIGhlaWdodC5cbiAgICAgICAgICB2ID0gZ3Jhdml0eSAqIG5vZGUubWFzcyAqIHNvdXJjZUJvZHkubWFzcyAvIChyICogciAqIHIpO1xuICAgICAgICAgIGZ4ICs9IHYgKiBkeDtcbiAgICAgICAgICBmeSArPSB2ICogZHk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlLCBydW4gdGhlIHByb2NlZHVyZSByZWN1cnNpdmVseSBvbiBlYWNoIG9mIHRoZSBjdXJyZW50IG5vZGUncyBjaGlsZHJlbi5cblxuICAgICAgICAgIC8vIEkgaW50ZW50aW9uYWxseSB1bmZvbGRlZCB0aGlzIGxvb3AsIHRvIHNhdmUgc2V2ZXJhbCBDUFUgY3ljbGVzLlxuICAgICAgICAgIGlmIChub2RlLnF1YWQwKSB7XG4gICAgICAgICAgICBxdWV1ZVtwdXNoSWR4XSA9IG5vZGUucXVhZDA7XG4gICAgICAgICAgICBxdWV1ZUxlbmd0aCArPSAxO1xuICAgICAgICAgICAgcHVzaElkeCArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAobm9kZS5xdWFkMSkge1xuICAgICAgICAgICAgcXVldWVbcHVzaElkeF0gPSBub2RlLnF1YWQxO1xuICAgICAgICAgICAgcXVldWVMZW5ndGggKz0gMTtcbiAgICAgICAgICAgIHB1c2hJZHggKz0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG5vZGUucXVhZDIpIHtcbiAgICAgICAgICAgIHF1ZXVlW3B1c2hJZHhdID0gbm9kZS5xdWFkMjtcbiAgICAgICAgICAgIHF1ZXVlTGVuZ3RoICs9IDE7XG4gICAgICAgICAgICBwdXNoSWR4ICs9IDE7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChub2RlLnF1YWQzKSB7XG4gICAgICAgICAgICBxdWV1ZVtwdXNoSWR4XSA9IG5vZGUucXVhZDM7XG4gICAgICAgICAgICBxdWV1ZUxlbmd0aCArPSAxO1xuICAgICAgICAgICAgcHVzaElkeCArPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNvdXJjZUJvZHkuZm9yY2UueCArPSBmeDtcbiAgICBzb3VyY2VCb2R5LmZvcmNlLnkgKz0gZnk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnNlcnRCb2RpZXMoYm9kaWVzKSB7XG4gICAgaWYoIGJvZGllcy5sZW5ndGggPT09IDAgKXsgcmV0dXJuOyB9XG5cbiAgICBsZXQgeDEgPSBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgeTEgPSBOdW1iZXIuTUFYX1ZBTFVFLFxuICAgICAgeDIgPSBOdW1iZXIuTUlOX1ZBTFVFLFxuICAgICAgeTIgPSBOdW1iZXIuTUlOX1ZBTFVFLFxuICAgICAgaSxcbiAgICAgIG1heCA9IGJvZGllcy5sZW5ndGg7XG5cbiAgICAvLyBUbyByZWR1Y2UgcXVhZCB0cmVlIGRlcHRoIHdlIGFyZSBsb29raW5nIGZvciBleGFjdCBib3VuZGluZyBib3ggb2YgYWxsIHBhcnRpY2xlcy5cbiAgICBpID0gbWF4O1xuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGxldCB4ID0gYm9kaWVzW2ldLnBvcy54O1xuICAgICAgbGV0IHkgPSBib2RpZXNbaV0ucG9zLnk7XG4gICAgICBpZiAoeCA8IHgxKSB7XG4gICAgICAgIHgxID0geDtcbiAgICAgIH1cbiAgICAgIGlmICh4ID4geDIpIHtcbiAgICAgICAgeDIgPSB4O1xuICAgICAgfVxuICAgICAgaWYgKHkgPCB5MSkge1xuICAgICAgICB5MSA9IHk7XG4gICAgICB9XG4gICAgICBpZiAoeSA+IHkyKSB7XG4gICAgICAgIHkyID0geTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBTcXVhcmlmeSB0aGUgYm91bmRzLlxuICAgIGxldCBkeCA9IHgyIC0geDEsXG4gICAgICBkeSA9IHkyIC0geTE7XG4gICAgaWYgKGR4ID4gZHkpIHtcbiAgICAgIHkyID0geTEgKyBkeDtcbiAgICB9IGVsc2Uge1xuICAgICAgeDIgPSB4MSArIGR5O1xuICAgIH1cblxuICAgIGN1cnJlbnRJbkNhY2hlID0gMDtcbiAgICByb290ID0gbmV3Tm9kZSgpO1xuICAgIHJvb3QubGVmdCA9IHgxO1xuICAgIHJvb3QucmlnaHQgPSB4MjtcbiAgICByb290LnRvcCA9IHkxO1xuICAgIHJvb3QuYm90dG9tID0geTI7XG5cbiAgICBpID0gbWF4IC0gMTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICByb290LmJvZHkgPSBib2RpZXNbaV07XG4gICAgfVxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIGluc2VydChib2RpZXNbaV0sIHJvb3QpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGluc2VydChuZXdCb2R5KSB7XG4gICAgaW5zZXJ0U3RhY2sucmVzZXQoKTtcbiAgICBpbnNlcnRTdGFjay5wdXNoKHJvb3QsIG5ld0JvZHkpO1xuXG4gICAgd2hpbGUgKCFpbnNlcnRTdGFjay5pc0VtcHR5KCkpIHtcbiAgICAgIGxldCBzdGFja0l0ZW0gPSBpbnNlcnRTdGFjay5wb3AoKSxcbiAgICAgICAgbm9kZSA9IHN0YWNrSXRlbS5ub2RlLFxuICAgICAgICBib2R5ID0gc3RhY2tJdGVtLmJvZHk7XG5cbiAgICAgIGlmICghbm9kZS5ib2R5KSB7XG4gICAgICAgIC8vIFRoaXMgaXMgaW50ZXJuYWwgbm9kZS4gVXBkYXRlIHRoZSB0b3RhbCBtYXNzIG9mIHRoZSBub2RlIGFuZCBjZW50ZXItb2YtbWFzcy5cbiAgICAgICAgbGV0IHggPSBib2R5LnBvcy54O1xuICAgICAgICBsZXQgeSA9IGJvZHkucG9zLnk7XG4gICAgICAgIG5vZGUubWFzcyA9IG5vZGUubWFzcyArIGJvZHkubWFzcztcbiAgICAgICAgbm9kZS5tYXNzWCA9IG5vZGUubWFzc1ggKyBib2R5Lm1hc3MgKiB4O1xuICAgICAgICBub2RlLm1hc3NZID0gbm9kZS5tYXNzWSArIGJvZHkubWFzcyAqIHk7XG5cbiAgICAgICAgLy8gUmVjdXJzaXZlbHkgaW5zZXJ0IHRoZSBib2R5IGluIHRoZSBhcHByb3ByaWF0ZSBxdWFkcmFudC5cbiAgICAgICAgLy8gQnV0IGZpcnN0IGZpbmQgdGhlIGFwcHJvcHJpYXRlIHF1YWRyYW50LlxuICAgICAgICBsZXQgcXVhZElkeCA9IDAsIC8vIEFzc3VtZSB3ZSBhcmUgaW4gdGhlIDAncyBxdWFkLlxuICAgICAgICAgIGxlZnQgPSBub2RlLmxlZnQsXG4gICAgICAgICAgcmlnaHQgPSAobm9kZS5yaWdodCArIGxlZnQpIC8gMixcbiAgICAgICAgICB0b3AgPSBub2RlLnRvcCxcbiAgICAgICAgICBib3R0b20gPSAobm9kZS5ib3R0b20gKyB0b3ApIC8gMjtcblxuICAgICAgICBpZiAoeCA+IHJpZ2h0KSB7IC8vIHNvbWV3aGVyZSBpbiB0aGUgZWFzdGVybiBwYXJ0LlxuICAgICAgICAgIHF1YWRJZHggPSBxdWFkSWR4ICsgMTtcbiAgICAgICAgICBsZWZ0ID0gcmlnaHQ7XG4gICAgICAgICAgcmlnaHQgPSBub2RlLnJpZ2h0O1xuICAgICAgICB9XG4gICAgICAgIGlmICh5ID4gYm90dG9tKSB7IC8vIGFuZCBpbiBzb3V0aC5cbiAgICAgICAgICBxdWFkSWR4ID0gcXVhZElkeCArIDI7XG4gICAgICAgICAgdG9wID0gYm90dG9tO1xuICAgICAgICAgIGJvdHRvbSA9IG5vZGUuYm90dG9tO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGNoaWxkID0gZ2V0Q2hpbGQobm9kZSwgcXVhZElkeCk7XG4gICAgICAgIGlmICghY2hpbGQpIHtcbiAgICAgICAgICAvLyBUaGUgbm9kZSBpcyBpbnRlcm5hbCBidXQgdGhpcyBxdWFkcmFudCBpcyBub3QgdGFrZW4uIEFkZFxuICAgICAgICAgIC8vIHN1Ym5vZGUgdG8gaXQuXG4gICAgICAgICAgY2hpbGQgPSBuZXdOb2RlKCk7XG4gICAgICAgICAgY2hpbGQubGVmdCA9IGxlZnQ7XG4gICAgICAgICAgY2hpbGQudG9wID0gdG9wO1xuICAgICAgICAgIGNoaWxkLnJpZ2h0ID0gcmlnaHQ7XG4gICAgICAgICAgY2hpbGQuYm90dG9tID0gYm90dG9tO1xuICAgICAgICAgIGNoaWxkLmJvZHkgPSBib2R5O1xuXG4gICAgICAgICAgc2V0Q2hpbGQobm9kZSwgcXVhZElkeCwgY2hpbGQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGNvbnRpbnVlIHNlYXJjaGluZyBpbiB0aGlzIHF1YWRyYW50LlxuICAgICAgICAgIGluc2VydFN0YWNrLnB1c2goY2hpbGQsIGJvZHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBXZSBhcmUgdHJ5aW5nIHRvIGFkZCB0byB0aGUgbGVhZiBub2RlLlxuICAgICAgICAvLyBXZSBoYXZlIHRvIGNvbnZlcnQgY3VycmVudCBsZWFmIGludG8gaW50ZXJuYWwgbm9kZVxuICAgICAgICAvLyBhbmQgY29udGludWUgYWRkaW5nIHR3byBub2Rlcy5cbiAgICAgICAgbGV0IG9sZEJvZHkgPSBub2RlLmJvZHk7XG4gICAgICAgIG5vZGUuYm9keSA9IG51bGw7IC8vIGludGVybmFsIG5vZGVzIGRvIG5vdCBjYXJ5IGJvZGllc1xuXG4gICAgICAgIGlmIChpc1NhbWVQb3NpdGlvbihvbGRCb2R5LnBvcywgYm9keS5wb3MpKSB7XG4gICAgICAgICAgLy8gUHJldmVudCBpbmZpbml0ZSBzdWJkaXZpc2lvbiBieSBidW1waW5nIG9uZSBub2RlXG4gICAgICAgICAgLy8gYW55d2hlcmUgaW4gdGhpcyBxdWFkcmFudFxuICAgICAgICAgIGxldCByZXRyaWVzQ291bnQgPSAzO1xuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxldCBvZmZzZXQgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgICAgbGV0IGR4ID0gKG5vZGUucmlnaHQgLSBub2RlLmxlZnQpICogb2Zmc2V0O1xuICAgICAgICAgICAgbGV0IGR5ID0gKG5vZGUuYm90dG9tIC0gbm9kZS50b3ApICogb2Zmc2V0O1xuXG4gICAgICAgICAgICBvbGRCb2R5LnBvcy54ID0gbm9kZS5sZWZ0ICsgZHg7XG4gICAgICAgICAgICBvbGRCb2R5LnBvcy55ID0gbm9kZS50b3AgKyBkeTtcbiAgICAgICAgICAgIHJldHJpZXNDb3VudCAtPSAxO1xuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGRvbid0IGJ1bXAgaXQgb3V0IG9mIHRoZSBib3guIElmIHdlIGRvLCBuZXh0IGl0ZXJhdGlvbiBzaG91bGQgZml4IGl0XG4gICAgICAgICAgfSB3aGlsZSAocmV0cmllc0NvdW50ID4gMCAmJiBpc1NhbWVQb3NpdGlvbihvbGRCb2R5LnBvcywgYm9keS5wb3MpKTtcblxuICAgICAgICAgIGlmIChyZXRyaWVzQ291bnQgPT09IDAgJiYgaXNTYW1lUG9zaXRpb24ob2xkQm9keS5wb3MsIGJvZHkucG9zKSkge1xuICAgICAgICAgICAgLy8gVGhpcyBpcyB2ZXJ5IGJhZCwgd2UgcmFuIG91dCBvZiBwcmVjaXNpb24uXG4gICAgICAgICAgICAvLyBpZiB3ZSBkbyBub3QgcmV0dXJuIGZyb20gdGhlIG1ldGhvZCB3ZSdsbCBnZXQgaW50b1xuICAgICAgICAgICAgLy8gaW5maW5pdGUgbG9vcCBoZXJlLiBTbyB3ZSBzYWNyaWZpY2UgY29ycmVjdG5lc3Mgb2YgbGF5b3V0LCBhbmQga2VlcCB0aGUgYXBwIHJ1bm5pbmdcbiAgICAgICAgICAgIC8vIE5leHQgbGF5b3V0IGl0ZXJhdGlvbiBzaG91bGQgZ2V0IGxhcmdlciBib3VuZGluZyBib3ggaW4gdGhlIGZpcnN0IHN0ZXAgYW5kIGZpeCB0aGlzXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIE5leHQgaXRlcmF0aW9uIHNob3VsZCBzdWJkaXZpZGUgbm9kZSBmdXJ0aGVyLlxuICAgICAgICBpbnNlcnRTdGFjay5wdXNoKG5vZGUsIG9sZEJvZHkpO1xuICAgICAgICBpbnNlcnRTdGFjay5wdXNoKG5vZGUsIGJvZHkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgaW5zZXJ0Qm9kaWVzOiBpbnNlcnRCb2RpZXMsXG4gICAgdXBkYXRlQm9keUZvcmNlOiB1cGRhdGVcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0Q2hpbGQobm9kZSwgaWR4KSB7XG4gIGlmIChpZHggPT09IDApIHJldHVybiBub2RlLnF1YWQwO1xuICBpZiAoaWR4ID09PSAxKSByZXR1cm4gbm9kZS5xdWFkMTtcbiAgaWYgKGlkeCA9PT0gMikgcmV0dXJuIG5vZGUucXVhZDI7XG4gIGlmIChpZHggPT09IDMpIHJldHVybiBub2RlLnF1YWQzO1xuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gc2V0Q2hpbGQobm9kZSwgaWR4LCBjaGlsZCkge1xuICBpZiAoaWR4ID09PSAwKSBub2RlLnF1YWQwID0gY2hpbGQ7XG4gIGVsc2UgaWYgKGlkeCA9PT0gMSkgbm9kZS5xdWFkMSA9IGNoaWxkO1xuICBlbHNlIGlmIChpZHggPT09IDIpIG5vZGUucXVhZDIgPSBjaGlsZDtcbiAgZWxzZSBpZiAoaWR4ID09PSAzKSBub2RlLnF1YWQzID0gY2hpbGQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBtYWtlUXVhZHRyZWUgfTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9ldWxlci9xdWFkdHJlZS9pbmRleC5qcyIsIm1vZHVsZS5leHBvcnRzID0gSW5zZXJ0U3RhY2s7XG5cbi8qKlxuICogT3VyIGltcGxtZW50YXRpb24gb2YgUXVhZFRyZWUgaXMgbm9uLXJlY3Vyc2l2ZSB0byBhdm9pZCBHQyBoaXRcbiAqIFRoaXMgZGF0YSBzdHJ1Y3R1cmUgcmVwcmVzZW50IHN0YWNrIG9mIGVsZW1lbnRzXG4gKiB3aGljaCB3ZSBhcmUgdHJ5aW5nIHRvIGluc2VydCBpbnRvIHF1YWQgdHJlZS5cbiAqL1xuZnVuY3Rpb24gSW5zZXJ0U3RhY2sgKCkge1xuICAgIHRoaXMuc3RhY2sgPSBbXTtcbiAgICB0aGlzLnBvcElkeCA9IDA7XG59XG5cbkluc2VydFN0YWNrLnByb3RvdHlwZSA9IHtcbiAgICBpc0VtcHR5OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucG9wSWR4ID09PSAwO1xuICAgIH0sXG4gICAgcHVzaDogZnVuY3Rpb24gKG5vZGUsIGJvZHkpIHtcbiAgICAgICAgbGV0IGl0ZW0gPSB0aGlzLnN0YWNrW3RoaXMucG9wSWR4XTtcbiAgICAgICAgaWYgKCFpdGVtKSB7XG4gICAgICAgICAgICAvLyB3ZSBhcmUgdHJ5aW5nIHRvIGF2b2lkIG1lbW9yeSBwcmVzc3VlOiBjcmVhdGUgbmV3IGVsZW1lbnRcbiAgICAgICAgICAgIC8vIG9ubHkgd2hlbiBhYnNvbHV0ZWx5IG5lY2Vzc2FyeVxuICAgICAgICAgICAgdGhpcy5zdGFja1t0aGlzLnBvcElkeF0gPSBuZXcgSW5zZXJ0U3RhY2tFbGVtZW50KG5vZGUsIGJvZHkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5ub2RlID0gbm9kZTtcbiAgICAgICAgICAgIGl0ZW0uYm9keSA9IGJvZHk7XG4gICAgICAgIH1cbiAgICAgICAgKyt0aGlzLnBvcElkeDtcbiAgICB9LFxuICAgIHBvcDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wb3BJZHggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGFja1stLXRoaXMucG9wSWR4XTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5wb3BJZHggPSAwO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIEluc2VydFN0YWNrRWxlbWVudChub2RlLCBib2R5KSB7XG4gICAgdGhpcy5ub2RlID0gbm9kZTsgLy8gUXVhZFRyZWUgbm9kZVxuICAgIHRoaXMuYm9keSA9IGJvZHk7IC8vIHBoeXNpY2FsIGJvZHkgd2hpY2ggbmVlZHMgdG8gYmUgaW5zZXJ0ZWQgdG8gbm9kZVxufVxuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2V1bGVyL3F1YWR0cmVlL2luc2VydFN0YWNrLmpzIiwiLyoqXG4gKiBJbnRlcm5hbCBkYXRhIHN0cnVjdHVyZSB0byByZXByZXNlbnQgMkQgUXVhZFRyZWUgbm9kZVxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIE5vZGUoKSB7XG4gIC8vIGJvZHkgc3RvcmVkIGluc2lkZSB0aGlzIG5vZGUuIEluIHF1YWQgdHJlZSBvbmx5IGxlYWYgbm9kZXMgKGJ5IGNvbnN0cnVjdGlvbilcbiAgLy8gY29udGFpbiBib2lkZXM6XG4gIHRoaXMuYm9keSA9IG51bGw7XG5cbiAgLy8gQ2hpbGQgbm9kZXMgYXJlIHN0b3JlZCBpbiBxdWFkcy4gRWFjaCBxdWFkIGlzIHByZXNlbnRlZCBieSBudW1iZXI6XG4gIC8vIDAgfCAxXG4gIC8vIC0tLS0tXG4gIC8vIDIgfCAzXG4gIHRoaXMucXVhZDAgPSBudWxsO1xuICB0aGlzLnF1YWQxID0gbnVsbDtcbiAgdGhpcy5xdWFkMiA9IG51bGw7XG4gIHRoaXMucXVhZDMgPSBudWxsO1xuXG4gIC8vIFRvdGFsIG1hc3Mgb2YgY3VycmVudCBub2RlXG4gIHRoaXMubWFzcyA9IDA7XG5cbiAgLy8gQ2VudGVyIG9mIG1hc3MgY29vcmRpbmF0ZXNcbiAgdGhpcy5tYXNzWCA9IDA7XG4gIHRoaXMubWFzc1kgPSAwO1xuXG4gIC8vIGJvdW5kaW5nIGJveCBjb29yZGluYXRlc1xuICB0aGlzLmxlZnQgPSAwO1xuICB0aGlzLnRvcCA9IDA7XG4gIHRoaXMuYm90dG9tID0gMDtcbiAgdGhpcy5yaWdodCA9IDA7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2V1bGVyL3F1YWR0cmVlL25vZGUuanMiLCJjb25zdCB7IGludGVncmF0ZSB9ID0gcmVxdWlyZSgnLi9pbnRlZ3JhdGUnKTtcbmNvbnN0IHsgYXBwbHlEcmFnIH0gPSByZXF1aXJlKCcuL2RyYWcnKTtcbmNvbnN0IHsgYXBwbHlTcHJpbmcgfSA9IHJlcXVpcmUoJy4vc3ByaW5nJyk7XG5cbmZ1bmN0aW9uIHRpY2soeyBib2RpZXMsIHNwcmluZ3MsIHF1YWR0cmVlLCB0aW1lU3RlcCwgZ3Jhdml0eSwgdGhldGEsIGRyYWdDb2VmZiwgcHVsbCB9KXtcbiAgLy8gdXBkYXRlIGJvZHkgZnJvbSBzY3JhdGNoIGluIGNhc2Ugb2YgYW55IGNoYW5nZXNcbiAgYm9kaWVzLmZvckVhY2goIGJvZHkgPT4ge1xuICAgIGxldCBwID0gYm9keS5fc2NyYXRjaDtcblxuICAgIGlmKCAhcCApeyByZXR1cm47IH1cblxuICAgIGJvZHkubG9ja2VkID0gcC5sb2NrZWQ7XG4gICAgYm9keS5ncmFiYmVkID0gcC5ncmFiYmVkO1xuICAgIGJvZHkucG9zLnggPSBwLng7XG4gICAgYm9keS5wb3MueSA9IHAueTtcbiAgfSApO1xuXG4gIHF1YWR0cmVlLmluc2VydEJvZGllcyggYm9kaWVzICk7XG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKysgKXtcbiAgICBsZXQgYm9keSA9IGJvZGllc1tpXTtcblxuICAgIHF1YWR0cmVlLnVwZGF0ZUJvZHlGb3JjZSggYm9keSwgZ3Jhdml0eSwgdGhldGEsIHB1bGwgKTtcbiAgICBhcHBseURyYWcoIGJvZHksIGRyYWdDb2VmZiApO1xuICB9XG5cbiAgZm9yKCBsZXQgaSA9IDA7IGkgPCBzcHJpbmdzLmxlbmd0aDsgaSsrICl7XG4gICAgbGV0IHNwcmluZyA9IHNwcmluZ3NbaV07XG5cbiAgICBhcHBseVNwcmluZyggc3ByaW5nICk7XG4gIH1cblxuICBsZXQgbW92ZW1lbnQgPSBpbnRlZ3JhdGUoIGJvZGllcywgdGltZVN0ZXAgKTtcblxuICAvLyB1cGRhdGUgc2NyYXRjaCBwb3NpdGlvbnMgZnJvbSBib2R5IHBvc2l0aW9uc1xuICBib2RpZXMuZm9yRWFjaCggYm9keSA9PiB7XG4gICAgbGV0IHAgPSBib2R5Ll9zY3JhdGNoO1xuXG4gICAgaWYoICFwICl7IHJldHVybjsgfVxuXG4gICAgcC54ID0gYm9keS5wb3MueDtcbiAgICBwLnkgPSBib2R5LnBvcy55O1xuICB9ICk7XG5cbiAgcmV0dXJuIG1vdmVtZW50O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgdGljayB9O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2V1bGVyL3RpY2suanMiLCJjb25zdCBFdWxlciA9IHJlcXVpcmUoJy4vZXVsZXInKTtcblxuLy8gcmVnaXN0ZXJzIHRoZSBleHRlbnNpb24gb24gYSBjeXRvc2NhcGUgbGliIHJlZlxubGV0IHJlZ2lzdGVyID0gZnVuY3Rpb24oIGN5dG9zY2FwZSApe1xuICBpZiggIWN5dG9zY2FwZSApeyByZXR1cm47IH0gLy8gY2FuJ3QgcmVnaXN0ZXIgaWYgY3l0b3NjYXBlIHVuc3BlY2lmaWVkXG5cbiAgY3l0b3NjYXBlKCAnbGF5b3V0JywgJ2V1bGVyJywgRXVsZXIgKTsgLy8gcmVnaXN0ZXIgd2l0aCBjeXRvc2NhcGUuanNcbn07XG5cbmlmKCB0eXBlb2YgY3l0b3NjYXBlICE9PSAndW5kZWZpbmVkJyApeyAvLyBleHBvc2UgdG8gZ2xvYmFsIGN5dG9zY2FwZSAoaS5lLiB3aW5kb3cuY3l0b3NjYXBlKVxuICByZWdpc3RlciggY3l0b3NjYXBlICk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcmVnaXN0ZXI7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXguanMiLCIvLyBnZW5lcmFsIGRlZmF1bHQgb3B0aW9ucyBmb3IgZm9yY2UtZGlyZWN0ZWQgbGF5b3V0XG5cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmZyZWV6ZSh7XG4gIGFuaW1hdGU6IHRydWUsIC8vIHdoZXRoZXIgdG8gc2hvdyB0aGUgbGF5b3V0IGFzIGl0J3MgcnVubmluZzsgc3BlY2lhbCAnZW5kJyB2YWx1ZSBtYWtlcyB0aGUgbGF5b3V0IGFuaW1hdGUgbGlrZSBhIGRpc2NyZXRlIGxheW91dFxuICByZWZyZXNoOiAxMCwgLy8gbnVtYmVyIG9mIHRpY2tzIHBlciBmcmFtZTsgaGlnaGVyIGlzIGZhc3RlciBidXQgbW9yZSBqZXJreVxuICBtYXhJdGVyYXRpb25zOiAxMDAwLCAvLyBtYXggaXRlcmF0aW9ucyBiZWZvcmUgdGhlIGxheW91dCB3aWxsIGJhaWwgb3V0XG4gIG1heFNpbXVsYXRpb25UaW1lOiA0MDAwLCAvLyBtYXggbGVuZ3RoIGluIG1zIHRvIHJ1biB0aGUgbGF5b3V0XG4gIHVuZ3JhYmlmeVdoaWxlU2ltdWxhdGluZzogZmFsc2UsIC8vIHNvIHlvdSBjYW4ndCBkcmFnIG5vZGVzIGR1cmluZyBsYXlvdXRcbiAgZml0OiB0cnVlLCAvLyBvbiBldmVyeSBsYXlvdXQgcmVwb3NpdGlvbiBvZiBub2RlcywgZml0IHRoZSB2aWV3cG9ydFxuICBwYWRkaW5nOiAzMCwgLy8gcGFkZGluZyBhcm91bmQgdGhlIHNpbXVsYXRpb25cbiAgYm91bmRpbmdCb3g6IHVuZGVmaW5lZCwgLy8gY29uc3RyYWluIGxheW91dCBib3VuZHM7IHsgeDEsIHkxLCB4MiwgeTIgfSBvciB7IHgxLCB5MSwgdywgaCB9XG5cbiAgLy8gbGF5b3V0IGV2ZW50IGNhbGxiYWNrc1xuICByZWFkeTogZnVuY3Rpb24oKXt9LCAvLyBvbiBsYXlvdXRyZWFkeVxuICBzdG9wOiBmdW5jdGlvbigpe30sIC8vIG9uIGxheW91dHN0b3BcblxuICAvLyBwb3NpdGlvbmluZyBvcHRpb25zXG4gIHJhbmRvbWl6ZTogZmFsc2UsIC8vIHVzZSByYW5kb20gbm9kZSBwb3NpdGlvbnMgYXQgYmVnaW5uaW5nIG9mIGxheW91dFxuICBcbiAgLy8gaW5maW5pdGUgbGF5b3V0IG9wdGlvbnNcbiAgaW5maW5pdGU6IGZhbHNlIC8vIG92ZXJyaWRlcyBhbGwgb3RoZXIgb3B0aW9ucyBmb3IgYSBmb3JjZXMtYWxsLXRoZS10aW1lIG1vZGVcbn0pO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2xheW91dC9kZWZhdWx0cy5qcyIsIi8qKlxuQSBnZW5lcmljIGNvbnRpbnVvdXMgbGF5b3V0IGNsYXNzXG4qL1xuXG5jb25zdCBhc3NpZ24gPSByZXF1aXJlKCcuLi9hc3NpZ24nKTtcbmNvbnN0IGRlZmF1bHRzID0gcmVxdWlyZSgnLi9kZWZhdWx0cycpO1xuY29uc3QgbWFrZUJvdW5kaW5nQm94ID0gcmVxdWlyZSgnLi9tYWtlLWJiJyk7XG5jb25zdCB7IHNldEluaXRpYWxQb3NpdGlvblN0YXRlLCByZWZyZXNoUG9zaXRpb25zLCBnZXROb2RlUG9zaXRpb25EYXRhIH0gPSByZXF1aXJlKCcuL3Bvc2l0aW9uJyk7XG5jb25zdCB7IG11bHRpdGljayB9ID0gcmVxdWlyZSgnLi90aWNrJyk7XG5cbmNsYXNzIExheW91dCB7XG4gIGNvbnN0cnVjdG9yKCBvcHRpb25zICl7XG4gICAgbGV0IG8gPSB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oIHt9LCBkZWZhdWx0cywgb3B0aW9ucyApO1xuXG4gICAgbGV0IHMgPSB0aGlzLnN0YXRlID0gYXNzaWduKCB7fSwgbywge1xuICAgICAgbGF5b3V0OiB0aGlzLFxuICAgICAgbm9kZXM6IG8uZWxlcy5ub2RlcygpLFxuICAgICAgZWRnZXM6IG8uZWxlcy5lZGdlcygpLFxuICAgICAgdGlja0luZGV4OiAwLFxuICAgICAgZmlyc3RVcGRhdGU6IHRydWVcbiAgICB9ICk7XG5cbiAgICBzLmFuaW1hdGVFbmQgPSBvLmFuaW1hdGUgJiYgby5hbmltYXRlID09PSAnZW5kJztcbiAgICBzLmFuaW1hdGVDb250aW51b3VzbHkgPSBvLmFuaW1hdGUgJiYgIXMuYW5pbWF0ZUVuZDtcbiAgfVxuXG4gIHJ1bigpe1xuICAgIGxldCBsID0gdGhpcztcbiAgICBsZXQgcyA9IHRoaXMuc3RhdGU7XG5cbiAgICBzLnRpY2tJbmRleCA9IDA7XG4gICAgcy5maXJzdFVwZGF0ZSA9IHRydWU7XG4gICAgcy5zdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHMucnVubmluZyA9IHRydWU7XG5cbiAgICBzLmN1cnJlbnRCb3VuZGluZ0JveCA9IG1ha2VCb3VuZGluZ0JveCggcy5ib3VuZGluZ0JveCwgcy5jeSApO1xuXG4gICAgaWYoIHMucmVhZHkgKXsgbC5vbmUoICdyZWFkeScsIHMucmVhZHkgKTsgfVxuICAgIGlmKCBzLnN0b3AgKXsgbC5vbmUoICdzdG9wJywgcy5zdG9wICk7IH1cblxuICAgIHMubm9kZXMuZm9yRWFjaCggbiA9PiBzZXRJbml0aWFsUG9zaXRpb25TdGF0ZSggbiwgcyApICk7XG5cbiAgICBsLnByZXJ1biggcyApO1xuXG4gICAgaWYoIHMuYW5pbWF0ZUNvbnRpbnVvdXNseSApe1xuICAgICAgbGV0IHVuZ3JhYmlmeSA9IG5vZGUgPT4ge1xuICAgICAgICBpZiggIXMudW5ncmFiaWZ5V2hpbGVTaW11bGF0aW5nICl7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBncmFiYmFibGUgPSBnZXROb2RlUG9zaXRpb25EYXRhKCBub2RlLCBzICkuZ3JhYmJhYmxlID0gbm9kZS5ncmFiYmFibGUoKTtcblxuICAgICAgICBpZiggZ3JhYmJhYmxlICl7XG4gICAgICAgICAgbm9kZS51bmdyYWJpZnkoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbGV0IHJlZ3JhYmlmeSA9IG5vZGUgPT4ge1xuICAgICAgICBpZiggIXMudW5ncmFiaWZ5V2hpbGVTaW11bGF0aW5nICl7IHJldHVybjsgfVxuXG4gICAgICAgIGxldCBncmFiYmFibGUgPSBnZXROb2RlUG9zaXRpb25EYXRhKCBub2RlLCBzICkuZ3JhYmJhYmxlO1xuXG4gICAgICAgIGlmKCBncmFiYmFibGUgKXtcbiAgICAgICAgICBub2RlLmdyYWJpZnkoKTtcbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgbGV0IHVwZGF0ZUdyYWJTdGF0ZSA9IG5vZGUgPT4gZ2V0Tm9kZVBvc2l0aW9uRGF0YSggbm9kZSwgcyApLmdyYWJiZWQgPSBub2RlLmdyYWJiZWQoKTtcblxuICAgICAgbGV0IG9uR3JhYiA9IGZ1bmN0aW9uKHsgdGFyZ2V0IH0pe1xuICAgICAgICB1cGRhdGVHcmFiU3RhdGUoIHRhcmdldCApO1xuICAgICAgfTtcblxuICAgICAgbGV0IG9uRnJlZSA9IG9uR3JhYjtcblxuICAgICAgbGV0IG9uRHJhZyA9IGZ1bmN0aW9uKHsgdGFyZ2V0IH0pe1xuICAgICAgICBsZXQgcCA9IGdldE5vZGVQb3NpdGlvbkRhdGEoIHRhcmdldCwgcyApO1xuICAgICAgICBsZXQgdHAgPSB0YXJnZXQucG9zaXRpb24oKTtcblxuICAgICAgICBwLnggPSB0cC54O1xuICAgICAgICBwLnkgPSB0cC55O1xuICAgICAgfTtcblxuICAgICAgbGV0IGxpc3RlblRvR3JhYiA9IG5vZGUgPT4ge1xuICAgICAgICBub2RlLm9uKCdncmFiJywgb25HcmFiKTtcbiAgICAgICAgbm9kZS5vbignZnJlZScsIG9uRnJlZSk7XG4gICAgICAgIG5vZGUub24oJ2RyYWcnLCBvbkRyYWcpO1xuICAgICAgfTtcblxuICAgICAgbGV0IHVubGlzdGVuVG9HcmFiID0gbm9kZSA9PiB7XG4gICAgICAgIG5vZGUucmVtb3ZlTGlzdGVuZXIoJ2dyYWInLCBvbkdyYWIpO1xuICAgICAgICBub2RlLnJlbW92ZUxpc3RlbmVyKCdmcmVlJywgb25GcmVlKTtcbiAgICAgICAgbm9kZS5yZW1vdmVMaXN0ZW5lcignZHJhZycsIG9uRHJhZyk7XG4gICAgICB9O1xuXG4gICAgICBsZXQgZml0ID0gKCkgPT4ge1xuICAgICAgICBpZiggcy5maXQgJiYgcy5hbmltYXRlQ29udGludW91c2x5ICl7XG4gICAgICAgICAgcy5jeS5maXQoIHMucGFkZGluZyApO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBsZXQgb25Ob3REb25lID0gKCkgPT4ge1xuICAgICAgICByZWZyZXNoUG9zaXRpb25zKCBzLm5vZGVzLCBzICk7XG4gICAgICAgIGZpdCgpO1xuXG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSggZnJhbWUgKTtcbiAgICAgIH07XG5cbiAgICAgIGxldCBmcmFtZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIG11bHRpdGljayggcywgb25Ob3REb25lLCBvbkRvbmUgKTtcbiAgICAgIH07XG5cbiAgICAgIGxldCBvbkRvbmUgPSAoKSA9PiB7XG4gICAgICAgIHJlZnJlc2hQb3NpdGlvbnMoIHMubm9kZXMsIHMgKTtcbiAgICAgICAgZml0KCk7XG5cbiAgICAgICAgcy5ub2Rlcy5mb3JFYWNoKCBuID0+IHtcbiAgICAgICAgICByZWdyYWJpZnkoIG4gKTtcbiAgICAgICAgICB1bmxpc3RlblRvR3JhYiggbiApO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgcy5ydW5uaW5nID0gZmFsc2U7XG5cbiAgICAgICAgbC5lbWl0KCdsYXlvdXRzdG9wJyk7XG4gICAgICB9O1xuXG4gICAgICBsLmVtaXQoJ2xheW91dHN0YXJ0Jyk7XG5cbiAgICAgIHMubm9kZXMuZm9yRWFjaCggbiA9PiB7XG4gICAgICAgIHVuZ3JhYmlmeSggbiApO1xuICAgICAgICBsaXN0ZW5Ub0dyYWIoIG4gKTtcbiAgICAgIH0gKTtcblxuICAgICAgZnJhbWUoKTsgLy8ga2ljayBvZmZcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcbiAgICAgIGxldCBvbk5vdERvbmUgPSAoKSA9PiB7fTtcbiAgICAgIGxldCBvbkRvbmUgPSAoKSA9PiBkb25lID0gdHJ1ZTtcblxuICAgICAgd2hpbGUoICFkb25lICl7XG4gICAgICAgIG11bHRpdGljayggcywgb25Ob3REb25lLCBvbkRvbmUgKTtcbiAgICAgIH1cblxuICAgICAgcy5lbGVzLmxheW91dFBvc2l0aW9ucyggdGhpcywgcywgbm9kZSA9PiBnZXROb2RlUG9zaXRpb25EYXRhKCBub2RlLCBzICkgKTtcbiAgICB9XG5cbiAgICBsLnBvc3RydW4oIHMgKTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBjaGFpbmluZ1xuICB9XG5cbiAgcHJlcnVuKCl7fVxuICBwb3N0cnVuKCl7fVxuICB0aWNrKCl7fVxuXG4gIHN0b3AoKXtcbiAgICB0aGlzLnN0YXRlLnJ1bm5pbmcgPSBmYWxzZTtcblxuICAgIHJldHVybiB0aGlzOyAvLyBjaGFpbmluZ1xuICB9XG5cbiAgZGVzdHJveSgpe1xuICAgIHJldHVybiB0aGlzOyAvLyBjaGFpbmluZ1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTGF5b3V0O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2xheW91dC9pbmRleC5qcyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oIGJiLCBjeSApe1xuICBpZiggYmIgPT0gbnVsbCApe1xuICAgIGJiID0geyB4MTogMCwgeTE6IDAsIHc6IGN5LndpZHRoKCksIGg6IGN5LmhlaWdodCgpIH07XG4gIH0gZWxzZSB7IC8vIGNvcHlcbiAgICBiYiA9IHsgeDE6IGJiLngxLCB4MjogYmIueDIsIHkxOiBiYi55MSwgeTI6IGJiLnkyLCB3OiBiYi53LCBoOiBiYi5oIH07XG4gIH1cblxuICBpZiggYmIueDIgPT0gbnVsbCApeyBiYi54MiA9IGJiLngxICsgYmIudzsgfVxuICBpZiggYmIudyA9PSBudWxsICl7IGJiLncgPSBiYi54MiAtIGJiLngxOyB9XG4gIGlmKCBiYi55MiA9PSBudWxsICl7IGJiLnkyID0gYmIueTEgKyBiYi5oOyB9XG4gIGlmKCBiYi5oID09IG51bGwgKXsgYmIuaCA9IGJiLnkyIC0gYmIueTE7IH1cblxuICByZXR1cm4gYmI7XG59O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2xheW91dC9tYWtlLWJiLmpzIiwiY29uc3QgYXNzaWduID0gcmVxdWlyZSgnLi4vYXNzaWduJyk7XG5cbmxldCBzZXRJbml0aWFsUG9zaXRpb25TdGF0ZSA9IGZ1bmN0aW9uKCBub2RlLCBzdGF0ZSApe1xuICBsZXQgcCA9IG5vZGUucG9zaXRpb24oKTtcbiAgbGV0IGJiID0gc3RhdGUuY3VycmVudEJvdW5kaW5nQm94O1xuICBsZXQgc2NyYXRjaCA9IG5vZGUuc2NyYXRjaCggc3RhdGUubmFtZSApO1xuXG4gIGlmKCBzY3JhdGNoID09IG51bGwgKXtcbiAgICBzY3JhdGNoID0ge307XG5cbiAgICBub2RlLnNjcmF0Y2goIHN0YXRlLm5hbWUsIHNjcmF0Y2ggKTtcbiAgfVxuXG4gIGFzc2lnbiggc2NyYXRjaCwgc3RhdGUucmFuZG9taXplID8ge1xuICAgIHg6IGJiLngxICsgTWF0aC5yb3VuZCggTWF0aC5yYW5kb20oKSAqIGJiLncgKSxcbiAgICB5OiBiYi55MSArIE1hdGgucm91bmQoIE1hdGgucmFuZG9tKCkgKiBiYi5oIClcbiAgfSA6IHtcbiAgICB4OiBwLngsXG4gICAgeTogcC55XG4gIH0gKTtcblxuICBzY3JhdGNoLmxvY2tlZCA9IG5vZGUubG9ja2VkKCk7XG59O1xuXG5sZXQgZ2V0Tm9kZVBvc2l0aW9uRGF0YSA9IGZ1bmN0aW9uKCBub2RlLCBzdGF0ZSApe1xuICByZXR1cm4gbm9kZS5zY3JhdGNoKCBzdGF0ZS5uYW1lICk7XG59O1xuXG5sZXQgcmVmcmVzaFBvc2l0aW9ucyA9IGZ1bmN0aW9uKCBub2Rlcywgc3RhdGUgKXtcbiAgbm9kZXMucG9zaXRpb25zKGZ1bmN0aW9uKCBub2RlICl7XG4gICAgbGV0IHNjcmF0Y2ggPSBub2RlLnNjcmF0Y2goIHN0YXRlLm5hbWUgKTtcblxuICAgIHJldHVybiB7XG4gICAgICB4OiBzY3JhdGNoLngsXG4gICAgICB5OiBzY3JhdGNoLnlcbiAgICB9O1xuICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0geyBzZXRJbml0aWFsUG9zaXRpb25TdGF0ZSwgZ2V0Tm9kZVBvc2l0aW9uRGF0YSwgcmVmcmVzaFBvc2l0aW9ucyB9O1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2xheW91dC9wb3NpdGlvbi5qcyIsImNvbnN0IG5vcCA9IGZ1bmN0aW9uKCl7fTtcblxubGV0IHRpY2sgPSBmdW5jdGlvbiggc3RhdGUgKXtcbiAgbGV0IHMgPSBzdGF0ZTtcbiAgbGV0IGwgPSBzdGF0ZS5sYXlvdXQ7XG5cbiAgbGV0IHRpY2tJbmRpY2F0ZXNEb25lID0gbC50aWNrKCBzICk7XG5cbiAgaWYoIHMuZmlyc3RVcGRhdGUgKXtcbiAgICBpZiggcy5hbmltYXRlQ29udGludW91c2x5ICl7IC8vIGluZGljYXRlIHRoZSBpbml0aWFsIHBvc2l0aW9ucyBoYXZlIGJlZW4gc2V0XG4gICAgICBzLmxheW91dC5lbWl0KCdsYXlvdXRyZWFkeScpO1xuICAgIH1cbiAgICBzLmZpcnN0VXBkYXRlID0gZmFsc2U7XG4gIH1cblxuICBzLnRpY2tJbmRleCsrO1xuXG4gIGxldCBkdXJhdGlvbiA9IERhdGUubm93KCkgLSBzLnN0YXJ0VGltZTtcblxuICByZXR1cm4gIXMuaW5maW5pdGUgJiYgKCB0aWNrSW5kaWNhdGVzRG9uZSB8fCBzLnRpY2tJbmRleCA+PSBzLm1heEl0ZXJhdGlvbnMgfHwgZHVyYXRpb24gPj0gcy5tYXhTaW11bGF0aW9uVGltZSApO1xufTtcblxubGV0IG11bHRpdGljayA9IGZ1bmN0aW9uKCBzdGF0ZSwgb25Ob3REb25lID0gbm9wLCBvbkRvbmUgPSBub3AgKXtcbiAgbGV0IGRvbmUgPSBmYWxzZTtcbiAgbGV0IHMgPSBzdGF0ZTtcblxuICBmb3IoIGxldCBpID0gMDsgaSA8IHMucmVmcmVzaDsgaSsrICl7XG4gICAgZG9uZSA9ICFzLnJ1bm5pbmcgfHwgdGljayggcyApO1xuXG4gICAgaWYoIGRvbmUgKXsgYnJlYWs7IH1cbiAgfVxuXG4gIGlmKCAhZG9uZSApe1xuICAgIG9uTm90RG9uZSgpO1xuICB9IGVsc2Uge1xuICAgIG9uRG9uZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHsgdGljaywgbXVsdGl0aWNrIH07XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbGF5b3V0L3RpY2suanMiXSwic291cmNlUm9vdCI6IiJ9