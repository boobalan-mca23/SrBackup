const { PrismaClient } = require("@prisma/client");
const { all } = require("../Routes/jobcard.routes");
const prisma = new PrismaClient();

 const formatWeights = (arr) => {
       return arr.map(item => ({
        ...item,
        weight:Number(item.weight).toFixed(3),
        touch:Number(item.touch).toFixed(2),
  }));
};

const createJobCard = async (req, res) => {
  const { goldsmithId,goldRows,total,receivedAmount,goldSmithBalance} = req.body;
  console.log('goldRows',goldRows)

  try {
    //  Validate Goldsmith
    const goldsmithInfo = await prisma.goldsmith.findUnique({
       where: { id: parseInt(goldsmithId) },
    });

    if (!goldsmithInfo) {
      return res.status(404).json({ error: "Goldsmith not found" });
    }

    if (goldRows.length < 1) {
      return res.status(400).json({ error: "Given gold data is required" });
    }
    // recevied Amount
    let receivedAmountArr;
    if(receivedAmount.length>=1){
      receivedAmountArr = receivedAmount.map((item) => ({
      weight: parseFloat(item.weight),
      touch: parseFloat(item.touch)||null,
      
      
    }));
    }

    // GivenGold data
    const givenGoldArr = goldRows.map((item) => ({
      username: item.username || null,
      itemName: item.itemName || null,
      weight:item.weight*1,
      touch: parseFloat(item.touch)||null,
      
    }));

    

   // Job Card Total
    
    const jobCardTotal={
       "goldsmithId":parseInt(goldsmithId),
       "givenWt" :parseFloat(total?.givenWt)||0,
       "itemWt"  :parseFloat(total?.itemWt)||0, 
       "stoneWt" :parseFloat(total?.stoneWt)||0,
       "wastage" :parseFloat(total?.wastage)||0,
       "goldSmithWastage":parseFloat(total?.goldSmithWastage)||0,
       "balance" :parseFloat(total?.balance)||0,
       "openBal" :parseFloat(total?.openBal)||0,
       "receivedTotal":parseFloat(total?.receivedTotal)||0,
       "isFinished" :"false"

    }
    
    // update GoldSmith balance
    const goldSmithBalanceAmt=await prisma.goldSmithBalance.update({
      where:{
        id:goldSmithBalance?.id
      },
      data:{
        balance:parseFloat(goldSmithBalance?.balance)
      }
    })
    // Create JobCard with nested Tables
   await prisma.jobCard.create({
           data: {
            goldsmithId: parseInt(goldsmithId),
            givenGold: {
               create: givenGoldArr,
             },
           jobCardTotal: {
             create: jobCardTotal,
           },
            goldSmithReceived: {
            create: receivedAmountArr,
            },
           JobCardReceived: {
             create: {
              goldsmithId: parseInt(goldsmithId),
              balance: jobCardTotal.balance,
              received: 0,
           
          },
    },
  },
});


    // clear jobcard balance 

    //    let receiveTotal=0;
    //       if(receivedAmount.length>=1){
    //         receiveTotal = receivedAmount.reduce((acc,item)=>{
    //        if(!item.id) return acc+Number(item.weight)||0
    //   },0)
    //     await clearBalance(goldsmithId,parseFloat(receiveTotal));
    // }
    


    // //  Fetch and return all JobCards for this goldsmith
    const allJobCards = await prisma.jobCard.findMany({
      where: {
        goldsmithId: parseInt(goldsmithId),
      },
      include: {
        givenGold: true,
        deliveryItem: true,
        additionalWeight: true,
        jobCardTotal:true,
        goldSmithReceived:true,
        JobCardReceived:true
       },
     
    }); 
    let jobCardLength=await prisma.jobCard.findMany()
     const flatten=allJobCards

     flatten.forEach(jobCard => {
      jobCard.givenGold = formatWeights(jobCard.givenGold);
      jobCard.deliveryItem = formatWeights(jobCard.deliveryItem);
      jobCard.additionalWeight = formatWeights(jobCard.additionalWeight);
      jobCard.goldSmithReceived= formatWeights(jobCard.goldSmithReceived);
});
          
     console.log('createdJobCards',allJobCards)
    return res.status(200).json({
      message: "JobCard created successfully",
      jobCards: allJobCards,
      goldSmithBalance:goldSmithBalanceAmt,
      jobCardLength:jobCardLength.length+1
    });
  } catch (err) {
    console.error("Create JobCard Error:", err);
    return res.status(500).json({ error: err.message });
  }
};



