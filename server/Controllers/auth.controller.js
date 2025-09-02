const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();

exports.register = async (req, res) => {
  const { username, password, role = 'user' } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        password: hashedPassword,
        role: role // Add role field to your User model if needed
      }
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: newUser.id,
      username: newUser.username
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
exports.createUser = async (req, res) => {
try {
  const { username, password, role, goldsmithAccess, itemMasterAccess, sealMasterAccess, canCreateUser } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  } 
    
  const existingUser = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (existingUser) {
    return res.status(409).json({ error: "Username already exists" });
  }
  // const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      username,
      password,
      role,
      goldsmithAccess,
      itemMasterAccess,
      sealMasterAccess,
      canCreateUser,
    },
  });

  res.json(newUser);
} catch (error) {
  console.error(error);
  res.status(500).json({ error: "Something went wrong" });
}
}
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    console.log("User found:", user);
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify password
    const isValidPassword = await password === user.password;
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    
    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been deactivated. Please contact an administrator."
      });
    }

    // Determine user role
    let role = 'user';
    if (username.toLowerCase() === 'admin' || user.role === 'admin') {
      role = 'admin';
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      username: user.username,
      role,
      userId: user.id,
      goldsmithAccess: user.goldsmithAccess,
      itemMasterAccess: user.itemMasterAccess,
      sealMasterAccess: user.sealMasterAccess,
      canCreateUser: user.canCreateUser,
      isActive: user.isActive  // 👈 also return for frontend checks
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        isActive: true,
        goldsmithAccess: true,
        itemMasterAccess: true,
        sealMasterAccess: true,
        canCreateUser: true,
        password: true
      }
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};    


exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, role, goldsmithAccess, itemMasterAccess, sealMasterAccess, canCreateUser, isActive } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedData = {
      username: username || user.username,
      role: role ?? user.role,
      isActive: isActive ?? user.isActive,
      goldsmithAccess: goldsmithAccess ?? user.goldsmithAccess,
      itemMasterAccess: itemMasterAccess ?? user.itemMasterAccess,
      sealMasterAccess: sealMasterAccess ?? user.sealMasterAccess,
      canCreateUser: canCreateUser ?? user.canCreateUser,
      password: password ?? user.password
    };

     if (!password) return res.status(400).json({ error: "Password is required" });

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters long" });
      }
    }
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updatedData
    });

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};


exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) } 
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } 
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "User deleted successfully" }); 
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// exports.verify = async (req, res) => {
//   const authHeader = req.headers.authorization;
//   const token = authHeader?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
//     // Get fresh user data
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId }
//     });

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     res.json({
//       valid: true,
//       user: {
//         id: user.id,
//         username: user.username,
//         role: decoded.role
//       }
//     });

//   } catch (error) {
//     res.status(401).json({ message: "Invalid token" });
//   }
// };