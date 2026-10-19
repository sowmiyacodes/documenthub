
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
    title: "Find information",
    prompt: "What are the main topics covered in my documents?",
  },
  {
    title: "Understand a document",
    prompt: "Summarize the most important information in my documents.",
  },
  {
    title: "Find a specific detail",
    prompt: "Find important dates and deadlines in my documents.",
  },
  {
    title: "Explore my files",
    prompt: "What types of documents have I uploaded?",
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

  const refreshConversations = useCallback(async () => {
    const response = await getConversations();
    setConversations(response.conversations || []);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const response = await getConversations();

        if (cancelled) return;

        const items = response.conversations || [];
        setConversations(items);

        // Show the most recent chat automatically.
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
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
      requestRef.current += 1;
    };
  }, []);

  useEffect(() => {
    if (!activeId) {
      setMessages([]);
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, sending]);

  const handleNewChat = () => {
    // Start a clean conversation. A database record is created
    // when the user sends their first message.
    requestRef.current += 1;
    setActiveId(null);
    setMessages([]);
    setError("");
  };

  const handleSelectChat = (id) => {
    if (String(id) === String(activeId)) return;

    requestRef.current += 1;
    setActiveId(id);
    setMessages([]);
    setError("");
  };

  const handleSend = async (question) => {
    if (sending) return;

    setSending(true);
    setError("");

    let conversationId = activeId;
    const temporaryId = `temp-${Date.now()}`;

    // Optimistically display the user's message.
    setMessages((previous) => [
      ...previous,
      {
        id: temporaryId,
        role: "user",
        content: question,
        sources: [],
      },
    ]);

    try {
      if (!conversationId) {
        const created = await createConversation();
        conversationId = created.conversation.id;

        setActiveId(conversationId);
        await refreshConversations();
      }

      const response = await sendChatMessage(
        conversationId,
        question
      );

      // Use the saved messages returned by the backend.
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
      setError(
        err.response?.data?.message ||
          "Unable to send your message. Please try again."
      );

      // Keep the user's message visible so it can be retried.
    } finally {
      setSending(false);
    }
  };

  const handleRename = async (id, title) => {
    try {
      const response = await renameConversation(id, title);

      setConversations((previous) =>
        previous.map((chat) =>
          chat.id === id ? response.conversation : chat
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to rename this chat."
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this conversation permanently?")) {
      return;
    }

    try {
      await deleteConversation(id);

      const remaining = conversations.filter((chat) => chat.id !== id);
      setConversations(remaining);

      if (String(activeId) === String(id)) {
        requestRef.current += 1;
        setActiveId(null);
        setMessages([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to delete this chat."
      );
    }
  };

  const handleOpenDocument = async (documentId) => {
    try {
      const response = await viewDocument(documentId);

      if (response.url) {
        window.open(response.url, "_blank", "noopener,noreferrer");
      } else {
        setError("The document link could not be generated.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to open this document."
      );
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: {
          xs: "calc(100vh - 64px)",
          md: "calc(100vh - 72px)",
        },
        minHeight: 520,
        overflow: "hidden",
        bgcolor: "#fff",
        borderRadius: { xs: 0, md: 3 },
        border: { xs: "none", md: "1px solid #E2E8F0" },
      }}
    >
      {sidebarOpen && (
        <Box
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

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          height: "100%",
        }}
      >
        <Box
          sx={{
            px: { xs: 1.5, md: 3 },
            py: 1.5,
            borderBottom: "1px solid #E2E8F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Tooltip title={sidebarOpen ? "Hide history" : "Show history"}>
              <IconButton
                onClick={() => setSidebarOpen((value) => !value)}
                sx={{ color: "#475569" }}
              >
                <MenuRoundedIcon />
              </IconButton>
            </Tooltip>

            <Box>
              <Typography fontWeight={800} color="#0F172A">
                AI Assistant
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Your personal document intelligence
              </Typography>
            </Box>
          </Stack>

          <Button
            startIcon={<AddRoundedIcon />}
            onClick={handleNewChat}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              textTransform: "none",
            }}
          >
            New
          </Button>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: { xs: 2, md: 4 },
            py: 3,
          }}
        >
          {messagesLoading ? (
            <Box
              sx={{
                minHeight: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : messages.length === 0 ? (
            <Box
              sx={{
                maxWidth: 850,
                mx: "auto",
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Box textAlign="center" mb={4}>
                <Box
                  sx={{
                    width: 68,
                    height: 68,
                    borderRadius: 4,
                    bgcolor: "#DBEAFE",
                    color: "#2563EB",
                    display: "grid",
                    placeItems: "center",
                    mx: "auto",
                    mb: 2.5,
                  }}
                >
                  <AutoAwesomeRoundedIcon sx={{ fontSize: 34 }} />
                </Box>

                <Typography
                  variant="h4"
                  fontWeight={800}
                  color="#0F172A"
                  sx={{ fontSize: { xs: 25, md: 32 } }}
                >
                  What can I help you find?
                </Typography>

                <Typography color="text.secondary" mt={1.5}>
                  Ask questions about your uploaded documents in natural language.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {suggestions.map((item) => (
                  <Button
                    key={item.title}
                    variant="outlined"
                    onClick={() => handleSend(item.prompt)}
                    sx={{
                      p: 2,
                      textAlign: "left",
                      alignItems: "flex-start",
                      justifyContent: "flex-start",
                      textTransform: "none",
                      color: "#334155",
                      borderColor: "#E2E8F0",
                      borderRadius: 3,
                      minHeight: 88,
                      "&:hover": {
                        borderColor: "#93C5FD",
                        bgcolor: "#F8FAFF",
                      },
                    }}
                  >
                    <Box>
                      <Typography fontWeight={700} mb={0.5}>
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ whiteSpace: "normal" }}
                      >
                        {item.prompt}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ maxWidth: 850, mx: "auto" }}>
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id || `${message.role}-${index}`}
                  message={message}
                  onOpenDocument={handleOpenDocument}
                />
              ))}

              {sending && (
                <Box display="flex" alignItems="center" gap={1.5} mb={3}>
                  <CircularProgress size={24} />
                  <Typography color="text.secondary" variant="body2">
                    LifeHub AI is thinking...
                  </Typography>
                </Box>
              )}

              <div ref={bottomRef} />
            </Box>
          )}

          {error && (
            <Box
              sx={{
                maxWidth: 850,
                mx: "auto",
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: "#FEF2F2",
                color: "#B91C1C",
              }}
            >
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            px: { xs: 1.5, md: 3 },
            pt: 1.5,
            pb: 2,
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <ChatInput onSend={handleSend} loading={sending} />
        </Box>
      </Box>
    </Box>
  );
}