//update Jobcard 

const updateJobCard = async (req, res) => {
  const {goldSmithId,jobCardId}=req.params
  const {goldRows =[],itemRow=[],deductionRows=[],total,receivedAmount,goldSmithBalance} = req.body;
  console.log('update id',req.body)

  try {
    //  Validate Goldsmith
    const goldsmithInfo = await prisma.goldsmith.findUnique({
      where: { id: parseInt(goldSmithId) },
    });

    if (!goldsmithInfo) {
      return res.status(404).json({ error: "Goldsmith not found" });
    }

    if (goldRows.length < 1) {
      return res.status(400).json({ error: "Jobcard information is required" });
    }
    if(!total){
      return res.status(400).json({ error: "Total information is required" });
    }
    // update GoldSmith balance
    const goldSmithInfo=await prisma.goldSmithBalance.update({
      where:{
        id:goldSmithBalance?.id
      },
      data:{
        balance:parseFloat(goldSmithBalance?.balance)
      }
    })
    // update total values
   const totalOfJobcard=await prisma.jobcardTotal.update({
        where:{
          id:total?.id
        },
        data:{
          givenWt:parseFloat(total?.givenWt)||0,
          itemWt: parseFloat(total?.itemWt)||0,
          stoneWt:parseFloat(total?.stoneWt)||0,
          wastage:parseFloat(total?.wastage)||0,
          goldSmithWastage:parseFloat(total?.goldSmithWastage)||0,
          balance:parseFloat(total?.balance)||0,
          openBal:parseFloat(total?.openBal)||0,
          receivedTotal:parseFloat(total?.receivedTotal)||0,
        }
    })
   
    
    for(const gold of goldRows){
      if(gold?.id){ //if id is there update or create
           await prisma.givenGold.update({
              where:{
               id:gold.id,
            },
          data:{
            username: gold.username|| null,
            itemName:gold.itemName|| null,
            weight:parseFloat(gold.weight),
            touch: parseFloat(gold.touch),
           }
        })
      }else{
        await prisma.givenGold.create({
         data:{
            jobcardId:parseInt(jobCardId),
            username: gold.username|| null,
            itemName:gold.itemName|| null,
            weight: parseFloat(gold.weight),
            touch: parseFloat(gold.touch),
           }
        })
      }
        
    }
      if(itemRow.length>=1){
        for(const item of itemRow){
          if(item?.id){ //if id is there update otherwise its create new one
           await prisma.deliveryItem.update({
              where:{
               id:item.id,
           },
          data:{
            itemName:item.itemName|| null,
            weight: parseFloat(item.weight),
           
          }
        })
      }else{
        await prisma.deliveryItem.create({
            data:{
            jobcardId:parseInt(jobCardId),
            itemName:item.itemName|| null,
            sealName:item.sealName||null,
            weight: parseFloat(item.weight),   
           }
        })
      }
        
    }
  }
     if(deductionRows.length>=1){
           for(const item of deductionRows){
      if(item?.id){ //if id is there update or create
           await prisma.additionalWeight.update({
              where:{
               id:item.id,
             
          },
          data:{
            type:item.type|| null,
            customType:item.customType||null,
            weight: parseFloat(item.weight),
           
          }
        })
      }else{
        await prisma.additionalWeight.create({
            data:{
            jobcardId:parseInt(jobCardId),
            type:item.type|| null,
            customType:item.customType||null,
            weight: parseFloat(item.weight),   
            
           }
        })
      }
        
    }
     }
     
     // update next jobCard openBal
       let goldSmithJob=await prisma.jobcardTotal.findMany({
      where:{
        id:{gte:total?.id},
        goldsmithId:parseInt(goldSmithId)
      }
    })
  
    while(goldSmithJob.length!=1){
         const prevJob=goldSmithJob[0]
        const currentJob=goldSmithJob[1]
   
       await prisma.jobcardTotal.update({
              where:{
                id:currentJob.id,
                goldsmithId:parseFloat(goldSmithId)
              },
           data:{ 
             openBal:prevJob.balance,
             balance:(currentJob.givenWt+prevJob.balance)-currentJob.wastage
            }
        })
    
     goldSmithJob=await prisma.jobcardTotal.findMany({
         where:{
          id:{gt:prevJob.id},
          goldsmithId:parseFloat(goldSmithId)
      }
    })
      
    }
     // cleare balance
     if(totalOfJobcard.balance===0 || totalOfJobcard.balance<0){

          const lastJobCard = await prisma.jobcardTotal.findFirst({
        where: {
             id:total?.id,
             goldsmithId: parseInt(goldSmithId),
             isFinished: "false",
             }
         });
          if(lastJobCard!==null){
            
            await prisma.jobcardTotal.updateMany({where:{
                    id:{lte:lastJobCard.id},
                    goldsmithId:parseInt(goldSmithId)
                  }
                    ,data:{isFinished:"true"}})
          }
         

    }
    // received Amount save
    
  if (receivedAmount.length >= 1) {
    for (const item of receivedAmount) {
    const data = {
      jobCardId: parseInt(jobCardId),
      weight: parseFloat(item.weight) || 0,
      touch: parseFloat(item.touch) || null,
    };

    if (item.id) {
      await prisma.goldSmithReceived.update({
        where: { id: parseInt(item.id) },
        data,
      });
    } else {
      await prisma.goldSmithReceived.create({ data });
    }
  }
}  

    // clear jobcard balance 

//        let receiveTotal = 0;
//        if (receivedAmount.length >= 1) {
//          receiveTotal = receivedAmount.reduce((acc, item) => {
//         if (!item.id) {
//            return acc + (Number(item.weight) || 0);
//     }
//     return acc;
//   }, 0);
//     console.log('receiveTotal',receiveTotal)
//       await clearBalance(goldSmithId,parseFloat(receiveTotal));
    
// }   
    
    
    
   
    //  Fetch and return all JobCards for this goldsmith
    const allJobCards = await prisma.jobCard.findMany({
      where: {
        goldsmithId: parseInt(goldSmithId),
      },
      include: {
        givenGold: true,
        deliveryItem: true,
        additionalWeight: true,
        jobCardTotal:true,
        goldSmithReceived:true,
        JobCardReceived:true
      },
     
    });
    const flatten=allJobCards
     
    flatten.forEach(jobCard => {
      jobCard.givenGold = formatWeights(jobCard.givenGold);
      jobCard.deliveryItem = formatWeights(jobCard.deliveryItem);
      jobCard.additionalWeight = formatWeights(jobCard.additionalWeight);
      jobCard.goldSmithReceived= formatWeights(jobCard.goldSmithReceived);
    });

    let jobCardLength=await prisma.jobCard.findMany()
    return res.status(200).json({
      message: "JobCard Updated successfully",
      jobCards: allJobCards,
      goldSmithBalance:goldSmithInfo,
      jobCardLength:jobCardLength.length+1
    });
  } catch (err) {
    console.error("Create JobCard Error:", err);
    return res.status(500).json({ error: err.message });
  }
};




