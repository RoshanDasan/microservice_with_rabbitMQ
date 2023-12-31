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
var typeorm_1 = require("typeorm"); // Use createConnection
var amqp = require("amqplib/callback_api");
var product_1 = require("./entity/product");
function startServer() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, productRepository;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, typeorm_1.createConnection)({
                        type: 'mongodb',
                        synchronize: true,
                        database: 'microservice_demo',
                        logging: ['query', 'error'],
                        entities: [product_1.Product],
                        migrations: [],
                        subscribers: [],
                    })];
                case 1:
                    connection = _a.sent();
                    productRepository = connection.getMongoRepository(product_1.Product);
                    amqp.connect('amqps://gsjvnbbg:9IORml9yyU6-e17u8O4rVkjVoFhaOEwz@rat.rmq2.cloudamqp.com/gsjvnbbg', function (err0, connection) {
                        if (err0)
                            throw err0;
                        connection.createChannel(function (err1, channel) {
                            if (err1)
                                throw err1;
                            channel.assertQueue('product_created', { durable: false });
                            channel.assertQueue('product_updated', { durable: false });
                            channel.assertQueue('product_deleted', { durable: false });
                            var app = express();
                            // Cors setup for UI 
                            app.use(cors({
                                origin: 'http://localhost:3000', // Allow requests from your frontend
                            }));
                            app.use(express.json());
                            channel.consume('product_created', function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, title, image, likes, id, product;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = JSON.parse(msg.content.toString()), title = _a.title, image = _a.image, likes = _a.likes, id = _a.id;
                                            product = new product_1.Product();
                                            product.title = title;
                                            product.image = image;
                                            product.likes = likes;
                                            product.admin_id = id;
                                            return [4 /*yield*/, productRepository.save(product)];
                                        case 1:
                                            _b.sent();
                                            console.log('Product created');
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, { noAck: true });
                            channel.consume('product_updated', function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                var _a, title, image, likes, id, product;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = JSON.parse(msg.content.toString()), title = _a.title, image = _a.image, likes = _a.likes, id = _a.id;
                                            return [4 /*yield*/, productRepository.findOne({ where: { admin_id: id } })];
                                        case 1:
                                            product = _b.sent();
                                            productRepository.merge(product, { title: title, image: image, likes: likes });
                                            console.log('Product updated');
                                            return [4 /*yield*/, productRepository.save(product)];
                                        case 2:
                                            _b.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }, { noAck: true });
                            channel.consume('product_deleted', function (msg) { return __awaiter(_this, void 0, void 0, function () {
                                var admin_id;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            admin_id = JSON.parse(msg.content.toString());
                                            return [4 /*yield*/, productRepository.delete({ admin_id: admin_id })];
                                        case 1:
                                            _a.sent();
                                            console.log('Product deleted');
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                            app.listen(6000, function () { return console.log('Server connected on port 6000'); });
                            process.on('beforeExit', function () {
                                console.log('Connection closed');
                                connection.close();
                            });
                        });
                    });
                    return [2 /*return*/];
            }
        });
    });
}
startServer();
