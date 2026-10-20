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
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";

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
      className="assistant-history-sidebar"
      sx={{
        width: { xs: 260, md: 290 },
        flexShrink: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f8fafc",
        borderRight: "1px solid #e2e8f0",
      }}
    >
      {/* Top Header */}
      <Box sx={{ p: 2.2, borderBottom: "1px solid #f1f5f9" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "0.6rem",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1.2 }}>
              DocumentHub AI
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem" }}>
              Intelligent Assistant
            </Typography>
          </Box>
        </Box>

        {/* New Chat Button */}
        <Button
          fullWidth
          variant="contained"
          startIcon={<AddRoundedIcon sx={{ fontSize: 20 }} />}
          onClick={onNewChat}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.875rem",
            borderRadius: "0.65rem",
            py: 1,
            boxShadow: "0 1px 2px rgba(37, 99, 235, 0.2)",
            bgcolor: "#2563eb",
            "&:hover": {
              bgcolor: "#1d4ed8",
              boxShadow: "0 4px 10px rgba(37, 99, 235, 0.25)",
            },
          }}
        >
          New conversation
        </Button>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Filter conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mt: 1.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.6rem",
              bgcolor: "#ffffff",
              fontSize: "0.85rem",
              borderColor: "#e2e8f0",
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#cbd5e1",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#2563eb",
              },
            },
          }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchRoundedIcon
                  sx={{ color: "#64748b", mr: 1, fontSize: 18 }}
                />
              ),
            },
          }}
        />
      </Box>

      {/* History Section Label */}
      <Box sx={{ px: 2.2, pt: 2, pb: 0.75 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            color: "#475569",
            letterSpacing: "0.06em",
            fontSize: "0.7rem",
          }}
        >
          CHATS ({filtered.length})
        </Typography>
      </Box>

      {/* Conversations List */}
      <Box sx={{ flex: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        {filtered.length === 0 ? (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.825rem" }}>
              {loading ? "Loading conversations..." : "No conversation history"}
            </Typography>
          </Box>
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
                    borderRadius: "0.65rem",
                    mb: 0.5,
                    px: 1.5,
                    py: 1,
                    alignItems: "center",
                    bgcolor: active ? "#eff6ff" : "transparent",
                    border: "1px solid",
                    borderColor: active ? "#bfdbfe" : "transparent",
                    transition: "all 0.15s ease",
                    "&:hover": {
                      bgcolor: active ? "#eff6ff" : "#f1f5f9",
                    },
                    "&.Mui-selected": {
                      bgcolor: "#eff6ff",
                    },
                    "&.Mui-selected:hover": {
                      bgcolor: "#dbeafe",
                    },
                  }}
                >
                  <ChatBubbleOutlineRoundedIcon
                    sx={{
                      mr: 1.25,
                      fontSize: 17,
                      color: active ? "#2563eb" : "#64748b",
                      flexShrink: 0,
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            fontSize: "0.825rem",
                            py: 0,
                            bgcolor: "#ffffff",
                          },
                        }}
                      />
                    ) : (
                      <ListItemText
                        primary={chat.title || "New chat"}
                        primaryTypographyProps={{
                          fontSize: "0.84rem",
                          fontWeight: active ? 700 : 500,
                          noWrap: true,
                          color: active ? "#1e40af" : "#334155",
                        }}
                      />
                    )}

                    {editing ? (
                      <Box display="flex" justifyContent="flex-end" mt={0.5} gap={0.5}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveRename();
                          }}
                          sx={{ p: 0.3, color: "#2563eb" }}
                        >
                          <CheckRoundedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(null);
                          }}
                          sx={{ p: 0.3, color: "#94a3b8" }}
                        >
                          <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : (
                      <Box
                        display="flex"
                        justifyContent="flex-end"
                        sx={{
                          opacity: active ? 1 : 0,
                          transition: "opacity 0.15s ease",
                          ".MuiListItemButton-root:hover &": {
                            opacity: 1,
                          },
                        }}
                      >
                        <Tooltip title="Rename">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              startRename(chat);
                            }}
                            sx={{ p: 0.4, color: "#64748b", "&:hover": { color: "#2563eb" } }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            sx={{ p: 0.4, color: "#64748b", "&:hover": { color: "#ef4444" } }}
                          >
                            <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
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

      {/* Footer Info */}
      <Box
        sx={{
          p: 1.75,
          borderTop: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <ShieldOutlinedIcon sx={{ fontSize: 16, color: "#2563eb" }} />
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.72rem", fontWeight: 500 }}>
          End-to-end private AI vault
        </Typography>
      </Box>
    </Box>
  );
}
