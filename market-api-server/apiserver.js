


import MongoInterface from './lib/mongo-interface.js'

import DataGhost from './lib/dataghost.js' 

import FileHelper from './lib/file-helper.js'

import ApiServer from './lib/api-server.js'

import PopulateTraitsTask from './tasks/populateTraitsDB.js'
import PopulateCachedNFTTilesTask from './tasks/populateCachedNFTTiles.js'
import GenerateContractDataLookupTask from './tasks/generateContractDataLookup.js'
 

import Web3 from 'web3'
import NFTTileManager from './lib/nft-tile-manager.js'

let envmode = process.env.NODE_ENV

let serverConfigFile = FileHelper.readJSONFile('./market-api-server/config/serverconfig.json')
let serverConfig = serverConfigFile[envmode]

let dataghostConfigFile = FileHelper.readJSONFile('./market-api-server/config/dataghostconfig.json')
let dataghostConfig = dataghostConfigFile[envmode]

let sharedConfig =  FileHelper.readJSONFile('./shared/sharedconfig.json')

  async function start(){


      
    console.log('server config: ',serverConfig)


    let mongoInterface = new MongoInterface() 
    await mongoInterface.init(  serverConfig.dbName )

    await GenerateContractDataLookupTask.runTask( )
    

    
    for(let name of sharedConfig.collectionNames){

      await PopulateTraitsTask.runTask({collectionName: name},mongoInterface)
      await PopulateCachedNFTTilesTask.runTask({collectionName: name},mongoInterface)
  
    }
 
   
    console.log('boot vibegraph interface ', dataghostConfig.vibeGraphConfig.dbName)

    let vibegraphInterface =  new MongoInterface() 
    await vibegraphInterface.init( dataghostConfig.vibeGraphConfig.dbName )
 
 

    let web3 = new Web3(new Web3.providers.WebsocketProvider( serverConfig.web3provider, {
      clientConfig: {
        maxReceivedFrameSize: 100000000,
        maxReceivedMessageSize: 100000000,
      }
    }));


    let dataghost = new DataGhost()
    dataghost.init(web3  ) 

    

    let nftTileManager = new NFTTileManager(web3,mongoInterface,vibegraphInterface,serverConfig)
    await nftTileManager.init() 


    //TODO: DO NOT pass vibegraph interface into this -> use the nft-tile-manager to coalesce all of the data into mongoInterface 
    let apiServer = new ApiServer(web3,mongoInterface,vibegraphInterface, serverConfig )
      
    
    console.log('web3 ready with provider ',serverConfig.web3provider )
    
 


}

 
 start()