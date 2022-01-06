
 
import web3 from 'web3'
const web3utils = web3.utils

export default class IndexerERC721Custom{

    static async modifyLedgerByEvent(event,mongoInterface){

        await IndexerERC721Custom.modifyERC721LedgerByEvent(event,mongoInterface)

    }
 
  

    static async modifyERC721LedgerByEvent(event,mongoInterface){
        
        let eventName = event.event 

        if(!eventName){
            console.log('WARN: unknown event in ', event.transactionHash )
            return 
        }
        eventName = eventName.toLowerCase()
        

        let outputs = event.returnValues
 
        let contractAddress = web3utils.toChecksumAddress(event.address)
       

        if(eventName == 'transfer' ){
            let from = web3utils.toChecksumAddress(outputs['0'] )
            let to = web3utils.toChecksumAddress(outputs['1'] )
            let tokenId = parseInt(outputs['2'])

            await IndexerERC721Custom.setOwnerOfERC721Token( to ,contractAddress , tokenId  ,mongoInterface) 

            await IndexerERC721Custom.removeERC721TokenFromAccount( from ,contractAddress , tokenId  ,mongoInterface )
            await IndexerERC721Custom.addERC721TokenToAccount( to ,contractAddress , tokenId  ,mongoInterface) 
        }

        if(eventName == 'transfersingle' ){
            let from = web3utils.toChecksumAddress(outputs._from )
            let to = web3utils.toChecksumAddress(outputs._to )
            let tokenId = parseInt(outputs._id)

            await IndexerERC721Custom.setOwnerOfERC721Token( to ,contractAddress , tokenId  ,mongoInterface) 

            await IndexerERC721Custom.removeERC721TokenFromAccount( from ,contractAddress , tokenId  ,mongoInterface )
            await IndexerERC721Custom.addERC721TokenToAccount( to ,contractAddress , tokenId  ,mongoInterface ) 
        }
       
    }

    static async removeERC721TokenFromAccount( accountAddress ,contractAddress , tokenId ,mongoInterface ){
        tokenId = parseInt(tokenId)

        let existingAccount = await mongoInterface.findOne('erc721_balances', {accountAddress: accountAddress, contractAddress: contractAddress }  )

        if(existingAccount){
            let tokenIdsArray = existingAccount.tokenIds

            let index = tokenIdsArray.indexOf( tokenId );
            if (index > -1) {
                tokenIdsArray.splice(index, 1);
            }

            await mongoInterface.updateOne('erc721_balances', {accountAddress: accountAddress, contractAddress: contractAddress}, {tokenIds: tokenIdsArray, lastUpdatedAt: Date.now() } )
        }else{
            await mongoInterface.insertOne('erc721_balances', {accountAddress: accountAddress, contractAddress: contractAddress, tokenIds: [] , lastUpdatedAt: Date.now() }   )
        }
    }

    static async addERC721TokenToAccount( accountAddress ,contractAddress , tokenId  ,mongoInterface){
        tokenId = parseInt(tokenId)
        
        let existingAccount = await mongoInterface.findOne('erc721_balances', {accountAddress: accountAddress, contractAddress: contractAddress }  )

        if(existingAccount){
            let tokenIdsArray = existingAccount.tokenIds

            tokenIdsArray.push(tokenId)

            await mongoInterface.updateOne('erc721_balances', {accountAddress: accountAddress, contractAddress: contractAddress}, {tokenIds: tokenIdsArray , lastUpdatedAt: Date.now()  } )
        }else{
            await mongoInterface.insertOne('erc721_balances', {accountAddress: accountAddress, contractAddress: contractAddress, tokenIds: [tokenId] , lastUpdatedAt: Date.now()  }   )
        }
    }


    static async setOwnerOfERC721Token( accountAddress ,contractAddress , tokenId  ,mongoInterface){
        tokenId = parseInt(tokenId)

        await mongoInterface.updateOne('erc721_token', 
        {tokenId: tokenId, contractAddress: contractAddress },
        {tokenId: tokenId, contractAddress: contractAddress, ownerAddress: accountAddress , lastUpdatedAt: Date.now()  }, 
        {upsert:true } )
        
        
        /*
        let existingEntry = await mongoInterface.findOne('erc721_token', {tokenId: tokenId, contractAddress: contractAddress }  )

        if(existingEntry){ 
            await mongoInterface.updateOne('erc721_token', {tokenId: tokenId, contractAddress: contractAddress}, {ownerAddress: accountAddress , lastUpdatedAt: Date.now()  } )
        }else{
            await mongoInterface.insertOne('erc721_token', {tokenId: tokenId, contractAddress: contractAddress, ownerAddress: accountAddress , lastUpdatedAt: Date.now()  }   )
        }*/
    }




}