



export default class MathHelper {

static rawAmountToFormatted(amount,decimals)
{
  return (amount * Math.pow(10,-1 * decimals)).toFixed(decimals);
}

static formattedAmountToRaw(amountFormatted,decimals)
{

  var multiplier = new BigNumber( 10 ).exponentiatedBy( decimals ) ;


  return multiplier.multipliedBy(amountFormatted).toFixed() ;
}

static formatFloat(f){
  return parseFloat(parseFloat(f).toFixed(3))
}

static formatTimeAgo( seconds ) { 
   
  let hours = MathHelper.getHoursFromSeconds(seconds)
 
  if(hours < 24){
    return Math.ceil(hours).toString().concat(' hours ago')
  }

  //stubbed 
  let days = MathHelper.getDaysFromSeconds(seconds)

  if(days < 30){
    return days.toFixed(2).toString().concat(' days ago')
  }else{
    return Math.ceil(days.toFixed(2)/30).toString().concat(' months ago')
  }
  
}

static expirationTimeFormatted(currentBlock, expirationBlock){
  let blockDelta = expirationBlock - currentBlock

  //let timeEstimateSeconds = blockDelta * 15 
  let days = MathHelper.getDaysFromBlocks(blockDelta)

  if(days < 30){
    return days.toFixed(2).toString().concat(' days')
  }else{
    return Math.ceil(days/30).toString().concat(' months')
  }
  
}

static getHoursFromSeconds(seconds){
  return parseFloat(seconds / (60*60))
} 

static getDaysFromSeconds(seconds){
  return parseFloat(seconds / (60*60*24)) 
} 

static getDaysFromBlocks(blocks){
  return parseFloat(blocks / 5760) 
} 



}