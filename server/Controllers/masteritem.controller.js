const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createItem = async (req, res) => {
  const { itemName } = req.body;

  try {
    const newItem = await prisma.masterItem.create({
      data: {
        itemName,
      },
    });
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.getItems = async (req, res) => {
  try {
    const items = await prisma.masterItem.findMany({
      orderBy: { id: "asc" },
    });
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

exports.updateItems=async(req,res)=>{
  const {id}=req.params
  console.log('id',id)
  const {editItemName}=req.body
  console.log('editItemName',editItemName)
  try{
   const items = await prisma.masterItem.update({
      where:{
        id:parseInt(id)
      },
      data:{
        itemName:editItemName
      }
    });
    const updatedItems=await prisma.masterItem.findMany()
    res.status(200).json({updatedItems,message:"Item Updated"})
  }catch(err){
    console.error("Error Updating items:", err);
    res.status(500).json({ error: "Something went wrong." });
  }
}
