<template>
  <div class="font-boring">


     <div class="text-lg font-bold mb-8 font-fun  text-black"> Transfer Asset </div> 

 
 
            <div class="mb-4 ">
              <label   class="block text-md font-medium font-bold text-gray-800  ">Recipient Address</label>

              <div class="flex flex-row">
                <div class="  px-4">
                    <input type="string" v-on:blur="handleAmountBlur()"  v-model="formInputs.recipientAddress"  class="text-gray-900 border-2 border-black font-bold px-4 text-md focus:ring-indigo-500 focus:border-indigo-500 block w-full py-4 pl-7 pr-12   border-gray-300 rounded-md" placeholder="0x..">
                </div>  
              </div>


                <div class="flex flex-row overflow-hidden" v-if="formInputs.recipientAddress">
                <div class="  py-4 text-gray-700  ">
                   Transferring this NFT to {{ formInputs.recipientAddress }}
                </div>  
              </div>
           
           
            </div>
 


          <div v-if="submittedTransferInputs"  class="mt-16">

             <label class="text-black "> Transfer submitted successfully! </label>

          </div>

          <div v-if="connectedToWeb3()">
           <div v-if="!submittedTransferInputs ">

              <div class="my-8 "  >

                 <div  class="p-2 px-8 text-black border-2 border-black inline cursor-pointer bg-green-400 rounded hover:bg-green-200" @click="submitTransfer"> Transfer </div>

                
            </div>


          </div>
          </div>

          <div class="my-8 text-white" v-if="!connectedToWeb3()">

                 <div   class="p-2 px-8 border-2 border-black inline cursor-pointer bg-blue-400 rounded hover:bg-blue-200" @click="connectToWeb3"> Connect to Web3 </div>
                   
             </div>




            
 



  </div>
</template>


<script>

import EIP721Utils from '../../js/EIP712Utils'
import StarflaskAPIHelper from '../../js/starflask-api-helper'


const web3utils = require('web3').utils



const envName = process.env.NODE_ENV

const FrontendConfig = require('../../config/FrontendConfig.json')[envName]
 
export default {
  name: 'TransferForm',
  props: ['web3Plug','nftContractAddress',  'nftTokenId',    'txSubmittedCallback'],
  data() {
    return {
      hasApprovedAll: false,
      submittedTransferInputs : null,
      
      formInputs: { 
        recipientAddress: ""  
      }
    }
  },
  created(){
    //poll for has approved all 

   

  },
  methods: {
      
     

       
        getCurrencyAmountRaw(){
          return this.web3Plug.formattedAmountToRaw(this.formInputs.currencyAmountFormatted, 18)
        },

 
    

        async getInputExpirationBlock(){

          let currentBlock = await this.web3Plug.getBlockNumber()
          return currentBlock + parseInt(this.formInputs.expiresInBlocks)
        },

       


        async submitTransfer(){
 
          
          let activeNetworkId = this.web3Plug.getActiveNetId()   
          if(!activeNetworkId) activeNetworkId = 1;   
 
            

          let nftContract = this.web3Plug.getNFTContract( this.nftContractAddress )

          let from = this.web3Plug.getActiveAccountAddress()
          let to = this.formInputs.recipientAddress
          let tokenId = this.nftTokenId

          let xferMethod = nftContract.methods.transferFrom(from, to, tokenId )  
 
          let result = await xferMethod.send({from: from})


          if( result ){
            this.submittedTransferInputs = {from,to,tokenId}
            this.txSubmittedCallback()
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
