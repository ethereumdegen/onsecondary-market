 

//import BigNumber from 'bignumber.js' 

import Web3Helper from './web3-helper.js'
 
 
import AppHelper from './app-helper.js'
 



/*
  Manual todo:

  -test this new logic 
  -ownerAddressMismatched is no longer a status -> convert that over to 'valid' state 
 
*/

const DEBUG = false 

export default class NFTTileManager  {

    constructor(web3, mongoInterface, vibegraphInterface, serverConfig){
        this.mongoInterface = mongoInterface;
        this.vibegraphInterface = vibegraphInterface;
        this.web3 = web3;
        this.serverConfig = serverConfig
 

        this.init() 

        
    }

    async init(){
        this.chainId =  this.serverConfig.chainId //await Web3Helper.getNetworkId(this.web3);
        await this.updateBlockNumber()
       

        setInterval(this.updateBlockNumber.bind(this),60*1000)

 
        this.startPolling()
    }

    async startPolling(){
 
 
          //this.pollNextERC721Balance() 

          //this.pollNextRecentlyUpdatedERC721Balance() 

          
          this.pollNextERC721Transfer() 

          this.pollNewlyCreatedMarketOrders()
      
          //this.pollNextMarketOrder()

          this.expireMarketOrders()
          this.pollNewBurnedNonces()
            
    }

    async updateBlockNumber(){

      try{ 
        this.blockNumber = await Web3Helper.getBlockNumber(this.web3);
      }catch(e){
          console.error(e)
      }

      if(this.blockNumber){
        await this.mongoInterface.serverDataModel.findOneAndUpdate({ }, {latestBlockNumber: this.blockNumber}, {upsert:true})
      }
     

  }

    /*
    Find orders with state of 'created' 
    mark them with a new status 

    */
    async pollNewlyCreatedMarketOrders( ){
        
       
      let nextMarketOrder = await this.mongoInterface.marketOrdersModel
      .findOne({  /*lastPolledAt:  {$not: {$gte: beforeTime }} ,*/  status:  'created' })      
      .sort( { createdAt: 1  } )  //sort ASC  - grab the oldest one  

      
      if(nextMarketOrder){ 

        
        await this.updateMarketOrderStatus(nextMarketOrder)
        //await this.updateNftTilesFromMarketOrder(nextMarketOrder)
        
        await this.mongoInterface.marketOrdersModel
        .updateOne({_id: nextMarketOrder._id}, {lastPolledAt: Date.now()})


        setTimeout( this.pollNewlyCreatedMarketOrders.bind(this), 0)

      }else{ 

        setTimeout( this.pollNewlyCreatedMarketOrders.bind(this), 200)
      }

      

  }

  async expireMarketOrders(){
    let currentBlockNumber = this.blockNumber 

    
    if(!currentBlockNumber){
      console.log('WARN: no block number to update market order status')
      return
    }

    let ordersToExpire = this.mongoInterface.marketOrdersModel
    .find({status:'valid',expires: {$lt: currentBlockNumber}} )

    if(ordersToExpire && ordersToExpire.length >0){
      for(let order of ordersToExpire){

     
        await this.updateMarketOrderStatus(order)
         
      }
    }
    

  }





  /*
  As new burned nonces come in, expire all market orders matching them 
  */
  async pollNewBurnedNonces(){


    let nextBurnedNonce = await this.vibegraphInterface.burnedNoncesModel
    .findOne({   lastPolledAt:  {$not: {$gt:0}} })      
    .sort( { createdAt: 1  } )  //sort ASC  - grab the oldest one  ++

 

    if(nextBurnedNonce){

      await this.invalidateAllMarketOrdersWithNonce( nextBurnedNonce.nonce )

      await this.vibegraphInterface.burnedNoncesModel
      .updateOne({_id: nextBurnedNonce._id}, {lastPolledAt: Date.now()})

      setTimeout( this.pollNewBurnedNonces.bind(this), 0)
    }else{
      setTimeout( this.pollNewBurnedNonces.bind(this), 200)
    }
   // let matchingBurnedNonce = await this.vibegraphInterface.burnedNoncesModel.findOne({nonce: marketOrder.nonce})
      
    
  }


