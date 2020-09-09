import mongoose, {Document, Model} from 'mongoose';
import appConst from '../monitor-constants';
import QueryString from "qs";
mongoose.connect(appConst.DB_URL, {useNewUrlParser: true}).catch(
    err=> console.log('connection failed : ' + err.message));
    const db = mongoose.connection;
    db.on('Error', () => console.log('Error connect to database'));
    db.once('open', () => console.log('Connection established successfully'));

    interface IContentSchema extends  Document{
        publishedAt: Date,
        title: String,
        url:String,
        urlToImage:String,
        resource:String
    }

    interface IResourceSchema extends Document{
        category: string,
        headlines: Array<IContentSchema>
    }

const contentSchema = new mongoose.Schema({
    publishedAt: Date,
    title: String,
    url:String,
    urlToImage:String,
    resource:String
},{_id:false});
const resourceSchema = new mongoose.Schema({
    category: String,
    headlines: [contentSchema]
});

resourceSchema.methods.conformSave = (log :string) => console.log(log);
const ResourceModel = mongoose.model<IResourceSchema>('resource', resourceSchema);





//function update exist resource document in a new content or creating a new one with a new resource
function handleHeadlinesByResource(headlinesByCategory :{category:string, headlines: Array<any>}) {
        const categoryElement : string= headlinesByCategory.category;
        const headlinesFromCategory :Array<any> = headlinesByCategory.headlines;
         ResourceModel.findOne({category: categoryElement}, async function (err,doc: IResourceSchema ) {
            if (doc != null) {
               const updatedDoc = await  ResourceModel.findOneAndUpdate({category: doc.category}, {$addToSet: {headlines:{$each:headlinesFromCategory}}}
                ,{new: true,
                       useFindAndModify:false});
                console.log(`headlines from ${categoryElement} updated from ${doc.headlines.length} to ${updatedDoc.headlines.length}`);
            } else {
                ResourceModel.create({category: categoryElement, headlines: headlinesFromCategory}).then(()=>{
                    resourceSchema.methods.conformSave('category ' + categoryElement + ' created');
                });
                ;
            }
        }).catch(error => console.log(error));
    }


const getCategoriesFromDB =  function (){
          return ResourceModel.aggregate([{$unwind: "$headlines"}, {$sort : {"headlines.publishedAt":-1}},
              {$group: { _id: "$category",urlToImage:{$first: "$headlines.urlToImage"}}}]).then(
              categories => categories.map(cat => ({
                      catName:cat._id,
                      urlToImage : cat.urlToImage
                  })
              ).filter(cat => cat.catName!=='general')
          );
}

const getNewsFromDB = function  (params : QueryString.ParsedQs){
          return ResourceModel.aggregate([{$match:{category:{$in:params.cat}}},{$unwind: '$headlines'},
              {$group:{_id:"$headlines.url",cat:{$first:'category'}, title:{$first:'$headlines.title'},
                      urlToImage:{$first:"$headlines.urlToImage"},publishedAt:{$first:'$headlines.publishedAt'},resource:{$first:'$headlines.resource'}}}
              ,{$sort : {'publishedAt' : -1}},{$limit:parseInt(params.count as string)}]).then(newsList=>
              newsList.map(element=>({
        title: element.title,
        url: element._id,
        urlToImage: element.urlToImage,
        publishedAt : element.publishedAt,
        resource : element.resource}))
          );
}
export async function getServerData(queryCallback : Function,params?: QueryString.ParsedQs) {
    let datafromdB = ['non-initialized'];
    try {
        datafromdB = await queryCallback(params);
    } catch (err) {
        console.log(err)
    }

    return [...new Set(datafromdB)];


}
export {handleHeadlinesByResource as insertToDB,getCategoriesFromDB,getNewsFromDB};

