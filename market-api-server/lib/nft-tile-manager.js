
 
  /*

    Packet status:
    active - normal, works
    suspended - invalid token balance or approval (recoverable)
    expired - expired
    burned - sig has burned 


  */

    import BigNumber from 'bignumber.js' 

import Web3Helper from './web3-helper.js'
import BidPacketUtils from '../../src/js/bidpacket-utils.js'

import FileHelper from './file-helper.js'
import APIHelper from './api-helper.js'
import AppHelper from './app-helper.js'
 



/*
  Manual todo:

  -test this new logic 
  -ownerAddressMismatched is no longer a status -> convert that over to 'valid' state 
 
*/

export default class NFTTileManager  {

    constructor(web3, mongoInterface, vibegraphInterface, serverConfig){
        this.mongoInterface = mongoInterface;
        this.vibegraphInterface = vibegraphInterface;
        this.web3 = web3;
        this.serverConfig = serverConfig


        this.pollMarketOrders = true
        this.pollERC721Balances = true

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
    Find orders with state of 'created' 
    mark them with a new status 

    */
    async pollNewlyCreatedMarketOrders( ){
        
      
      //const STALE_TIME = 60  * 1000;
      //let beforeTime = (Date.now() - STALE_TIME)

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

    await this.mongoInterface.marketOrdersModel
    .updateMany({expires: {$le: currentBlockNumber}}, {status: 'expired'})

 

  }





  /*
  As new burned nonces come in, expire all market orders matching them 
  */
  async pollNewBurnedNonces(){


    let nextBurnedNonce = await this.vibegraphInterface.burnedNoncesModel
    .findOne({   lastPolledAt:  {$exists:false} })      
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

    await this.mongoInterface.marketOrdersModel
    .updateMany({nonce:nonce}, {status:'nonceBurned'})



  }


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
    loop through all transfer events one time to update cachedNFTTileOwner
    */
    async pollNextERC721Transfer( ){ 
     

      //const STALE_TIME = 6000 * 1000;

      //let beforeTime = (Date.now() - STALE_TIME)

      let nextERC721Transfer = await this.vibegraphInterface.erc721TransfersModel
      .findOne( {  lastAppliedAt:  {$exists: false} }).
      sort( {  blockNumber: 1,  transactionIndex: 1 } ) ///ascending for both 
       
        
      if(nextERC721Transfer){ 
         console.log('poll xfer ', nextERC721Transfer.blockNumber)
         
         await this.updateNftTileFromERC721Transfer(nextERC721Transfer)
         await this.updateMarketOrdersFromERC721Transfer(nextERC721Transfer)
        
         await this.vibegraphInterface.erc721TransfersModel.updateOne({_id: nextERC721Transfer._id}, {lastAppliedAt: Date.now()})


         setTimeout( this.pollNextERC721Transfer.bind(this), 0)

      }else{
        console.log('poll xfer - none')

        setTimeout( this.pollNextERC721Transfer.bind(this), 200)
      }
 

  }



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

  /*
  Update the owner of the nft tile 

  */
  async updateNftTileFromERC721Transfer(erc721Transfer){
      
    let collectionName = AppHelper.contractAddressToCollectionName(erc721Transfer.contractAddress)

    if(!collectionName){ 
      console.log('warn: cname', collectionName)
      return
    }

    collectionName = collectionName.toLowerCase() 

    let newOwnerAddress = AppHelper.toChecksumAddress(erc721Transfer.to)
    let tokenId = erc721Transfer.tokenId 

    if(erc721Transfer.from == erc721Transfer.to){
      return 
    }

    //faster 
    let update = await this.mongoInterface.cachedNFTTileModel.updateOne(
      {collectionName: collectionName , tokenId: tokenId  },
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

       /* await this.mongoInterface.marketOrdersModel.updateOne(
          {_id: marketOrder._id },
          {status: "ownerAddressMismatched"}
        )*/

        await this.updateNftTilesFromMarketOrder(marketOrder)

      }

      let marketOrdersTo = await this.mongoInterface.marketOrdersModel.find(
        {nftContractAddress: contractAddress, nftTokenId: tokenId, orderCreator: erc721Transfer.to  })

      for(let marketOrder of marketOrdersTo){

       /* await this.mongoInterface.marketOrdersModel.updateOne(
          {_id: marketOrder._id },
          {status: "ownerAddressMismatched"}
        )*/

        await this.updateNftTilesFromMarketOrder(marketOrder)

      }
  
  

    }

    async updateMarketOrderStatus(marketOrder){

      let newMarketOrderStatus = 'valid'
      let collectionName = AppHelper.contractAddressToCollectionName(marketOrder.nftContractAddress)
      let orderCreator = AppHelper.toChecksumAddress(marketOrder.orderCreator)
      let currentBlockNumber = this.blockNumber 

      if(!collectionName){ 
        console.log('WARN: could not update market order ', collectionName )
        return
      }

      collectionName = collectionName.toLowerCase()

      if(!currentBlockNumber){
        console.log('WARN: no block number to update market order status')
        return
      }

      //find matching nft, make sure the owner is equal to this market order owner 
      //if not , it is an invalid order to make it as such 
      let matchingNFTTile = await this.mongoInterface.cachedNFTTileModel.findOne({collectionName: collectionName , tokenId: marketOrder.nftTokenId })
      
      if(!matchingNFTTile){
        console.log('WARN: no matching nft tile ',collectionName,marketOrder.nftTokenId  )
      }


      //if the order would revert in solidity we mark is as not valid 
     /* if(matchingNFTTile && marketOrder.isSellOrder && matchingNFTTile.ownerPublicAddress && orderCreator != AppHelper.toChecksumAddress(matchingNFTTile.ownerPublicAddress)   ){
        newMarketOrderStatus = 'ownerAddressMismatched'
      }*/

      if(marketOrder.expires < currentBlockNumber){
        newMarketOrderStatus = 'expired'
      }
      
      let matchingBurnedNonce = await this.vibegraphInterface.burnedNoncesModel.findOne({nonce: marketOrder.nonce})
      
      if(matchingBurnedNonce){       
        newMarketOrderStatus = 'nonceBurned'
      }


      await this.mongoInterface.marketOrdersModel.updateOne({_id: marketOrder._id}, {status: newMarketOrderStatus})
    
      await this.updateNftTilesFromMarketOrder(marketOrder)
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

     // let orderCreator = AppHelper.toChecksumAddress(marketOrder.orderCreator)
      let orderBuyoutPriceWei = marketOrder.currencyTokenAmount
      let orderCollectionName = AppHelper.contractAddressToCollectionName(marketOrder.nftContractAddress)

      if(!orderCollectionName){ 
        console.log('Warn: could not update nft tile from market order ', orderCollectionName )
        return
      }

      orderCollectionName = orderCollectionName.toLowerCase()

      let matchingNFTTile = await this.mongoInterface.cachedNFTTileModel.findOne({collectionName: orderCollectionName , tokenId: marketOrder.nftTokenId })


      if(!matchingNFTTile){
        console.log('WARN: no matching nft tile ', orderCollectionName, marketOrder.nftTokenId )
        return 
     }


      let ownerAddress = AppHelper.toChecksumAddress(matchingNFTTile.ownerPublicAddress)

      let marketOrderSeller = AppHelper.toChecksumAddress(marketOrder.orderCreator)

      let orderIsFromSeller = (ownerAddress == marketOrderSeller)

      if(marketOrder.status == 'valid' && orderIsFromSeller){  
           
            if( (!matchingNFTTile.buyoutPriceSort || !matchingNFTTile.lowestBuyoutPriceWei || !matchingNFTTile.buyoutPriceFromOrderId || matchingNFTTile.lowestBuyoutPriceWei > orderBuyoutPriceWei )){
              await this.mongoInterface.cachedNFTTileModel.updateOne({_id: matchingNFTTile._id}, 
                {buyoutPriceSort: -1*orderBuyoutPriceWei , lowestBuyoutPriceWei: orderBuyoutPriceWei, buyoutPriceFromOrderId: AppHelper.mongoIdToNumber(marketOrder._id) })
            }
          

      }else{  

            //if this nft tile is getting its buyout price from this invalid order, wipe the nft tile buyout price 
            if( matchingNFTTile.buyoutPriceFromOrderId && AppHelper.mongoIdToNumber(marketOrder._id) == matchingNFTTile.buyoutPriceFromOrderId){
                await this.mongoInterface.cachedNFTTileModel.findOneAndUpdate({_id: matchingNFTTile._id},   {buyoutPriceSort: null, lowestBuyoutPriceWei: null, buyoutPriceFromOrderId:null} )
            
                await this.findBestFallbackBuyoutPriceForNftTile(  marketOrder.nftContractAddress, marketOrder.nftTokenId )
             }
 
      } 

    }


    async findBestFallbackBuyoutPriceForNftTile(nftContractAddress,nftTokenId){

      let collectionName = AppHelper.contractAddressToCollectionName(nftContractAddress)

      if(!collectionName){ 
        console.log('Warn: could not update nft tile for fallback buyout price', collectionName )
        return
      } 

      let matchingNFTTile = await this.mongoInterface.cachedNFTTileModel.findOne({collectionName: collectionName , tokenId:  nftTokenId })
  
      if(!matchingNFTTile){
        console.log('WARN: no matching nft tile ', collectionName,  nftTokenId )
        return 
     }

      let ownerAddress = AppHelper.toChecksumAddress(matchingNFTTile.ownerPublicAddress)

      let marketOrder = await this.mongoInterface.marketOrdersModel
      .findOne({nftContractAddress:  nftContractAddress, nftTokenId: nftTokenId, status: 'valid', orderCreator: ownerAddress })
      .sort( {currencyTokenAmount: 1}  )
      //fidn the one with the lowest price 

      if(marketOrder){

        let orderBuyoutPriceWei = marketOrder.currencyTokenAmount

        await this.mongoInterface.cachedNFTTileModel.updateOne({_id: matchingNFTTile._id}, 
        {buyoutPriceSort: -1*orderBuyoutPriceWei , lowestBuyoutPriceWei: orderBuyoutPriceWei, buyoutPriceFromOrderId: AppHelper.mongoIdToNumber(marketOrder._id) })
      
      }
    


    }
    
  

}