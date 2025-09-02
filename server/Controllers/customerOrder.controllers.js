const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();



const getCustomerOrder = async (req, res) => {
  try {
    const { customer_id } = req.params;

    const orders = await prisma.customer_order.findMany({
      where: { customer_id: parseInt(customer_id) },
      select: {
        id: true,
        item_name: true,
        description: true,
        weight: true,
        due_date: true,
        status: true,
        order_group_id: true,
        productImages: { select: { filename: true } },
      },
      orderBy: { order_group_id: "asc" },
    });

    const grouped = {};

    for (const order of orders) {
      const groupId = order.order_group_id;
      if (!grouped[groupId]) grouped[groupId] = [];

      grouped[groupId].push(order);
    }

    return res.status(200).json({
      message: "Grouped orders fetched",
      data: grouped,
    });
  } catch (error) {
    console.error("Error fetching grouped orders:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
};



const createCustomerOrder = async (req, res) => {
  try {
    const {
      customer_id,
      item_name,
      description,
      weight,
      due_date,
      order_group_id,
    } = req.body;

    const names = Array.isArray(item_name) ? item_name : [item_name];
    const descriptions = Array.isArray(description)
      ? description
      : [description];
    const weights = Array.isArray(weight) ? weight : [weight];
    const dueDates = Array.isArray(due_date) ? due_date : [due_date];

    const groupId = order_group_id
      ? parseInt(order_group_id)
      : Math.floor(Date.now() / 1000);
    const createdOrders = [];

    for (let i = 0; i < names.length; i++) {
      const dueDate = new Date(dueDates[i]);

      const order = await prisma.customer_order.create({
        data: {
          customer_id: parseInt(customer_id),
          item_name: names[i],
          description: descriptions[i],
          weight: parseFloat(weights[i]),
          due_date: dueDate,
          order_group_id: groupId,
        },
      });

      const filesForThisItem = (req.files || []).filter((file) =>
        file.fieldname.startsWith(`images_${i}`)
      );

      if (filesForThisItem.length > 0) {
        const imageRecords = filesForThisItem.map((file) => ({
          customer_order_id: order.id,
          filename: file.filename,
        }));

        await prisma.product_multiple_images.createMany({ data: imageRecords });
      }

      createdOrders.push(order);
    }

    return res.status(201).json({
      message: "Customer orders created successfully",
      data: createdOrders,
      order_group_id: groupId,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create customer order" });
  }
};

const updateCustomerOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (isNaN(parseInt(id))) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const {
      item_name,
      description,
      weight,
      due_date,
      status,
      order_group_id,
    } = req.body;

    const existingOrder = await prisma.customer_order.findUnique({
      where: { id: parseInt(id) },
    });
    if (!existingOrder) {
      return res.status(404).json({ error: "Order item not found" });
    }

    if (
      order_group_id &&
      parseInt(order_group_id) !== existingOrder.order_group_id
    ) {
      return res
        .status(400)
        .json({ error: "Order group ID mismatch" });
    }

    const dataToUpdate = {};

    if (item_name !== undefined) dataToUpdate.item_name = item_name;
    if (description !== undefined) dataToUpdate.description = description;
    if (weight !== undefined) dataToUpdate.weight = parseFloat(weight);
    if (due_date !== undefined) {
      const parsedDate = new Date(due_date);
      if (isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json({ error: "Invalid due date format" });
      }
      dataToUpdate.due_date = parsedDate;
    }
    if (status !== undefined) dataToUpdate.status = status;

    const updatedOrder = await prisma.customer_order.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
    });

    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file) => ({
        customer_order_id: parseInt(id),
        filename: file.filename,
      }));

      await prisma.product_multiple_images.createMany({
        data: imageRecords,
      });
    }

    return res.status(200).json({
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    return res
      .status(500)
      .json({ error: "Failed to update customer order" });
  }
};


const addExtraItemToOrderGroup = async (req, res) => {
  try {
    const { order_group_id } = req.params;
    const { customer_id, item_name, description, weight, due_date } = req.body;

    const dueDate = new Date(due_date);

    const order = await prisma.customer_order.create({
      data: {
        customer_id: parseInt(customer_id),
        item_name,
        description,
        weight: parseFloat(weight),
        due_date: null,
        order_group_id: parseInt(order_group_id),
      },
    });

    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file) => ({
        customer_order_id: order.id,
        filename: file.filename,
      }));

      await prisma.product_multiple_images.createMany({ data: imageRecords });
    }

    return res.status(201).json({
      message: "Item added to order group successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error adding to group:", error);
    return res.status(500).json({ error: "Failed to add item to order group" });
  }
};

const deleteCustomerOrder = async (req, res) => {
  try {
    const orderId = parseInt(req.params?.orderId?.toString());

    await prisma.product_multiple_images.deleteMany({
      where: { customer_order_id: orderId },
    });

    const deletedOrder = await prisma.customer_order.delete({
      where: { id: orderId },
    });

    res
      .status(200)
      .json({ message: "Successfully deleted", data: deletedOrder });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
};

const deleteImageById = async (req, res) => {
  try {
    const imageId = parseInt(req.params.imageId);
    if (isNaN(imageId)) {
      return res.status(400).json({ error: "Invalid image ID" });
    }

    const image = await prisma.product_multiple_images.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }

    const fs = require("fs");
    const path = require("path");
    const imagePath = path.join(__dirname, "../uploads", image.filename);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await prisma.product_multiple_images.delete({
      where: { id: imageId },
    });

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ error: "Failed to delete image" });
  }
};
const getAllCustomerOrders = async (req, res) => {
  try {
    const orders = await prisma.customer_order.findMany({
      include: {
        productImages: { select: { filename: true } },
        customers: { select: { name: true } }, 
      },
    });

    res.status(200).json({
      message: "All customer orders fetched",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};



module.exports = {
  getCustomerOrder,
  createCustomerOrder,
  updateCustomerOrder,
  deleteCustomerOrder,
  addExtraItemToOrderGroup,
  deleteImageById,
  getAllCustomerOrders
};

