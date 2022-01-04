<template>

<div>

   <div class="section    border-b-2 border-black px-0 lg:px-1">

     <div class=" ">
        <Navbar 
        v-bind:web3Plug="web3Plug"
       />
     </div>


   </div>



  <div v-if="collectionName=='cryptoadz'" class="section  border-b-2 border-black ">


     <div class=" container mb-16 margin-center">
      
       <div class="grid md:grid-cols-2 mt-32">
 

         <div class="column  py-8">

 

            <div class="pt-8 relative pb-2 mb-2" style="min-height:100px">
                       
                    <img  class=" text-2xl p-2"  src="@/assets/images/SwampzHeader.png" />


         </div>

 
 

         </div>

 
         <div class="   column    text-center ">

              <div class="py-32 " style="width:50%; margin: 0 auto;"> 
              

                
              
                 <div class=" relative pb-2 mb-12" style="min-height:200px">
                       
                    <div  class="   text-white text-2xl p-2 " style="  background: #222b" > Open Source Cryptoadz Marketplace </div>


                </div>

                   <div> 
 

                     <div class="w-row text-center my-8"> 
                        <router-link to="/activity" class='text-orange-600 text-xl block'> View Recent Activity</router-link>
                    </div>


                  <div class="w-row text-center my-8">  
            
                      <router-link to="/collection/cryptoadz" class='text-gray-200 text-xl inline text-align:center' style="margin:0 auto;"> Shop Toadz </router-link>
                        
                    
                  </div>

                    <div class="w-row text-center my-8">  
        
                      <router-link to="/collection/cryptoflyz" class='text-gray-200 text-xl inline text-align:center ' style="margin:0 auto;"> Shop Flyz </router-link>
                        
                   </div>


                  </div> 

              </div>
 
         </div>
       </div>
     </div>
   </div>


  
   <div v-if="collectionName=='boredapes'" class="section  border-b-2 border-black ">


     <div class=" container mb-16 margin-center">
      
       <div class="grid md:grid-cols-2 mt-32">

         


         <div class="column  py-8">


             

             <div class="w-row">
               <BananaMedia  /> 

            </div>
 
 

         </div>

 
         <div class="   column    text-center ">

              <div class="py-32 " style="width:50%; margin: 0 auto;"> 
              

                 <div class="pt-8 relative pb-2 mb-2" style="min-height:100px">
                       
                    <img  class=" text-2xl p-2"  src="@/assets/images/BAYC_header.png" />


                </div>

              
                 <div class=" relative pb-2 mb-12" style="min-height:200px">
                       
                    <div  class="   text-white text-2xl p-2" style="  background: #222b" > Open Source Unofficial Marketplace </div>


                </div>

                   <div> 
 

                     <div class="w-row text-center my-8"> 
                        <router-link to="/activity" class='text-orange-600 text-xl block'> View Recent Activity</router-link>
                    </div>


                  <div class="w-row text-center my-8">  
            
                      <router-link to="/collection/boredapes" class='text-gray-200 text-xl inline text-align:center' style="margin:0 auto;"> Shop Bored Apes </router-link>
                        
                    
                  </div>

                    <div class="w-row text-center my-8">  
        
                      <router-link to="/collection/mutantapes" class='text-gray-200 text-xl inline text-align:center ' style="margin:0 auto;"> Shop Mutant Apes </router-link>
                        
                   </div>


                  </div> 

              </div>
 
         </div>
       </div>
     </div>
   </div>


  


   



    
  <Footer/>

</div>
</template>


<script>



import Web3Plug from '../js/web3-plug.js' 

 
import Navbar from './components/Navbar.vue';
 
import Footer from './components/Footer.vue';
import BananaMedia from './components/BananaMedia.vue'
 

export default {
  name: 'Home',
  props: [],
  components: {Navbar, Footer, BananaMedia},
  data() {
    return {
      web3Plug: new Web3Plug() ,
      activePanelId: null ,
      collectionName: null
        
      
    }
  },

  created(){


    let queryCollectionName =  this.$route.params.collectionName
    if(queryCollectionName){      
         this.collectionName = queryCollectionName.toLowerCase()
    }

 
    this.web3Plug.getPlugEventEmitter().on('stateChanged', function(connectionState) {
        console.log('stateChanged',connectionState);
         
        this.activeAccountAddress = connectionState.activeAccountAddress
        this.activeNetworkId = connectionState.activeNetworkId
 

         
      }.bind(this));
   this.web3Plug.getPlugEventEmitter().on('error', function(errormessage) {
        console.error('error',errormessage);
         
        this.web3error = errormessage
       
      }.bind(this));

      this.web3Plug.reconnectWeb()

         
    
  },
  mounted: function () {
    
   
   
  }, 
  methods: {
          setActivePanel(panelId){
              if(panelId == this.activePanelId){
                this.activePanelId = null;
                return 
              }
               this.activePanelId = panelId ;
          },
          onTabSelect(tabname){
            console.log(tabname)

              this.selectedTab = tabname.toLowerCase()


          },
          

  }
}
</script>
