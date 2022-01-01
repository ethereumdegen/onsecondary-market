<template>
  <div class=" ">
     <table class="table-auto w-full text-black" v-if="rowsArray">
          <thead class="font-boring" v-if="rowsArray.length>0">
            <tr>
              <th style="text-align:left" v-for="(label, index) in labelsArray">{{label}}</th>
               
            </tr>
          </thead>
          <tbody v-cloak class="font-boring">
            <tr v-for="row of rowsArray" class="hover:bg-teal-200 cursor-pointer" @click="clickedRow(row)">
               
              <td v-for="(label, index) in labelsArray" class="py-2">

                <img v-if="Object.keys(row)[index] == 'icon'" v-bind:src="Object.values(row)[index]" style="width:36px"/>   

                <span v-if="Object.keys(row)[index] != 'icon'">{{Object.values(row)[index]}}</span>
                
              </td>
              
            </tr>
             
          </tbody>
        </table>

        <div v-if="!rowsArray || rowsArray.length == 0" v-cloak  >
          No records found.
        </div>
  </div>
</template>


<script>


export default {
  name: 'GenericTable',
  props: ['labelsArray','rowsArray','clickedRowCallback'],
  data() {
    return {

    }
  },
  created(){

  },
  methods: {
      clickedRow(row){
        this.clickedRowCallback(row)
      }
  }
}
</script>
