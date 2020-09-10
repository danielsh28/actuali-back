"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const data_service_db_1 = require("../monitor-data/data.service.db");
const router = express_1.default.Router();
router.get('/choose-category', async (req, res) => {
    const data = await data_service_db_1.getServerData(data_service_db_1.getCategoriesFromDB);
    res.send(JSON.stringify(data));
});
router.get('/user-dashboard', async (req, res) => {
    const q = req.query;
    const data = await data_service_db_1.getServerData(data_service_db_1.getNewsFromDB, req.query);
    res.send(JSON.stringify(data));
});
exports.default = router;
//# sourceMappingURL=api.js.map