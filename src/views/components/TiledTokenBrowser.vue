<template>
  <div  >

    <div v-if="currentFilter && currentFilter.traitName" @click="clearFilters" class="bg-gray-100 mb-2 p-2 rounded border-gray-800 border-2 inline-block  text-red-500 cursor-pointer"> 
      X  
    </div>

    <div v-if="currentFilter && currentFilter.traitName" class="bg-gray-100 mb-2 p-2 rounded border-gray-800 border-2 inline-block  text-black"> 
      {{currentFilter.traitName}}: {{currentFilter.traitValue}} 
      
    </div>
         
         
         
         
          <div class="" style="min-height:400px">

             <LoadingSpinner
                  v-if="isLoading"
                 />



              <NftTile
                v-for="tokenData in activeNFTDataArray"
                v-bind:key="tokenData.tokenId"
              
                v-bind:collectionName="tokenData.collectionName"
                v-bind:nftTokenId="tokenData.tokenId"

                v-bind:nftData="tokenData"
 

                v-bind:clickedTileCallback="clickedTileCallback"
               />

            </div>

            <PaginationBar 
              :currentPage="currentPage"
              :maxPages="maxPages"
              :setCurrentPageCallback="setCurrentPageCallback"
             />


           </div>


</template>


<script> 
import StarflaskApiHelper from '../../js/starflask-api-helper.js'

import NftTile from './NftTile.vue';
import PaginationBar from './PaginationBar.vue';


const envName = process.env.NODE_ENV

const FrontendConfig = require('../../config/FrontendConfig.json')[envName]

export default {
  name: 'TiledTokenBrowser',
  props: [ 'collectionName', 'currentFilter', 'updatedCurrentPageCallback' , 'clearFiltersCallback'],
  components: {NftTile,PaginationBar},
  watch: {
    currentFilter: {
      immediate: true,
      deep: true,
      handler(newValue, oldValue) {
        
        this.fetchFilteredTokensArray()
      }
    }
  },

  data() {
    return {
     // collectionName: null,
       
      isLoading: true,

      tilesDataArray : [],
   
      activeNFTDataArray: [],
      currentPage: 1,
      maxPages: 1,
      itemsPerPage: 25

    }
  },
  created(){
    
  },
  mounted(){
    if(this.$route.query.page){
      this.currentPage = this.$route.query.page
    }
    if(isNaN(this.currentPage) || this.currentPage < 1){
      this.currentPage = 1
    }

    this.$router.replace({ query: {page: this.currentPage} });
     

    this.fetchFilteredTokensArray()

  },
  methods: {
      async fetchFilteredTokensArray(){
        console.log('fetching results  - new current filter ', this.currentFilter)
       

         let uri = FrontendConfig.marketApiRoot+'/api/v1/apikey'
          
 
         let inputQuery = Object.assign( {
           collectionName: this.collectionName,
           page: this.currentPage,
           maxItemsPerPage: this.itemsPerPage
          
          }, this.currentFilter   )

          this.isLoading=true

         let result = await StarflaskApiHelper.resolveStarflaskQuery(uri,{"requestType": "NFTTiles_by_trait_value", "input": inputQuery})
           
           let input = result.input 
           let output = result.output  

            this.isLoading=false
 
           if(input && input.traitValue == this.currentFilter.traitValue && output){
               
                this.tilesDataArray = output.tiles
              

                this.maxPages = Math.ceil( output.totalTilesInGroup  / this.itemsPerPage ) + 1
                this.activeNFTDataArray = this.filterTokensForCurrentPage(this.tilesDataArray)

                console.log('max pages ', this.maxPages)

              console.log('this.activeNFTDataArray',this.activeNFTDataArray)
 
           }
        
      },



      forceSetPage( newPage ){
        this.currentPage = newPage  
      },

      filterTokensForCurrentPage(allTokenData){   

         return allTokenData.slice(0,this.itemsPerPage) 
      },

      clearFilters(){
        this.clearFiltersCallback()
      },

      async setCurrentPageCallback(newPage){
         
        this.currentPage = newPage  

        await this.fetchFilteredTokensArray()

        this.updatedCurrentPageCallback(this.currentPage)
       

      },

      clickedTileCallback(row){
        //this.clickedTileCallback(row)
      }
  }
}
</script>
