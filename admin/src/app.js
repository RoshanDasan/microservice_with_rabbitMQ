"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
var amqp = require("amqplib/callback_api");
var product_1 = require("./entity/product");
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, productRepository;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, typeorm_1.createConnection)({
                        type: 'postgres',
                        host: 'localhost',
                        port: 5432,
                        username: 'postgres',
                        password: 'r1o2s3h4a5n6',
                        database: 'microservice_demo',
                        entities: [product_1.Product],
                        synchronize: true, // Set to false in production
                    })];
                case 1:
                    connection = _a.sent();
                    productRepository = connection.getRepository(product_1.Product);
                    amqp.connect('amqps://gsjvnbbg:9IORml9yyU6-e17u8O4rVkjVoFhaOEwz@rat.rmq2.cloudamqp.com/gsjvnbbg', function (err0, connection) {
                        if (err0)
                            throw err0;
                        connection.createChannel(function (err1, channel) { return __awaiter(_this, void 0, void 0, function () {
                            var app;
                            var _this = this;
                            return __generator(this, function (_a) {
                                if (err1)
                                    throw err1;
                                app = express();
                                // Cors setup for UI
                                app.use(cors({
                                    origin: 'http://localhost:3000', // Allow requests from your frontend
                                }));
                                app.use(express.json());
                                // Route endpoints
                                app.get('/api/products', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                                    var products, error_1;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, productRepository.find()];
                                            case 1:
                                                products = _a.sent();
                                                res.json(products);
                                                return [3 /*break*/, 3];
                                            case 2:
                                                error_1 = _a.sent();
                                                console.error("Error while fetching data: ".concat(error_1));
                                                res.status(500).json({ error: 'Internal Server Error' });
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                app.post('/api/products', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                                    var product, result, error_2;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                product = productRepository.create(req.body);
                                                return [4 /*yield*/, productRepository.save(product)];
                                            case 1:
                                                result = _a.sent();
                                                channel.sendToQueue('product_created', Buffer.from(JSON.stringify(result)));
                                                res.json(result);
                                                return [3 /*break*/, 3];
                                            case 2:
                                                error_2 = _a.sent();
                                                console.error("Error while saving product: ".concat(error_2));
                                                res.status(500).json({ error: 'Internal Server Error' });
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                app.get('/api/products/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                                    var product, error_3;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, productRepository.findOne({ where: { id: parseInt(req.params.id) } })];
                                            case 1:
                                                product = _a.sent();
                                                res.json(product);
                                                return [3 /*break*/, 3];
                                            case 2:
                                                error_3 = _a.sent();
                                                console.error("Error while fetching product: ".concat(error_3));
                                                res.status(500).json({ error: 'Internal Server Error' });
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                app.put('/api/products/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                                    var product, result, error_4;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 3, , 4]);
                                                return [4 /*yield*/, productRepository.findOne({ where: { id: parseInt(req.params.id) } })];
                                            case 1:
                                                product = _a.sent();
                                                productRepository.merge(product, req.body);
                                                return [4 /*yield*/, productRepository.save(product)];
                                            case 2:
                                                result = _a.sent();
                                                channel.sendToQueue('product_updated', Buffer.from(JSON.stringify(result)));
                                                res.json(result);
                                                return [3 /*break*/, 4];
                                            case 3:
                                                error_4 = _a.sent();
                                                console.error("Error while updating product: ".concat(error_4));
                                                res.status(500).json({ error: 'Internal Server Error' });
                                                return [3 /*break*/, 4];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                app.delete('/api/products/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                                    var result, error_5;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 2, , 3]);
                                                return [4 /*yield*/, productRepository.delete(req.params.id)];
                                            case 1:
                                                result = _a.sent();
                                                channel.sendToQueue('product_deleted', Buffer.from(req.params.id));
                                                res.json(result);
                                                return [3 /*break*/, 3];
                                            case 2:
                                                error_5 = _a.sent();
                                                console.error("Error while deleting product: ".concat(error_5));
                                                res.status(500).json({ error: 'Internal Server Error' });
                                                return [3 /*break*/, 3];
                                            case 3: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                app.post('/api/products/like/:id', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                                    var product, result, error_6;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                _a.trys.push([0, 3, , 4]);
                                                return [4 /*yield*/, productRepository.findOne({ where: { id: parseInt(req.params.id) } })];
                                            case 1:
                                                product = _a.sent();
                                                if (!product)
                                                    return [2 /*return*/, res.status(404).json({ error: 'Product not found' })];
                                                product.likes++;
                                                return [4 /*yield*/, productRepository.save(product)];
                                            case 2:
                                                result = _a.sent();
                                                res.json(result);
                                                return [3 /*break*/, 4];
                                            case 3:
                                                error_6 = _a.sent();
                                                console.error("Error while updating like of the product: ".concat(error_6));
                                                res.status(500).json({ error: 'Internal Server Error' });
                                                return [3 /*break*/, 4];
                                            case 4: return [2 /*return*/];
                                        }
                                    });
                                }); });
                                app.listen(5000, function () { return console.log('Server connected on port 5000'); });
                                process.on('beforeExit', function () {
                                    console.log('Connection closed');
                                    connection.close();
                                });
                                return [2 /*return*/];
                            });
                        }); });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startServer();
