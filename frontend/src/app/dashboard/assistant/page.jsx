import { useCallback, useEffect, useRef, useState } from "react";

import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Stack,
  IconButton,
  Tooltip,
} from "@mui/material";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";

import ChatSidebar from "../../../components/AI/ChatSidebar";
import ChatMessage from "../../../components/AI/ChatMessage";
import ChatInput from "../../../components/AI/ChatInput";

import {
  createConversation,
  getConversations,
  getConversationMessages,
  sendChatMessage,
  renameConversation,
  deleteConversation,
} from "../../../services/ai";

import { viewDocument } from "../../../services/document";

const suggestions = [
  {
    icon: <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "#2563eb" }} />,
    tag: "Synthesis",
    title: "Executive Summary",
    description: "Get the main points from across your files.",
    prompt: "Summarize the most important information and takeaways across my uploaded documents.",
  },
  {
    icon: <CalendarMonthOutlinedIcon sx={{ fontSize: 20, color: "#2563eb" }} />,
    tag: "Facts & Timeline",
    title: "Dates & Deadlines",
    description: "Find due dates, renewals, and important milestones.",
    prompt: "Find all important dates, deadlines, and renewal milestones mentioned in my documents.",
  },
  {
    icon: <SearchRoundedIcon sx={{ fontSize: 20, color: "#2563eb" }} />,
    tag: "Analysis",
    title: "Key Topics & Themes",
    description: "See the topics and ideas that come up most.",
    prompt: "What are the primary topics and recurring categories covered in my documents?",
  },
  {
    icon: <FolderSharedOutlinedIcon sx={{ fontSize: 20, color: "#2563eb" }} />,
    tag: "Overview",
    title: "Document Inventory",
    description: "See what kinds of records are in your archive.",
    prompt: "Give me an overview of all the document types, categories, and records I currently have stored.",
  },
];

