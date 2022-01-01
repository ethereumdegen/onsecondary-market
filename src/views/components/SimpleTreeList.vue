<template>
  <div class=" ">
     
     
       <div v-for="key in Object.keys(filterTraitsMap)" v-bind:key="key">    {{key}}  

                    <div v-for="value in (filterTraitsMap[key])" v-bind:key="value" >   {{value}}  </div>
                 
                
        </div> 


  </div>
</template>


<script>


export default {
  name: 'SimpleTreeList',
  props: ['dataStructure','clickedLeafCallback'],
  data() {
    return {

    }
  },
  created(){

  },
  methods: {
      
      clickedLeaf(row){
        this.clickedLeafCallback(row)
      }

  }
}
</script>
