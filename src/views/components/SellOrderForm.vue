<template>
  <div class="font-boring">


     <div class="text-lg font-bold mb-8 font-fun  text-black"> Create Sell Order </div> 


              <div v-if="!hasApprovedAll">


                    
                <div class="my-8 ">

                  <div class="p-2 px-8 border-2 border-black text-black inline cursor-pointer bg-green-400 rounded hover:bg-green-200" @click="approveAllNFT"> Approve All </div>
                
                </div>


              </div> 


             <div v-if="hasApprovedAll">


                 <div class="mb-4 ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Buyout Price (ETH)</label>

              <div class="flex flex-row">
                <div class="w-1/2 px-4">
                    <input type="number" v-on:blur="handleAmountBlur()"  v-model="formInputs.currencyAmountFormatted"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="0">
                </div>  
              </div>
           
            </div>


           <div class="mb-4 ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Blocks until offer expiration  (~{{getDaysFromBlocks(formInputs.expiresInBlocks)}}  days) </label>

              <div class="flex flex-row">
                  <div class="w-1/2 px-4">
                      <input type="number"  v-model="formInputs.expiresInBlocks"  class="text-gray-900 border-2 border-black font-bold px-4 text-xl focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="5000">
                  </div>

                   
              </div>
           
            </div>




          <div v-if="submittedSellOrderInputs && interactionMode!='lowerPrice'"  class="mt-16">

             <label class="text-black "> Sell order submitted successfully! </label>

          </div>

          <div v-if="connectedToWeb3()">
           <div v-if="!submittedSellOrderInputs || interactionMode=='lowerPrice'">

              <div class="my-8 " v-if="formInputs.currencyAmountFormatted>0">

              <div v-if="interactionMode!='lowerPrice'" class="p-2 px-8 text-black border-2 border-black inline cursor-pointer bg-green-400 rounded hover:bg-green-200" @click="createSellOrder"> Sell </div>

               <div  v-if="interactionMode=='lowerPrice'" class="p-2 px-8 text-black border-2 border-black inline cursor-pointer bg-green-400 rounded hover:bg-green-200" @click="createSellOrder"> Lower Price </div>
            </div>


          </div>
          </div>

          <div class="my-8 text-white" v-if="!connectedToWeb3()">

                 <div   class="p-2 px-8 border-2 border-black inline cursor-pointer bg-blue-400 rounded hover:bg-blue-200" @click="connectToWeb3"> Connect to Web3 </div>
                   
             </div>




            

          </div>  

            



  </div>
</template>


<script>

import EIP721Utils from '../../js/EIP712Utils'
import StarflaskAPIHelper from '../../js/starflask-api-helper'


const web3utils = require('web3').utils



const envName = process.env.NODE_ENV

const FrontendConfig = require('../../config/FrontendConfig.json')[envName]

const offchainOrderPacketConfig = require('../../js/eip712-config.json')

export default {
  name: 'SellOrderForm',
  props: ['web3Plug','nftContractAddress',  'nftTokenId', 'interactionMode' , 'bestSellOrder' , 'orderSubmittedCallback'],
  data() {
    return {
      hasApprovedAll: false,

      submittedSellOrderInputs: null,
      
      formInputs: {

        currencyAmountFormatted: 0,
        expiresInBlocks: 50000
      }
    }
  },
  created(){
    //poll for has approved all 

    this.checkForApproval()

    setInterval(this.checkForApproval,8000);

  },
  methods: {
      
     

       getDaysFromBlocks(blocks){
          return parseFloat(blocks / 5760).toFixed(2)
        },

        getCurrencyAmountRaw(){
          return this.web3Plug.formattedAmountToRaw(this.formInputs.currencyAmountFormatted, 18)
        },


        async checkForApproval(){ 

            let activeNetworkId = this.web3Plug.getActiveNetId() 

            if(!activeNetworkId) activeNetworkId = 1;   
 
            let contractData = this.web3Plug.getContractDataForNetworkID(activeNetworkId)


          let storeContractAddress = contractData['blockstore'].address
  

          let response = await this.web3Plug.getNFTAllowance(  this.nftContractAddress, storeContractAddress, this.web3Plug.getActiveAccountAddress() )

           
        if(response){
            this.hasApprovedAll = true 
          }else{
            this.hasApprovedAll = false 
          }

        return this.hasApprovedAll
          
          


        },

        async approveAllNFT(){
          console.log('approve all ')

           let activeNetworkId = this.web3Plug.getActiveNetId()   
             if(!activeNetworkId) activeNetworkId = 1;   
 
            let contractData = this.web3Plug.getContractDataForNetworkID(activeNetworkId)


          let storeContractAddress = contractData['blockstore'].address
  


          let response = await this.web3Plug.getNFTContract(this.nftContractAddress).methods.setApprovalForAll( storeContractAddress, true ).send( {from: this.web3Plug.getActiveAccountAddress()}  )


        },

        async handleAmountBlur(){
         
         


        },


        async getInputExpirationBlock(){

          let currentBlock = await this.web3Plug.getBlockNumber()
          return currentBlock + parseInt(this.formInputs.expiresInBlocks)
        },

        generateRandomNonce(){
          return web3utils.randomHex(32).toString()
        },



        async createSellOrder(){

          const NATIVE_ETH = "0x0000000000000000000000000000000000000010"


          
             let activeNetworkId = this.web3Plug.getActiveNetId()   
             if(!activeNetworkId) activeNetworkId = 1;   
 
            let contractData = this.web3Plug.getContractDataForNetworkID(activeNetworkId)


          let storeContractAddress = contractData['blockstore'].address


          let nonce = this.generateRandomNonce() 

          if(this.interactionMode=='lowerPrice'){

            nonce = this.bestSellOrder.nonce 
          }
 
          let inputValues = {
            orderCreator:this.web3Plug.getActiveAccountAddress(),
            isSellOrder:true,
            nftContractAddress:this.nftContractAddress,
            nftTokenId:this.nftTokenId,
            currencyTokenAddress:NATIVE_ETH,
            currencyTokenAmount: this.getCurrencyAmountRaw().toString(),
            nonce: nonce.toString(),
            expires: await this.getInputExpirationBlock(),



          }

          inputValues.chainId = this.web3Plug.getActiveNetId()
          inputValues.storeContractAddress = storeContractAddress

          console.log('inputValues',inputValues)

          let metamaskResponse = await EIP721Utils.performOffchainSignForPacket(
            inputValues.chainId,
            inputValues.storeContractAddress,
            offchainOrderPacketConfig,
            inputValues,
            this.web3Plug.getWeb3Instance(),
            inputValues.orderCreator
            
            )


            //send this to the marketServer with axios post 

            inputValues.signature = metamaskResponse.signature 

           

            //send this to the marketServer with axios post 
            let result = await StarflaskAPIHelper.resolveStarflaskQuery(
              FrontendConfig.marketApiRoot+'/api/v1/key',
              {requestType:'save_new_order',input: inputValues})

            if(result.success){
              this.submittedSellOrderInputs = inputValues
              this.orderSubmittedCallback()
            }
         


        },
          connectedToWeb3(){
          return this.web3Plug.connectedToWeb3()
        },

        connectToWeb3(){
          this.web3Plug.connectWeb3()
        }

  }
}
</script>
