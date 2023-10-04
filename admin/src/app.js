"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var cors = require("cors");
var typeorm_1 = require("typeorm");
var AppDataSource = new typeorm_1.DataSource({
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "r1o2s3h4a5n6",
    "database": "microservice_demo",
});
AppDataSource.initialize().then(function () {
    var app = express();
    // cors setup for UI
    app.use(cors({
        origin: ["http://localhost:3000"]
    }));
    app.use(express.json());
    app.listen(5000, function () { return console.log('Server connected'); });
});
