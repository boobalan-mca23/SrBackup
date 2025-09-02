import React, { useEffect, useState } from "react";
import { BACKEND_SERVER_URL } from "../../Config/Config";
import { MdOutlineEdit } from "react-icons/md";
import { AiOutlineDelete } from "react-icons/ai";
import { FiUser, FiUserCheck, FiUserX } from "react-icons/fi";
import { FaRegCircleCheck } from "react-icons/fa6";
import { FaRegCircleXmark } from "react-icons/fa6";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
} from "@mui/material";
import "./AllUser.css";

function AllUser() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "user",
    isActive: true,
    goldsmithAccess: false,
    itemMasterAccess: false,
    sealMasterAccess: false,
    canCreateUser: false,
  });
  const [editUser, setEditUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [errors, setErrors] = useState({});

  const userRole = localStorage.getItem("userRole");
  const canCreateUser = localStorage.getItem("canCreateUser");
  // console.log("userRole:", userRole);
  console.log("canCreateUser:", canCreateUser);
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_SERVER_URL}/api/auth/users`);
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  let newErrors = {};
  if (!form.username.trim()) newErrors.username = "Username is required";
  if (!form.password.trim()) newErrors.password = "Password is required";
  else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  setErrors({});

  try {
    const response = await fetch(`${BACKEND_SERVER_URL}/api/auth/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await response.json();

    if (response.ok) {
      fetchUsers();
      setForm({
        username: "",
        password: "",
        role: "user",
        isActive: true,
        goldsmithAccess: false,
        itemMasterAccess: false,
        sealMasterAccess: false,
        canCreateUser: false,
      });
      alert("User created successfully!");
    } else {
      alert(result.error || "Failed to create user.");
    }
  } catch (error) {
    console.error("Error creating user:", error);
    alert("Error creating user.");
  }
};


  const handleEdit = (user) => {
    console.log("Editing user:", user);
    setEditUser({ ...user, password:user.password || "" });
    setOpenEditDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, type, checked, value } = e.target;
    setEditUser({ ...editUser, [name]: type === "checkbox" ? checked : value });
  };

  const handleEditSubmit = async () => {
    try {
      const updatedUser = { ...editUser };

      // if password is empty, don't send it
      if (!updatedUser.password || updatedUser.password.trim() === "") {
        delete updatedUser.password;
      }

      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/auth/users/${editUser.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser),
        }
      );

      if (response.ok) {
        fetchUsers();
        alert("User updated successfully!");
        setOpenEditDialog(false);
      } else {
        alert("Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error updating user.");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "deactivate";
    console.log(`Toggling status of user ${userId} to ${newStatus}`);
    
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/auth/users/${userId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newStatus }),
        }
      );
      if (response.ok) {
        fetchUsers();
        alert(`User ${action}d successfully!`);
      } else {
        alert(`Failed to ${action} user.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`Error ${action}ing user.`);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(
        `${BACKEND_SERVER_URL}/api/auth/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchUsers();
        alert("User deleted successfully!");
      } else {
        alert("Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user.");
    }
  };

  return (
    <div className="alluser-container">
      <div className="page-header">
        <h1 className="page-title">
          <FiUser className="title-icon" />
          User Management
        </h1>
        <p className="page-subtitle">Create and manage user accounts</p>
      </div>

      {/* Create User Form */}
      <div className="create-user-section">
        <h2 className="section-title">Create New User</h2>
        <form onSubmit={handleSubmit} className="user-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Enter username"
                autoComplete="off"
                value={form.username}
                onChange={handleChange}
                required
                className="form-inputs"
                 style={{
                  outline: "none",
                  boxShadow: "none",
                  width: "50%",
                }}
              />
              {errors.username && <span className="error-text" style={{color:"red"}}>{errors.username}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="text"
                id="password"
                name="password"
                placeholder="Enter password"
                autoComplete="off"
                value={form.password}
                onChange={handleChange}
                required
                className="form-inputs"
                 style={{
                  outline: "none",
                  boxShadow: "none",
                  width: "50%",
                }}
              />
              {errors.password && <span className="error-text" style={{color:"red"}} >{errors.password}</span>}
            </div>
            {/* <div className="form-group">
              <label htmlFor="role">Role</label>
              <select 
                id="role"
                name="role" 
                value={form.role} 
                onChange={handleChange}
                className="form-select"
                 style={{
                  outline: "none",
                  boxShadow: "none",
                }}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div> */}
          </div>

          <div className="permissions-section">
            <h3>Permissions</h3>
            <div className="permissions-grid">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="goldsmithAccess"
                  checked={form.goldsmithAccess}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Goldsmith Access
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="itemMasterAccess"
                  checked={form.itemMasterAccess}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Item Master Access
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="sealMasterAccess"
                  checked={form.sealMasterAccess}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Seal Master Access
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="canCreateUser"
                  checked={form.canCreateUser}
                  onChange={handleChange}
                  className="checkbox-input"
                />
                <span className="checkbox-custom"></span>
                Can Create User
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Create User
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="users-table-section">
        <h2 className="section-title">All Users ({users.filter((u) => u.role !== "admin").length}) </h2>
        {/* <h2 className="section-title">All Users ({users.length})</h2> */}
        {users.length === 0 ? (
          <div className="no-users">
            <FiUser className="no-users-icon" />
            <p>No users found</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Goldsmith</th>
                  <th>Item Master</th>
                  <th>Seal Master</th>
                  <th>Can Create User</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {users
                .filter((user) => user.role !== "admin") // 🚀 filter out admins
                .map((user) => (
                  <tr key={user.id} className={!user.isActive ? "inactive-user" : ""}>
                    <td className="username-cell">
                      <div className="user-info">
                        <FiUser className="user-avatar" />
                        <span>{user.username || ""}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role || ""}
                      </span>
                    </td>
                    {(userRole === "admin" || canCreateUser) ? (
                      <td>
                        <button
                          className={`status-btn ${user.isActive ? "active" : "inactive"}`}
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          title={`Click to ${user.isActive ? "deactivate" : "activate"}`}
                        >
                          {user.isActive ? (
                            <>
                              <FiUserCheck className="status-icon" />
                              Active
                            </>
                          ) : (
                            <>
                              <FiUserX className="status-icon" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                    ) : null}
                    <td>
                      {user.goldsmithAccess ? (
                        <FaRegCircleCheck style={{ color: "green", fontSize: 25 }} />
                      ) : (
                        <FaRegCircleXmark style={{ color: "red", fontSize: 25 }} />
                      )}
                    </td>
                    <td>
                      {user.itemMasterAccess ? (
                        <FaRegCircleCheck style={{ color: "green", fontSize: 25 }} />
                      ) : (
                        <FaRegCircleXmark style={{ color: "red", fontSize: 25 }} />
                      )}
                    </td>
                    <td>
                      {user.sealMasterAccess ? (
                        <FaRegCircleCheck style={{ color: "green", fontSize: 25 }} />
                      ) : (
                        <FaRegCircleXmark style={{ color: "red", fontSize: 25 }} />
                      )}
                    </td>
                    <td>
                      {user.canCreateUser ? (
                        <FaRegCircleCheck style={{ color: "green", fontSize: 25 }} />
                      ) : (
                        <FaRegCircleXmark style={{ color: "red", fontSize: 25 }} />
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn btn-edit"
                          onClick={() => handleEdit(user)}
                          title="Edit User"
                        >
                          <MdOutlineEdit />
                        </button>
                        <button
                          className="btn btn-delete"
                          onClick={() => handleDelete(user.id)}
                          title="Delete User"
                        >
                          <AiOutlineDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        fullWidth
        maxWidth="sm"
        className="edit-dialog"
      >
        <DialogTitle className="dialog-title">
          <MdOutlineEdit className="dialog-icon" />
          Edit User
        </DialogTitle>
        <DialogContent className="dialog-content">
          <TextField
            label="Username"
            name="username"
            value={editUser?.username || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            variant="outlined"
            autoComplete="off"
          />

          {/* <TextField
            label="Role"
            name="role"
            value={editUser?.role || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            select
            SelectProps={{ native: true }}
            variant="outlined"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </TextField> */}

          <TextField
            label="Password"
            name="password"
            type="text"
            value={editUser?.password || ""}
            onChange={handleEditChange}
            fullWidth
            margin="normal"
            helperText="Leave blank to keep the current password"
            variant="outlined"
            autoComplete="off"
          />

          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={editUser?.isActive || false}
                onChange={handleEditChange}
                color="primary"
              />
            }
            label="Active Account"
            className="switch-control"
          />

          <div className="dialog-permissions">
            <h4>Permissions</h4>
            <div className="dialog-checkboxes">
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    name="goldsmithAccess"
                    checked={editUser?.goldsmithAccess || false}
                    onChange={handleEditChange}
                  />
                }
                label="Goldsmith Access"
              />
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    name="itemMasterAccess"
                    checked={editUser?.itemMasterAccess || false}
                    onChange={handleEditChange}
                  />
                }
                label="Item Master Access"
              />
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    name="sealMasterAccess"
                    checked={editUser?.sealMasterAccess || false}
                    onChange={handleEditChange}
                  />
                }
                label="Seal Master Access"
              />
              <FormControlLabel
                control={
                  <input
                    type="checkbox"
                    name="canCreateUser"
                    checked={editUser?.canCreateUser || false}
                    onChange={handleEditChange}
                  />
                }
                label="Can Create User"
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button onClick={() => setOpenEditDialog(false)} className="btn-cancel">
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained" 
            color="primary"
            className="btn-save"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default AllUser;