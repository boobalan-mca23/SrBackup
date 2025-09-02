const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createMasterSeal = async (req, res) => {
  const { itemName } = req.body;

  try {
    const newItem = await prisma.masterSealItem.create({
      data: {
        sealName:itemName
      },
    });
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.getMasterSeal = async (req, res) => {
  try {
    const items = await prisma.masterSealItem.findMany({
      orderBy: { id: "asc" },
    });
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.updateMasterSeal=async(req,res)=>{
  const {id}=req.params
  console.log('id',id)
  const {editItemName}=req.body
  console.log('editItemName',editItemName)
  try{
   const items = await prisma.masterSealItem.update({
      where:{
        id:parseInt(id)
      },
      data:{
        sealName:editItemName
      }
    });
    const updatedItems=await prisma.masterSealItem.findMany()
    res.status(200).json({updatedItems,message:"Item Updated"})
  }catch(err){
    console.error("Error Updating items:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