const getPreviousJobCardBal=async(req,res)=>{
     const{id}=req.params
     
     try{
        const jobCards = await prisma.jobcardTotal.findMany({
            where:{
            goldsmithId:parseInt(id)
           } 
        });
       
        if(jobCards.length>=1){
           const jobCard=jobCards.at(-1)
           
            res.status(200).json({"status":"balance",balance:jobCard.balance})
        }else{
          res.status(200).json({"status":"nobalance",balance:0})
        }
        
      }catch(err){
         console.error("Previous Balance Error:", err);
         return res.status(500).json({ error: err.message });
      
     }
     
   
}





const getJobCardById=async(req,res)=>{
    const {id}=req.params
   try{
    
      const goldSmithInfo = await prisma.jobCard.findUnique({where:{id:parseInt(id)}}); 

        if (!goldSmithInfo) {
         return res.status(404).json({ error: "Job Card not found" }); 
        }
      
      
        const jobCardInfo=await prisma.jobCard.findMany({
          where:{
            id:parseInt(id)
          },
          include:{
            goldsmith:true,
            givenGold:true,
            deliveryItem:true,
            additionalWeight:true,
            goldSmithReceived:true,
            jobCardTotal:true,
            JobCardReceived:true
           }
        })
        const jobCardTotal= await prisma.jobcardTotal.findMany({
            where:{
              goldsmithId:jobCardInfo[0].goldsmithId
            }
        })
        let balance=""
        let currindex = jobCardTotal.findIndex(item => parseInt(item.id) === parseInt(id));
       
        if(currindex===0){
          balance=0
        }else{
          currindex=currindex-1
           let prevJob=jobCardTotal.filter((item,index)=>currindex===index)
           balance=prevJob[0].balance
           
        }
        const flatten=jobCardInfo
   
     flatten.forEach(jobCard => {
      jobCard.givenGold = formatWeights(jobCard.givenGold);
      jobCard.deliveryItem = formatWeights(jobCard.deliveryItem);
      jobCard.additionalWeight = formatWeights(jobCard.additionalWeight);
      jobCard.goldSmithReceived= formatWeights(jobCard.goldSmithReceived);
});
      let lastJobCard=(await prisma.jobcardTotal.findMany({where:{goldsmithId:goldSmithInfo.goldsmithId}})).at(-1)
       
       return res.status(200).json({"jobcard":jobCardInfo,jobCardBalance:balance,lastJobCard:lastJobCard})

      } catch(err){
      return res.status(500).json({err:"Server Error"})
   }
     
   
   


}

 // getAllJobCardByGoldsmithId
