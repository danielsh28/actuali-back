"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_service_db_1 = require("../monitor-data/data.service.db");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post('/', (req, res) => {
    data_service_db_1.insertToDB(req.body);
});
exports.default = router;
//# sourceMappingURL=data.js.map