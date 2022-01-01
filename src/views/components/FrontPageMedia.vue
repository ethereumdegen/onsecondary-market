<template> 



<div class="pt-8 relative pb-2 mb-12" style="min-height:200px">
              
         
            
       <canvas id="canvasRegn" width="600" height="450"style="margin:100px;"></canvas>

 </div>
 </template>





<script>


    var ctx;
 
var imgDrops;
var x = 0;
var y = 0;
var noOfDrops = 50;
var fallingDrops = [];


 



    export default {
    name: 'FrontPageMedia',
    props: [ ],
    data() {
        return {
             
        }
    },
    created(){
         
       
 
    },
       mounted(){
         
       

        this.setup()
    },
    methods: {
      



     drawBackground(){  
      
         let canvas = ctx.canvas 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
     },

     draw() {
        this.drawBackground();
        
        for (var i=0; i< noOfDrops; i++)
        {
        ctx.drawImage (fallingDrops[i].image, fallingDrops[i].x, fallingDrops[i].y); //The rain drop

        fallingDrops[i].y += fallingDrops[i].speed; //Set the falling speed
        if (fallingDrops[i].y > 450) {  //Repeat the raindrop when it falls out of view
        fallingDrops[i].y = -25 //Account for the image size
        fallingDrops[i].x = Math.random() * 600;    //Make it appear randomly along the width    
        }
        
        }
    },
     setup() {
        var canvas = document.getElementById('canvasRegn');
     
        if (canvas.getContext) {
                ctx = canvas.getContext('2d');
            
                //    imgBg = new Image();
           // imgBg.src = "http://lorempixel.com/600/600/sports/";
        setInterval(this.draw, 36);
        for (var i = 0; i < noOfDrops; i++) {
            var fallingDr = new Object();
            fallingDr["image"] =  new Image();
            fallingDr.image.src = '/images/banana.png';
                
            fallingDr["x"] = Math.random() * 600;
            fallingDr["y"] = -400 + Math.random() * 630;
            fallingDr["speed"] = 1 + Math.random() * 0.5;
            fallingDrops.push(fallingDr);
            }

        }
    }


    }
    }
</script>