  async invalidateAllMarketOrdersWithNonce(nonce){

    let burnedOrders = await this.mongoInterface.marketOrdersModel
    .find({nonce:nonce, status:'valid' } )
    
    if(burnedOrders && burnedOrders.length >0){
      for(let order of burnedOrders){
  
        await this.updateMarketOrderStatus(order)
        
      }
    }

  }




    /*
    loop through all transfer events one time to update cachedNFTTileOwner
    */
    async pollNextERC721Transfer( ){ 
     

      //const STALE_TIME = 6000 * 1000;

      //let beforeTime = (Date.now() - STALE_TIME)

      let nextERC721Transfer = await this.vibegraphInterface.erc721TransfersModel
      .findOne( {  lastAppliedAt:  {$not: {$gt:0}} }).
      sort( {  blockNumber: 1,  transactionIndex: 1 } ) ///ascending for both 
       
        
      if(nextERC721Transfer){ 
        
          console.log('poll xfer ', nextERC721Transfer.blockNumber)
       
      
         
         await this.updateNftTileFromERC721Transfer(nextERC721Transfer)
         await this.updateMarketOrdersFromERC721Transfer(nextERC721Transfer)
        
         await this.vibegraphInterface.erc721TransfersModel
         .updateOne({_id: nextERC721Transfer._id}, {lastAppliedAt: Date.now()})


         setTimeout( this.pollNextERC721Transfer.bind(this), 0)

      }else{
        if(DEBUG){
          console.log('poll xfer - none')
        }

        setTimeout( this.pollNextERC721Transfer.bind(this), 200)
      }
 

  }


  /*
  Update the owner of the nft tile 

  */
  async updateNftTileFromERC721Transfer(erc721Transfer){

    let nftContractAddress = AppHelper.toChecksumAddress(erc721Transfer.contractAddress)
      
  
    let newOwnerAddress = AppHelper.toChecksumAddress(erc721Transfer.to)
    let tokenId = erc721Transfer.tokenId 

    if(erc721Transfer.from == erc721Transfer.to){
      return 
    }

    //faster 
    let update = await this.mongoInterface.cachedNFTTileModel.updateOne(
      {contractAddress: nftContractAddress , tokenId: tokenId  },
      {ownerPublicAddress: newOwnerAddress}
     )

      if( update ){
        console.log('updated ',update)
      }
     
    }

    async updateMarketOrdersFromERC721Transfer(erc721Transfer){

       

      //let newOwnerAddress = AppHelper.toChecksumAddress(erc721Transfer.to)
      let contractAddress=  erc721Transfer.contractAddress
      let tokenId = erc721Transfer.tokenId 

      if(erc721Transfer.from == erc721Transfer.to){
        return 
      }

      let marketOrdersFrom = await this.mongoInterface.marketOrdersModel.find(
        {nftContractAddress: contractAddress, nftTokenId: tokenId, orderCreator: erc721Transfer.from  })

      for(let marketOrder of marketOrdersFrom){ 

        await this.updateNftTilesFromMarketOrder(marketOrder)

      }

      let marketOrdersTo = await this.mongoInterface.marketOrdersModel.find(
        {nftContractAddress: contractAddress, nftTokenId: tokenId, orderCreator: erc721Transfer.to  })

      for(let marketOrder of marketOrdersTo){

     
        await this.updateNftTilesFromMarketOrder(marketOrder)

      }
  
  

    }

    async updateMarketOrderStatus(marketOrder){

      let newMarketOrderStatus = 'valid'
      
      let currentBlockNumber = this.blockNumber 

   

      if(!currentBlockNumber){
        console.log('WARN: no block number to update market order status')
        return
      }

    

      if(marketOrder.expires < currentBlockNumber){
        newMarketOrderStatus = 'expired'
      }
      
      let matchingBurnedNonce = await this.vibegraphInterface.burnedNoncesModel.findOne({nonce: marketOrder.nonce})
      
      if(matchingBurnedNonce){       
        newMarketOrderStatus = 'nonceBurned'
      }


      
      
      let updatedMarketOrder = await this.mongoInterface.marketOrdersModel.findOneAndUpdate({_id: marketOrder._id}, {status: newMarketOrderStatus}, {returnNewDocument: true })

      await this.updateNftTilesFromMarketOrder(updatedMarketOrder)
    }