export default function AssistantPage() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);

  const [historyLoading, setHistoryLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const bottomRef = useRef(null);
  const requestRef = useRef(0);
  const sendingRef = useRef(false);

  const refreshConversations = useCallback(async () => {
    const response = await getConversations();
    setConversations(response.conversations || []);
  }, []);

  // Load conversation history on page mount.
  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const response = await getConversations();

        if (cancelled) return;

        const items = response.conversations || [];
        setConversations(items);

        if (items.length > 0) {
          setActiveId(items[0].id);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load your chat history."
          );
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
      requestRef.current += 1;
    };
  }, []);

  // Load messages whenever the selected conversation changes.
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let cancelled = false;
    const requestId = ++requestRef.current;

    const loadMessages = async () => {
      try {
        setMessagesLoading(true);
        setError("");

        const response = await getConversationMessages(activeId);

        if (cancelled || requestId !== requestRef.current) return;

        setMessages(response.messages || []);
      } catch (err) {
        if (cancelled || requestId !== requestRef.current) return;

        setError(
          err.response?.data?.message ||
            "Unable to load this conversation."
        );

        setMessages([]);
      } finally {
        if (!cancelled && requestId === requestRef.current) {
          setMessagesLoading(false);
        }
      }
    };

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Keep the latest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending]);

  const handleNewChat = () => {
    if (sendingRef.current) return;

    requestRef.current += 1;
    setActiveId(null);
    setMessages([]);
    setError("");
    setMessagesLoading(false);
  };

  const handleSelectChat = (id) => {
    if (sendingRef.current) return;
    if (String(id) === String(activeId)) return;

    requestRef.current += 1;
    setActiveId(id);
    setMessages([]);
    setError("");
  };

  const handleSend = async (question) => {
    const cleanQuestion = question?.trim();

    if (!cleanQuestion || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setError("");

    let conversationId = activeId;
    const temporaryId = `temp-${Date.now()}`;

    // Show the user's question immediately.
    setMessages((previous) => [
      ...previous,
      {
        id: temporaryId,
        role: "user",
        content: cleanQuestion,
        sources: [],
        failed: false,
      },
    ]);

    try {
      if (!conversationId) {
        const created = await createConversation();
        conversationId = created?.conversation?.id;

        if (!conversationId) {
          throw new Error("The new conversation ID was not returned.");
        }

        setActiveId(conversationId);
        await refreshConversations();
      }

      const response = await sendChatMessage(
        conversationId,
        cleanQuestion
      );

      if (!response?.userMessage || !response?.assistantMessage) {
        throw new Error("The server returned an incomplete chat response.");
      }

      setMessages((previous) => {
        const withoutTemporary = previous.filter(
          (message) => message.id !== temporaryId
        );

        return [
          ...withoutTemporary,
          response.userMessage,
          response.assistantMessage,
        ];
      });

      await refreshConversations();
    } catch (err) {
      setMessages((previous) =>
        previous.map((message) =>
          message.id === temporaryId
            ? { ...message, failed: true }
            : message
        )
      );

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleRetry = async (message) => {
    if (sendingRef.current || !message?.content) return;

    setMessages((previous) =>
      previous.filter((item) => item.id !== message.id)
    );

    setError("");
    await handleSend(message.content);
  };

  const handleRename = async (id, title) => {
    try {
      const response = await renameConversation(id, title);

      setConversations((previous) =>
        previous.map((chat) =>
          String(chat.id) === String(id)
            ? response.conversation
            : chat
        )
      );

      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to rename this chat."
      );
    }
  };

  const handleDelete = async (id) => {
    if (sendingRef.current) return;

    if (!window.confirm("Delete this conversation permanently?")) {
      return;
    }

    try {
      await deleteConversation(id);

      const remaining = conversations.filter(
        (chat) => String(chat.id) !== String(id)
      );

      setConversations(remaining);

      if (String(activeId) === String(id)) {
        requestRef.current += 1;
        setActiveId(null);
        setMessages([]);
        setError("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete this chat."
      );
    }
  };

  const handleOpenDocument = async (documentId) => {
    try {
      const response = await viewDocument(documentId);

      if (response.url) {
        window.open(
          response.url,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        setError("The document link could not be generated.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to open this document."
      );
    }
  };

  return (
    <Box
      className="dashboard-assistant assistant-workspace"
      sx={{
        display: "flex",
        height: {
          xs: "calc(100vh - 64px)",
          md: "calc(100vh - 82px)",
        },
        minHeight: 520,
        overflow: "hidden",
        bgcolor: "#ffffff",
        borderRadius: { xs: 0, md: "1rem" },
        border: { xs: "none", md: "1px solid #e2e8f0" },
        boxShadow: "0 1px 3px 0 rgba(15, 23, 42, 0.05)",
      }}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <Box
          className="assistant-history-panel"
          sx={{
            display: { xs: "none", md: "block" },
            height: "100%",
          }}
        >
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            loading={historyLoading}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
            onRenameChat={handleRename}
            onDeleteChat={handleDelete}
          />
        </Box>
      )}

      {/* Main Chat Workspace */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          height: "100%",
          bgcolor: "#fcfdfe",
        }}
      >
        {/* Workspace Header */}
        <Box
          className="assistant-workspace-header"
          sx={{
            px: { xs: 2, md: 3 },
            py: 1.5,
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            bgcolor: "#ffffff",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Tooltip title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
              <IconButton
                onClick={() => setSidebarOpen((value) => !value)}
                size="small"
                sx={{
                  color: "#475569",
                  border: "1px solid #e2e8f0",
                  borderRadius: "0.5rem",
                  p: 0.7,
                }}
              >
                <MenuRoundedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                  AI Document Assistant
                </Typography>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 0.8,
                    py: 0.15,
                    borderRadius: "9999px",
                    bgcolor: "#eff6ff",
                    color: "#1d4ed8",
                    border: "1px solid #bfdbfe",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                  }}
                >
                  <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: "#2563eb" }} />
                  Active
                </Box>
              </Box>

              <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                Ask questions about your archive
              </Typography>
            </Box>
          </Stack>

          <Button
            startIcon={<AddRoundedIcon />}
            onClick={handleNewChat}
            disabled={sending}
            variant="outlined"
            size="small"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              textTransform: "none",
              borderRadius: "0.5rem",
              fontSize: "0.8rem",
            }}
          >
            New Chat
          </Button>
        </Box>

        {/* Chat Stream Area */}
        <Box
          className="assistant-message-stream"
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 2, sm: 3, md: 5 },
            py: 3.5,
          }}
        >
          {messagesLoading ? (
            <Box
              className="assistant-loading-state"
              sx={{
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <CircularProgress size={32} thickness={4} />
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Loading conversation messages...
              </Typography>
            </Box>
          ) : messages.length === 0 ? (
            <Box
              className="assistant-empty-state"
              sx={{
                maxWidth: 820,
                mx: "auto",
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                py: 4,
              }}
            >
              {/* Hero Greeting */}
              <Box textAlign="center" mb={4.5}>
                <Box
                  className="assistant-welcome-icon"
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "1.25rem",
                    background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                    color: "#2563eb",
                    display: "grid",
                    placeItems: "center",
                    mx: "auto",
                    mb: 2.5,
                    border: "1px solid #bfdbfe",
                    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.12)",
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 32 }} />
                </Box>

                <Typography className="assistant-welcome-kicker">
                  DOCUMENTHUB INTELLIGENCE
                </Typography>
                <Typography
                  className="assistant-welcome-title"
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color: "#0f172a",
                    fontSize: { xs: "1.45rem", md: "1.85rem" },
                    letterSpacing: "-0.02em",
                  }}
                >
                  Document Intelligence Assistant
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    mt: 1.25,
                    maxWidth: 580,
                    mx: "auto",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  Ask a question and get a clear answer grounded in your own documents.
                </Typography>
              </Box>

              {/* Suggestion Cards Grid */}
              <Box
                className="assistant-suggestion-grid"
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 2,
                }}
              >
                {suggestions.map((item) => (
                  <Button
                    key={item.title}
                    className="assistant-prompt-card"
                    variant="outlined"
                    disabled={sending}
                    onClick={() => handleSend(item.prompt)}
                    sx={{
                      p: 2.2,
                      textAlign: "left",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      textTransform: "none",
                      color: "#1e293b",
                      borderColor: "#e2e8f0",
                      bgcolor: "#ffffff",
                      borderRadius: "0.85rem",
                      minHeight: 96,
                      boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                      transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                      "&:hover": {
                        borderColor: "#93c5fd",
                        bgcolor: "#f8fafc",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(37, 99, 235, 0.08)",
                      },
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.75 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span className="assistant-prompt-icon">{item.icon}</span>
                          <Typography className="assistant-prompt-title" sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
                            {item.title}
                          </Typography>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: "#64748b",
                            bgcolor: "#f1f5f9",
                            px: 0.8,
                            py: 0.2,
                            borderRadius: "9999px",
                          }}
                        >
                          {item.tag}
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{
                          color: "#64748b",
                          fontSize: "0.825rem",
                          lineHeight: 1.5,
                          whiteSpace: "normal",
                        }}
                      >
                        {item.description}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 860, mx: "auto" }}>
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || `${message.role}-${index}`}
                  message={message}
                  onOpenDocument={handleOpenDocument}
                  onRetry={
                    message.failed && message.role === "user"
                      ? () => handleRetry(message)
                      : undefined
                  }
                />
              ))}

              {sending && (
                <Box
                  className="assistant-input-dock"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 3,
                    p: 2,
                    borderRadius: "0.85rem",
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    width: "fit-content",
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                  }}
                >
                  <CircularProgress size={18} thickness={5} sx={{ color: "#2563eb" }} />

                  <Typography
                    variant="body2"
                    sx={{ color: "#475569", fontWeight: 500, fontSize: "0.85rem" }}
                  >
                    Analyzing documents & synthesizing response...
                  </Typography>
                </Box>
              )}

              <div ref={bottomRef} />
            </Box>
          )}

          {error && (
            <Box
              role="alert"
              sx={{
                maxWidth: 860,
                mx: "auto",
                mt: 2,
                p: 1.75,
                borderRadius: "0.75rem",
                bgcolor: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#b91c1c",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.85rem" }}>
                {error}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Floating Input Dock */}
        <Box
          sx={{
            px: { xs: 2, md: 4 },
            pt: 1.5,
            pb: 2.5,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <ChatInput
            onSend={handleSend}
            loading={sending}
            disabled={messagesLoading}
          />
        </Box>
      </Box>
    </Box>
  );
}
