<template>

<div>

   <div class="section    border-b-2 border-black px-0 lg:px-1">

     <div class=" ">
        <Navbar 
        v-bind:web3Plug="web3Plug"
       />
     </div>


   </div>

  
   <div class="section  border-b-2 border-black ">


     <div class=" container mb-16 margin-center">
      
       <div class="grid md:grid-cols-2 mt-32">

         


         <div class="column  py-8">


             

             <div class="w-row">

                 <div class="pt-8 relative pb-2 mb-2" style="min-height:100px">
                         
                      <div  class=" font-serious  text-white text-3xl p-2" style="   " > Most Popular Collections </div>

                </div>


                <div class="p-2">
                  
                 

                  <div v-for="item of mainTiles" :key="item.name" class="inline-block">

                    <router-link :to="'/collection/'+item.name" > 

                      <div class="border-gray-200 border-2   p-2 m-2 "  > 
                         <img :src="getImageURL(item.imgurl)" style="max-width:200px" />

                         <div class="text-center text-white font-serious"> {{item.title}} </div>
                      </div>  


                    </router-link>

                    
                  </div>
                  
                </div>

            </div>


            

        
 

         </div>

 
         <div class="   column    text-center ">

              <div class="py-32 " style="width:50%; margin: 0 auto;"> 
              

                 <div class="pt-8 relative pb-2 mb-2" style="min-height:100px">

                           <img src="@/assets/images/on2logo_md.png" style="max-height:50px; margin:0 auto;" />


                      <div  class="  hidden text-white text-md p-2 font-boring " style="   " > (On Secondary) </div>

                        
                </div>

              
                <div class=" relative pb-2 mb-12" style="min-height:200px">
                       
                  <div class="font-serious text-white text-2xl p-2" style="background: #222b"> Curated NFT Marketplace </div>

                </div>

                   <div> 
 

                     <div class="w-row text-center my-8"> 
                        <router-link to="/activity" class='font-serious text-orange-600 text-xl block'> View Recent Activity</router-link>
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
 
 

export default {
  name: 'Home',
  props: [],
  components: {Navbar, Footer },
  data() {
    return {
      web3Plug: new Web3Plug() ,
      activePanelId: null,
      
      
      mainTiles: [
        {title:'Cryptoadz', name:'cryptoadz', imgurl: 'cryptoad.png'},
        {title:'Cryptoflyz', name:'cryptoflyz', imgurl: 'cryptofly.png'},
        {title:'Bored Apes', name:'boredapes', imgurl: 'boredape.png'},
        {title:'Mutant Apes', name:'mutantapes', imgurl: 'mutantape.png'} ,
        {title:'Cool Cats', name:'coolcats', imgurl: 'coolcat.png'} ,
        {title:'Doodles', name:'doodles', imgurl: 'doodle.png'} 

      ]
        
      
    }
  },

  created(){

 
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
          getImageURL(name){
             return require('@/assets/images/' + name)
          }
          

  }
}
</script>
