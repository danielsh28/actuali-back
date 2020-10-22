import mongoose, { Document } from 'mongoose';
import QueryString from 'qs';

const { connection } = mongoose;

export interface IContentSchema extends Document {
  publishedAt: Date;
  title: string;
  url: string;
  urlToImage: string;
  resource: string;
  source?: any;
}

interface IResourceSchema extends Document {
  category: string;
  headlines: Array<IContentSchema>;
}

const contentSchema = new mongoose.Schema(
  {
    publishedAt: Date,
    title: String,
    url: String,
    urlToImage: String,
    resource: String,
  },
  { _id: false },
);
const resourceSchema = new mongoose.Schema({
  category: String,
  headlines: [contentSchema],
});

resourceSchema.methods.conformSave = (log: string) => console.log(log);
const ResourceModel = mongoose.model<IResourceSchema>('resource', resourceSchema);

// function update exist resource document in a new content or creating a new one with a new resource
function handleHeadlinesByResource(headlinesByCategory: { category: string; headlines: Array<any> }): void {
  const categoryElement: string = headlinesByCategory.category;
  const headlinesFromCategory: Array<any> = headlinesByCategory.headlines;
  ResourceModel.findOne({ category: categoryElement }, async function updateCategory(err, doc: IResourceSchema) {
    if (doc != null) {
      const updatedDoc = await ResourceModel.findOneAndUpdate(
        { category: doc.category },
        { $addToSet: { headlines: { $each: headlinesFromCategory } } },
        { new: true, useFindAndModify: false },
      );
      console.log(
        `headlines from ${categoryElement} updated from ${doc.headlines.length} to ${updatedDoc.headlines.length}`,
      );
    } else {
      ResourceModel.create({ category: categoryElement, headlines: headlinesFromCategory }).then(() => {
        resourceSchema.methods.conformSave(`category ${categoryElement} created`);
      });
    }
  }).catch((error) => console.log(error));
}

const getCategoriesFromDB = function () {
  return ResourceModel.aggregate([
    { $unwind: '$headlines' },
    { $sort: { 'headlines.publishedAt': -1 } },
    { $group: { _id: '$category', urlToImage: { $first: '$headlines.urlToImage' } } },
  ]).then((categories) =>
    categories
      .map((cat) => ({
        // eslint-disable-next-line no-underscore-dangle
        catName: cat._id,
        urlToImage: cat.urlToImage,
      }))
      .filter((cat) => cat.catName !== 'general'),
  );
};

const getNewsFromDB = function (params: QueryString.ParsedQs) {
  return ResourceModel.aggregate([
    { $match: { category: { $in: params.cat } } },
    { $unwind: '$headlines' },
    {
      $group: {
        _id: '$headlines.url',
        cat: { $first: 'category' },
        title: { $first: '$headlines.title' },
        urlToImage: { $first: '$headlines.urlToImage' },
        publishedAt: { $first: '$headlines.publishedAt' },
        resource: { $first: '$headlines.resource' },
      },
    },
    { $sort: { publishedAt: -1 } },
    { $limit: parseInt(params.count as string, 2) },
  ]).then((newsList) =>
    newsList.map((element) => ({
      title: element.title,
      url: element._id,
      urlToImage: element.urlToImage,
      publishedAt: element.publishedAt,
      resource: element.resource,
    })),
  );
};
export async function getServerData(queryCallback: Function, params?: QueryString.ParsedQs) {
  let datafromdB = ['non-initialized'];
  try {
    datafromdB = await queryCallback(params);
  } catch (err) {
    console.log(err);
  }

  return [...new Set(datafromdB)];
}
export { connection, handleHeadlinesByResource as insertToDB, getCategoriesFromDB, getNewsFromDB };
