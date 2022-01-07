 
import FileHelper from '../lib/file-helper.js'

//import MongoInterface from '../lib/mongo-interface.js'
 
 

let outputConfig; // = FileHelper.readJSONFile('./market-api-server/config/baycOutputData.json')
 
export default class PopulateTraitsTask {


static async runTask( inputs, mongoInterface ){
 
let collectionName = inputs.collectionName 


const traitsModel =  mongoInterface.traitsModel

let count = await traitsModel.count({collectionName:  collectionName})
  if(count > 0){
    console.log("Found existing nft traits of type: ", collectionName, ". Not regenerating.")
    return 
  }




 try{
    outputConfig = FileHelper.readJSONFile(`./market-api-server/assetdata/${collectionName.toLowerCase()}.json`)
 }catch(e){
     console.error(e)
     return 
 }


let traitsTokenIdMap = { } 
 


for(let [tokenId,traitsArray] of Object.entries(outputConfig)){

  

    for(let trait of traitsArray){
        let traitType = trait.trait_type.toString()
        let traitValue = trait.value.toString()
        
        if(!traitsTokenIdMap[traitType]){   
            traitsTokenIdMap[traitType] = {} 
        } 

        if(!traitsTokenIdMap[traitType][traitValue]){ 
            traitsTokenIdMap[traitType][traitValue] = []  
         
        }
        
        traitsTokenIdMap[traitType][traitValue].push(tokenId)
         
    }
    
    

}   
 

await traitsModel.deleteMany({collectionName: collectionName})


 for(let traitType of Object.keys(traitsTokenIdMap)){
      for(let traitValue of Object.keys(traitsTokenIdMap[traitType])){
  

                const instance =  new traitsModel({
                    collectionName: collectionName,
                    traitType: traitType,
                    value: traitValue,
                    traitTypeLower: traitType.toLowerCase(),
                    valueLower: traitValue.toLowerCase(),
                    tokenIdArray: traitsTokenIdMap[traitType][traitValue] 
                })
                await instance.save()


    }
 }

 console.log(`PopulateTraitsTask ${collectionName}: task complete.`)
    

}


} 


 