const getAllJobCardByGoldsmithId = async (req, res) => {
  try {
    const { id } = req.params;
    const goldsmithInfo = await prisma.goldsmith.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        goldSmithBalance: true, 
      },
    });

    if (!goldsmithInfo) {
      return res.status(404).json({ error: "Goldsmith not found" });
    }

    const allJobCards = await prisma.jobCard.findMany({
      where: {
        goldsmithId: parseInt(id),
      },
      include: {
        givenGold: true,
        deliveryItem: true,
        additionalWeight: true,
        jobCardTotal:true,
        goldSmithReceived:true,
        JobCardReceived:true
      },
     
    });
    let jobCardLength=await prisma.jobCard.findMany()
    
    
   const flatten=allJobCards
   

// Apply formatting to all required arrays inside each job card
     flatten.forEach(jobCard => {
      jobCard.givenGold = formatWeights(jobCard.givenGold);
      jobCard.deliveryItem = formatWeights(jobCard.deliveryItem);
      jobCard.additionalWeight = formatWeights(jobCard.additionalWeight);
      jobCard.goldSmithReceived= formatWeights(jobCard.goldSmithReceived);
});
    

    return res.status(200).json({
      goldsmith: {
        id: goldsmithInfo.id,
        name: goldsmithInfo.name,
        address:goldsmithInfo.address,
        phoneNo:goldsmithInfo.phone,
        wastage: Number(goldsmithInfo.wastage).toFixed(3),
        balance: goldsmithInfo.goldSmithBalance, 
      },
      jobCards: allJobCards,
      jobCardLength:jobCardLength.length+1,
      
    });
  } catch (err) {
    console.error("Error fetching job card info:", err);
    return res.status(500).json({ error: "Server Error" });
  }
};


const formatDate = (dateString) => {
  const [day, month, year] = dateString.split("/");
  return `${year}-${month}-${day}`;
};

const jobCardFilter = async (req, res) => {
  const { fromDate, toDate } = req.query;
  const { id } = req.params;
  console.log('reqquery',req.query)

  try {
    let whereCondition = {};

    // If id exists and not "null", add goldsmith filter
    if (id && id !== "null") {
      whereCondition.goldsmithId = parseInt(id);
    }

    // If fromDate and toDate exist and not "null", add date filter
    if (fromDate && toDate && fromDate !== "null" && toDate !== "null") {
      const parsedFromDate = new Date(formatDate(fromDate));
      const parsedToDate = new Date(formatDate(toDate));

      // Adjust toDate to include the entire day
      parsedToDate.setHours(23, 59, 59, 999);

      if (isNaN(parsedFromDate.getTime()) || isNaN(parsedToDate.getTime())) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      whereCondition.createdAt = {
        gte: parsedFromDate,
        lte: parsedToDate,
      };
    }

    // If both id = null and dates = null → whereCondition = {} (fetch all)
    const filterJobCards = await prisma.jobCard.findMany({
      where: whereCondition,
      include: {
        goldsmith:true,
        givenGold: true,
        deliveryItem: true,
        additionalWeight: true,
        jobCardTotal: true,
        goldSmithReceived:true
       
      },
    });

    res.json(filterJobCards);
  } catch (error) {
    console.error("Error filtering job cards:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};






 module.exports={createJobCard,
  updateJobCard,
  getAllJobCardByGoldsmithId,
  getPreviousJobCardBal,getJobCardById,
jobCardFilter}