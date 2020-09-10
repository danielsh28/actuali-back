"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNewsFromDB = exports.getCategoriesFromDB = exports.insertToDB = exports.getServerData = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const monitor_constants_1 = __importDefault(require("../monitor-constants"));
mongoose_1.default.connect(monitor_constants_1.default.DB_URL, { useNewUrlParser: true }).catch(err => console.log('connection failed : ' + err.message));
const db = mongoose_1.default.connection;
db.on('Error', () => console.log('Error connect to database'));
db.once('open', () => console.log('Connection established successfully'));
const contentSchema = new mongoose_1.default.Schema({
    publishedAt: Date,
    title: String,
    url: String,
    urlToImage: String,
    resource: String
}, { _id: false });
const resourceSchema = new mongoose_1.default.Schema({
    category: String,
    headlines: [contentSchema]
});
resourceSchema.methods.conformSave = (log) => console.log(log);
const ResourceModel = mongoose_1.default.model('resource', resourceSchema);
//function update exist resource document in a new content or creating a new one with a new resource
function handleHeadlinesByResource(headlinesByCategory) {
    const categoryElement = headlinesByCategory.category;
    const headlinesFromCategory = headlinesByCategory.headlines;
    ResourceModel.findOne({ category: categoryElement }, async function (err, doc) {
        if (doc != null) {
            const updatedDoc = await ResourceModel.findOneAndUpdate({ category: doc.category }, { $addToSet: { headlines: { $each: headlinesFromCategory } } }, { new: true,
                useFindAndModify: false });
            console.log(`headlines from ${categoryElement} updated from ${doc.headlines.length} to ${updatedDoc.headlines.length}`);
        }
        else {
            ResourceModel.create({ category: categoryElement, headlines: headlinesFromCategory }).then(() => {
                resourceSchema.methods.conformSave('category ' + categoryElement + ' created');
            });
            ;
        }
    }).catch(error => console.log(error));
}
exports.insertToDB = handleHeadlinesByResource;
const getCategoriesFromDB = function () {
    return ResourceModel.aggregate([{ $unwind: "$headlines" }, { $sort: { "headlines.publishedAt": -1 } },
        { $group: { _id: "$category", urlToImage: { $first: "$headlines.urlToImage" } } }]).then(categories => categories.map(cat => ({
        catName: cat._id,
        urlToImage: cat.urlToImage
    })).filter(cat => cat.catName !== 'general'));
};
exports.getCategoriesFromDB = getCategoriesFromDB;
const getNewsFromDB = function (params) {
    return ResourceModel.aggregate([{ $match: { category: { $in: params.cat } } }, { $unwind: '$headlines' },
        { $group: { _id: "$headlines.url", cat: { $first: 'category' }, title: { $first: '$headlines.title' },
                urlToImage: { $first: "$headlines.urlToImage" }, publishedAt: { $first: '$headlines.publishedAt' }, resource: { $first: '$headlines.resource' } } },
        { $sort: { 'publishedAt': -1 } }, { $limit: parseInt(params.count) }]).then(newsList => newsList.map(element => ({
        title: element.title,
        url: element._id,
        urlToImage: element.urlToImage,
        publishedAt: element.publishedAt,
        resource: element.resource
    })));
};
exports.getNewsFromDB = getNewsFromDB;
async function getServerData(queryCallback, params) {
    let datafromdB = ['non-initialized'];
    try {
        datafromdB = await queryCallback(params);
    }
    catch (err) {
        console.log(err);
    }
    return [...new Set(datafromdB)];
}
exports.getServerData = getServerData;
//# sourceMappingURL=data.service.db.js.map