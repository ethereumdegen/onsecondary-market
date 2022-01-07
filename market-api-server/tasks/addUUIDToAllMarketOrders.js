 
  
import MongoInterface from '../lib/mongo-interface.js'

import FileHelper from '../lib/file-helper.js' 
import AppHelper from '../lib/app-helper.js'
  
let envmode = process.env.NODE_ENV

if(!envmode) envmode = 'development'

console.log('envmode: ', envmode)

let serverConfigFile = FileHelper.readJSONFile('./market-api-server/config/serverconfig.json')
let serverConfig = serverConfigFile[envmode]
 
 
export default class AddUUIDToAllMarketOrders {

    static async runTask(){
    

        let mongoInterface = new MongoInterface() 
        await mongoInterface.init(  serverConfig.dbName )

        
        let orders = await mongoInterface.marketOrdersModel.find({orderUUID: {$exists:false}})

        for(let order of orders){

            await mongoInterface.marketOrdersModel.updateOne({_id:order._id},
                { orderUUID: AppHelper.generateRandomUUID() }) 
        
        }  

        

        console.log('add order UUIDs task complete')
        

    }


}
 



 