    /*
       Updates the cached buyout price [sell orders only] 
     // find matching nft tile, update its buyout if it is lower and if this is valid   
    */
    async updateNftTilesFromMarketOrder(marketOrder){

     if(!marketOrder.isSellOrder){
      return 
    }
      
      //make sure currency token address is weth ?? --

     
      let nftContractAddress = AppHelper.toChecksumAddress(marketOrder.nftContractAddress)

     

      let matchingNFTTile = await this.mongoInterface.cachedNFTTileModel
      .findOne({contractAddress:  nftContractAddress , tokenId: marketOrder.nftTokenId })


      if(!matchingNFTTile){
        console.log('WARN: no matching nft tile ',    marketOrder )
        return 
     }

 

      await this.clearBuyoutPriceIfLinkedMarketOrderIsNowInvalid( marketOrder.nftContractAddress, marketOrder.nftTokenId  )
      await this.findBestFallbackBuyoutPriceForNftTile(  marketOrder.nftContractAddress, marketOrder.nftTokenId )


     

    }


    async findBestFallbackBuyoutPriceForNftTile(nftContractAddress,nftTokenId){

  

      let matchingNFTTile = await this.mongoInterface.cachedNFTTileModel.findOne({contractAddress: nftContractAddress , tokenId:  nftTokenId })
  
      if(!matchingNFTTile){
        console.log('WARN: no matching nft tile ', nftContractAddress,  nftTokenId )
        return 
     }

      let ownerAddress = AppHelper.toChecksumAddress(matchingNFTTile.ownerPublicAddress)

      let marketOrder = await this.mongoInterface.marketOrdersModel
      .findOne({nftContractAddress:  nftContractAddress, nftTokenId: nftTokenId, status: 'valid', isSellOrder:true,  orderCreator: ownerAddress })
      .sort( {currencyTokenAmount: 1}  )
      //find the one with the lowest price and link it 

      if(marketOrder){

        let orderBuyoutPriceWei = marketOrder.currencyTokenAmount

        await this.mongoInterface.cachedNFTTileModel.updateOne({_id: matchingNFTTile._id}, 
        {buyoutPriceSort: -1*orderBuyoutPriceWei , lowestBuyoutPriceWei: orderBuyoutPriceWei, buyoutPriceFromOrderId: AppHelper.mongoIdToNumber(marketOrder._id) })
      
      }
    


    }



    async clearBuyoutPriceIfLinkedMarketOrderIsNowInvalid(nftContractAddress,nftTokenId){


      let matchingNFTTile = await this.mongoInterface.cachedNFTTileModel
      .findOne({contractAddress:  nftContractAddress , tokenId: nftTokenId })


      if(!matchingNFTTile){
        console.log('WARN: no matching nft tile ',  nftContractAddress,nftTokenId )
        return 
      }

      if(! matchingNFTTile.buyoutPriceFromOrderId){ 
        return 
      }

     let linkedMarketOrderId = AppHelper.numberToMongoId(  matchingNFTTile.buyoutPriceFromOrderId  )

     let linkedMarketOrder = await this.mongoInterface.marketOrdersModel.findOne({_id: linkedMarketOrderId})

     
     let ownerAddress = AppHelper.toChecksumAddress(matchingNFTTile.ownerPublicAddress)
      let marketOrderSeller = AppHelper.toChecksumAddress(linkedMarketOrder.orderCreator)
      let orderIsFromSeller = (ownerAddress == marketOrderSeller)

     if(linkedMarketOrder.status != 'valid' || !orderIsFromSeller){ 
         await this.mongoInterface.cachedNFTTileModel.findOneAndUpdate({_id: matchingNFTTile._id},   {buyoutPriceSort: null, lowestBuyoutPriceWei: null, buyoutPriceFromOrderId:null} )
     }

    }
    
  


