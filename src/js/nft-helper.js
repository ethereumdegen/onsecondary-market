
  
 
export default class NFTHelper {


     
    static async getOwnerOfNFT( nftContractAddress, tokenId, web3Plug ){

         let tokenOwner = null

        let nftTokenContract = web3Plug.getNFTContract(nftContractAddress)  

        console.log('get owner, ', nftContractAddress, tokenId)

        try{
          tokenOwner = await nftTokenContract.methods.ownerOf( tokenId  ).call();
        }catch(e){
            console.error(e)
        }

        return tokenOwner
    }

    static async getProjectIdOfNFT( nftContractAddress, tokenId, web3Plug ){

        let tokenOwner = null

       let nftTokenContract = web3Plug.getNFTContract(nftContractAddress)  

       console.log('get project id, ', nftContractAddress, tokenId)

       try{
         tokenOwner = await nftTokenContract.methods.tokenIdToProjectId( tokenId  ).call();
       }catch(e){
           console.error(e)
       }

       return tokenOwner
   }



        static async approveNFTTypeToBuyTheFloor(nftTokenAddress, web3Plug){

            let contractData = web3Plug.getContractDataForActiveNetwork()

            let contract = web3Plug.getNFTContract(  nftTokenAddress )
            
            let btfContractAddress =  contractData['buythefloor'].address

            return await contract.methods.setApprovalForAll( btfContractAddress ,true  ).send({ from:  web3Plug.getActiveAccountAddress() })


        } 


    static async hasGivenApprovalofNFTForBTF(nftContractAddress,   web3Plug ){

        let isApproved = false

       let nftTokenContract = web3Plug.getNFTContract(nftContractAddress) 


       let contractData = web3Plug.getContractDataForActiveNetwork()
       
       let btfContractAddress = contractData['buythefloor'].address

       try{
        isApproved = await nftTokenContract.methods.isApprovedForAll(  web3Plug.getActiveAccountAddress(), btfContractAddress   ).call();
       }catch(e){
           console.error(e)
       }
            console.log('isApproved',nftContractAddress, web3Plug.getActiveAccountAddress(), btfContractAddress , isApproved)
       return isApproved
   }


     
 

 
 




}