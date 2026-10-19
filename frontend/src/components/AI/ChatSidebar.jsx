
import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

export default function ChatSidebar({
  conversations = [],
  activeId,
  loading,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}) {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const filtered = conversations.filter((chat) =>
    (chat.title || "New chat")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const startRename = (chat) => {
    setEditingId(chat.id);
    setEditTitle(chat.title || "New chat");
  };

  const saveRename = async () => {
    if (!editTitle.trim() || !editingId) return;

    await onRenameChat(editingId, editTitle.trim());
    setEditingId(null);
    setEditTitle("");
  };

  return (
    <Box
      sx={{
        width: { xs: 245, md: 285 },
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#F8FAFC",
        borderRight: "1px solid #E2E8F0",
      }}
    >
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="h6"
          fontWeight={800}
          color="#0F172A"
          mb={2}
        >
          LifeHub AI
        </Typography>

        <Button
          fullWidth
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={onNewChat}
          sx={{
            textTransform: "none",
            justifyContent: "flex-start",
            borderRadius: 2.5,
            py: 1.3,
            boxShadow: "none",
            bgcolor: "#2563EB",
            "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
          }}
        >
          New chat
        </Button>

        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2.5,
              bgcolor: "#fff",
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchRoundedIcon
                  sx={{ color: "#94A3B8", mr: 1, fontSize: 20 }}
                />
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ px: 2, pb: 1 }}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="#94A3B8"
          sx={{ letterSpacing: 1 }}
        >
          RECENT CHATS
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        {filtered.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ p: 2 }}
          >
            {loading ? "Loading conversations..." : "No conversations found."}
          </Typography>
        ) : (
          <List disablePadding>
            {filtered.map((chat) => {
              const active = String(chat.id) === String(activeId);
              const editing = editingId === chat.id;

              return (
                <ListItemButton
                  key={chat.id}
                  selected={active}
                  onClick={() => {
                    if (!editing) onSelectChat(chat.id);
                  }}
                  sx={{
                    borderRadius: 2.5,
                    mb: 0.5,
                    alignItems: "flex-start",
                    bgcolor: active ? "#DBEAFE" : "transparent",
                    "&.Mui-selected": { bgcolor: "#DBEAFE" },
                    "&.Mui-selected:hover": { bgcolor: "#BFDBFE" },
                  }}
                >
                  <ChatBubbleOutlineRoundedIcon
                    sx={{
                      mr: 1.2,
                      mt: 0.5,
                      fontSize: 19,
                      color: active ? "#2563EB" : "#64748B",
                    }}
                  />

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    {editing ? (
                      <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveRename();
                          }
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <ListItemText
                        primary={chat.title || "New chat"}
                        primaryTypographyProps={{
                          fontSize: 13.5,
                          fontWeight: active ? 700 : 500,
                          noWrap: true,
                          color: "#334155",
                        }}
                      />
                    )}

                    {editing ? (
                      <Box display="flex" justifyContent="flex-end">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveRename();
                          }}
                        >
                          <CheckRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        sx={{ opacity: active ? 1 : 0.65 }}
                      >
                        <Tooltip title="Rename chat">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(chat);
                            }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete chat">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                          >
                            <DeleteOutlineRoundedIcon
                              sx={{ fontSize: 17 }}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Box>

      <Box sx={{ p: 2, borderTop: "1px solid #E2E8F0" }}>
        <Typography variant="caption" color="text.secondary">
          Your personal document assistant
        </Typography>
      </Box>
    </Box>
  );
}