    /*
  Deprecated 
    */
   /*
    async pollNextValidMarketOrder( ){
        
      
        const STALE_TIME = 1200  * 1000;

        let nextMarketOrder = await this.mongoInterface.marketOrdersModel
        .findOne({lastPolledAt: {$not: {$gte: (Date.now() - STALE_TIME) }}  })

        
        if(nextMarketOrder){ 

          
         // await this.updateMarketOrderStatus(nextMarketOrder)
          //await this.updateNftTilesFromMarketOrder(nextMarketOrder)
          
          await this.mongoInterface.marketOrdersModel.updateOne({_id: nextMarketOrder._id}, {lastPolledAt: Date.now()})


          setTimeout( this.pollNextValidMarketOrder.bind(this), 10)

        }else{
         

          setTimeout( this.pollNextValidMarketOrder.bind(this), 200)
        }

        

    }
*/


  /*
  deprecated
  */
 /*
    async pollNextRecentlyUpdatedERC721Balance(){

      const STALE_TIME = 900 * 1000;

      let beforeTime = (Date.now() - STALE_TIME)

      let nextERC721Balance = await this.vibegraphInterface.erc721BalancesModel
      .findOne( {  tokenIds:{$not:  {$size:0}},   lastPolledAt:  {$not: {$gte: beforeTime }} ,  lastUpdatedAt:  {$gte:   beforeTime  } })
      .sort( { lastUpdatedAt: 1  } )  //sort ASC  - grab the oldest one  
       
        
      if(nextERC721Balance){ 
        console.log('poll recent balance')
         
         await this.updateNftTilesFromERC721Balance(nextERC721Balance)
        
         await this.vibegraphInterface.erc721BalancesModel.updateOne({_id: nextERC721Balance._id}, {lastPolledAt: Date.now()})

         setTimeout( this.pollNextRecentlyUpdatedERC721Balance.bind(this), 0)

      }else{
        console.log('poll recent balance - none')

        setTimeout( this.pollNextRecentlyUpdatedERC721Balance.bind(this), 200)
      }

    }*/


    /*
      deprecated 
    *//*
    async pollNextERC721Balance( ){
        
     

      const STALE_TIME = 6000 * 1000;

      let beforeTime = (Date.now() - STALE_TIME)

      let nextERC721Balance = await this.vibegraphInterface.erc721BalancesModel.findOne( {   tokenIds:{$not:  {$size:0}},   lastPolledAt:  {$not: {$gte: beforeTime }} })
      
       
        
      if(nextERC721Balance){ 
        console.log('poll balance')
         
         await this.updateNftTilesFromERC721Balance(nextERC721Balance)
        
         await this.vibegraphInterface.erc721BalancesModel.updateOne({_id: nextERC721Balance._id}, {lastPolledAt: Date.now()})


         setTimeout( this.pollNextERC721Balance.bind(this), 0)

      }else{
        console.log('poll balance - none')

        setTimeout( this.pollNextERC721Balance.bind(this), 200)
      }
 

  }*/

  //deprecated
  /*
  async updateNftTilesFromERC721Balance(erc721Balance){
      
    let collectionName = AppHelper.contractAddressToCollectionName(erc721Balance.contractAddress)

    if(!collectionName){ 
      console.log('warn: cname', collectionName)
      return
    }

    collectionName = collectionName.toLowerCase()


    let ownerAddress = AppHelper.toChecksumAddress(erc721Balance.accountAddress)
    let ownedTokenIds = erc721Balance.tokenIds


    //faster 
    let update = await this.mongoInterface.cachedNFTTileModel.updateMany(
      {collectionName: collectionName , tokenId: {$in: ownedTokenIds}, ownerPublicAddress: {$ne:ownerAddress } },
      {ownerPublicAddress: ownerAddress}
     )
      if(update.matchedCount > 0){
        console.log('updated ',update)
      }
     
 

  }*/



}