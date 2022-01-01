<template>
 

    <div class=" m-2 border-black border-2 rounded bg-gray-100 inline-block" >
    
     <router-link v-bind:to="getLinkUrl()" class=" cursor-pointer select-none inline-block m-4 mb-0 relative"   >

          <img v-bind:src="getImageURL()" width="128" height="128"  />

     </router-link>

    <div class="mb-2 text-sm px-2 text-gray-800 font-boring"  > 
      <div class="text-center">  {{getTitle()}} </div>  
      <div> Owned By <a v-bind:href="getOwnerURL()">{{getOwnerName()}} </a> </div>  
      <div class="text-right"> 
        <router-link v-bind:to="getLinkUrl()" class=" cursor-pointer select-none inline-block"   >
         <span v-if="getBuyoutPrice()"> Buyout for {{getBuyoutPrice()}} </span>
          </router-link>          
          </div>  
    </div>
    </div>



 
</template>


<script>

import MathHelper from '../../js/math-helper.js'

import AssetDataHelper from '../../js/asset-data-helper.js'

export default {
  name: 'NftTile',
  props: ['collectionName',  'nftTokenId', 'nftData'],
  data() {
    return {
      
    }
  },
  created(){

   

  },
  methods: {

    getTitle(){
      if(this.nftData){

        return this.nftData.collectionName.concat(' #').concat(this.nftTokenId)

       }
          return ''
      },
      
      getLinkUrl(){

        //return `https://artblocks.io/token/${this.nftTokenId}.png` 
        return `/collection/${this.collectionName}/${this.nftTokenId}` 
      },



      getImageURL(){

        return AssetDataHelper.getImageURL(this.collectionName,this.nftTokenId) 

      },
 

      getOwnerName(){

        if(this.nftData){
         let address = this.nftData.ownerPublicAddress

        if(address){


          return address.substring(0,6)
        }
        }

     
 
        return 'Unknown'
      },

      getOwnerURL(){
        
        if(this.nftData && this.nftData.ownerPublicAddress){
          return '/account/'.concat(this.nftData.ownerPublicAddress)
        }

        return '#'
      },

      getBuyoutPrice(){

        if(this.nftData && this.nftData.lowestBuyoutPriceWei){
          let formattedAmount= MathHelper.rawAmountToFormatted(this.nftData.lowestBuyoutPriceWei,18)
          return MathHelper.formatFloat(formattedAmount)
        }

        return undefined 
        

      }
  }
}
</script>
