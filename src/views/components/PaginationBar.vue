<template>
  <div v-if="maxPages>0"  class=" text-gray-800 mt-8  "  style="min-height:60px"  >

     <div  
     v-if="currentPage>1"
    class="select-none bg-gray-300 hover:bg-blue-400 cursor-pointer p-4 mx-2 my-4 border-black border-2 rounded-lg inline " 
      
     @click="setCurrentPageCallback(currentPage-1)" >
        {{'<' }}
    </div>
     
    <div v-for="tab in tabLabels" 
    class="select-none bg-gray-300 hover:bg-blue-400 cursor-pointer p-4 mx-2 my-4 border-black border-2 rounded-lg inline " 
     :class="{ 'bg-blue-400 text-white': (tab  == currentPage) }"
     @click="setCurrentPageCallback(tab)" >
        {{ tab  }}
    </div>


    <div  
    class="select-none bg-gray-300 hover:bg-blue-400 cursor-pointer p-4 mx-2 my-4 border-black border-2 rounded-lg inline " 
     
      >
        ...
    </div>

    <div  
    class="select-none bg-gray-300 hover:bg-blue-400 cursor-pointer p-4 mx-2 my-4 border-black border-2 rounded-lg inline " 
     
     @click="setCurrentPageCallback(maxPages-1)" >
        {{ maxPages-1  }}
    </div>


</div>
</template>


<script>
 
 
export default {
  name: 'PaginationBar',
  props: [ 'currentPage' , 'maxPages', 'setCurrentPageCallback' ],
  components:{ },
  data() {
    return {
       tabLabels:[1,2,3,4,5]
       
    }
  }, 
   watch: {
    // whenever currentPage changes, this function will run
    currentPage: function (newPage,oldPage) {
       this.updateTabLabels()
    },
     maxPages: function (newPage,oldPage) {
       this.updateTabLabels()
    }
  },

  created(){
     
      this.updateTabLabels()
 
  },
  methods: {

    updateTabLabels(){
      this.tabLabels = []

      for(let i=0;i<4;i++){
        if( this.currentPage+i < this.maxPages-1  ){
          this.tabLabels.push(this.currentPage+i)
        }
        

      }

    }  

   
         
  }
}
</script>