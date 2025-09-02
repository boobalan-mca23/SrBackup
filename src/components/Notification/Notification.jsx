import React, { useState } from "react";
import {
  Badge,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Divider,
  Button,
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CircleIcon from "@mui/icons-material/Circle";

const notifications = [
  {
    id: 1,
    message: "Necklace order due today for Mr. Karthik (2 Qty)",
    date: "2025-06-12",
    seen: false,
  },
  {
    id: 2,
    message: "Ring order due tomorrow for Ms. Priya (1 Qty)",
    date: "2025-06-13",
    seen: false,
  },
];

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationList, setNotificationList] = useState(notifications);
  const unread = notificationList.filter((n) => !n.seen).length;

  const handleClick = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const markAllAsRead = () => {
    setNotificationList(notificationList.map((n) => ({ ...n, seen: true })));
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Badge
          badgeContent={unread}
          color="error"
          invisible={unread === 0}
          sx={{
            "& .MuiBadge-badge": {
              right: 5,
              top: 5,
              padding: "0 4px",
              height: "16px",
              minWidth: "16px",
            },
          }}
        >
          <NotificationsNoneIcon
            sx={{
              color: "#fff",
              fontSize: "1.5rem",
            }}
          />
        </Badge>
      </IconButton>

      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: "12px",
            width: 380,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#f8f9fa",
            borderBottom: "1px solid #e9ecef",
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
            Notifications {unread > 0 && `(${unread} new)`}
          </Typography>
          {unread > 0 && (
            <Button
              onClick={markAllAsRead}
              size="small"
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                color: "#6c757d",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#495057",
                },
              }}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        <List
          dense
          disablePadding
          sx={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {notificationList.length ? (
            notificationList.map((note) => (
              <React.Fragment key={note.id}>
                <ListItem
                  sx={{
                    px: 2,
                    py: 1.5,
                    backgroundColor: !note.seen ? "#f8f9fa" : "transparent",
                    "&:hover": {
                      backgroundColor: "#f1f3f5",
                    },
                  }}
                >
                  {!note.seen && (
                    <CircleIcon
                      sx={{
                        color: "#4dabf7",
                        fontSize: "8px",
                        mr: 1.5,
                        mt: 0.5,
                      }}
                    />
                  )}
                  <ListItemText
                    primary={
                      <Typography
                        fontSize="0.875rem"
                        fontWeight={note.seen ? 400 : 500}
                        color={note.seen ? "text.secondary" : "text.primary"}
                      >
                        {note.message}
                      </Typography>
                    }
                    secondary={
                      <Typography
                        fontSize="0.75rem"
                        color={note.seen ? "#adb5bd" : "#868e96"}
                        mt={0.5}
                      >
                        {new Date(note.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    }
                    sx={{ ml: !note.seen ? 0 : "24px" }}
                  />
                </ListItem>
                <Divider sx={{ my: 0 }} />
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
              <Typography fontSize="0.875rem" color="text.secondary">
                No new notifications.
              </Typography>
            </Box>
          )}
        </List>
      </Popover>
    </>
  );
};

export default NotificationBell;
