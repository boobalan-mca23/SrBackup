const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createCustomer = async (req, res) => {
  const { name, phone, address } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Customer name is required." });
  }

  try {
    const newCustomer = await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
      },
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    res.status(500).json({ message: "Error creating customer", error });
  }
};

exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customers", error });
  }
};

exports.getCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
    });
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({ message: "Error fetching customer", error });
  }
};

exports.updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, phone, address } = req.body;
  try {
    const updatedCustomer = await prisma.customer.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phone,
        address,
      },
    });
    res.status(200).json(updatedCustomer);
  } catch (error) {
    res.status(500).json({ message: "Error updating customer", error });
  }
};

exports.deleteCustomer = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.customer.delete({
      where: { id: parseInt(id) },
    });
    res.status(200).json({ message: "Customer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting customer", error });
  }
};
