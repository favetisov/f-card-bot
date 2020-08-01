"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onmessage = void 0;
var ping_1 = require("./middleware/ping");
exports.onmessage = function (req, res) {
    var result = ping_1.ping(req.body);
    res.send(result);
};
