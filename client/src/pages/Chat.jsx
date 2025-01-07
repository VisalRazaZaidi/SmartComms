import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import AppLayout from '../components/layout/AppLayout';
import { IconButton, Skeleton, Stack } from '@mui/material';
import {
  AttachFile as AttachFileIcon,
  Send as SendIcon,
  Mic as MicIcon,
} from '@mui/icons-material';
import { InputBox } from '../components/styles/StyledComponents';
import FileMenu from '../components/dialogs/FileMenu';
import MessageComponent from '../components/shared/MessageComponent';
import { getSocket } from '../socket';
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVED,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} from '../constants/events';
import { useChatDetailsQuery, useGetMessagesQuery } from '../redux/api/api';
import { useErrors, useSocketEvents } from '../hooks/hook';
import { useInfiniteScrollTop } from '6pp';
import { useDispatch } from 'react-redux';
import { setIsFileMenu } from '../redux/reducers/misc';
import { removeNewMessagesAlert } from '../redux/reducers/chat';
import { TypingLoader } from '../components/layout/Loaders';
import { useNavigate } from 'react-router-dom';

const Chat = ({ chatId, user }) => {
  const messageInputRef = useRef("")
  const socket = getSocket();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null);
  const [IamTyping, setIamTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const typingTimeout = useRef(null);

  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId });
  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.chat?.members;

  function messageOnChange(e) {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId });
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, [2000]);
  }

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true));
    setFileMenuAnchor(e.currentTarget);
  };

  const [smartReplyEnabled, setSmartReplyEnabled] = React.useState(true);
  const [replySuggestions, setReplySuggestions] = useState([]);

  const handleToggleSmartReply = () => {
    setSmartReplyEnabled((prev) => {
      // console.log('!prev', !prev, '!prev');
      return !prev;
    });
  };

  const generateSmartReplies = async (messageContent) => {
    try {
      const response = await fetch('http://localhost:9090/api/smart-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageContent })
      });
      console.log(messageContent);

      const data = await response.json();
      return data.replies;
    } catch (error) {
      console.error('Error generating smart replies:', error);
      return [
        `Reply to: ${messageContent}`,
        `Interesting point about: ${messageContent}`,
        `Can you elaborate on: ${messageContent}?`,
      ];
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage('');
  };

  const handleSpeechToText = () => {
    const recognition = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = true;

    if (!isListening) {
      recognition.start();
      setIsListening(true);
    }

    recognition.onresult = (event) => {
      const currentTranscript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join('');
      setMessage(currentTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };
  };

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });
    dispatch(removeNewMessagesAlert(chatId));

    return () => {
      setMessages([]);
      setMessage('');
      setOldMessages([]);
      setPage(1);
      socket.emit(CHAT_LEAVED, { userId: user._id, members });
    };
  }, [chatId]);

  useEffect(() => {
    if (bottomRef.current)
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatDetails.isError) return navigate('/');
  }, [chatDetails.isError]);

  const newMessagesListener = useCallback(async(data) => {
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);

      console.log(data)
      if (smartReplyEnabled && data.message.sender._id !== user._id) {
        const suggestions = await generateSmartReplies (data.message.content);
        console.log('[suggestions]',suggestions)
        setReplySuggestions([suggestions]);
      }
    },
    [chatId, smartReplyEnabled]
  );

  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
    },
    [chatId]
  );

  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
    },
    [chatId]
  );

  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: 'djasdhajksdhasdsadasdas',
          name: 'Admin',
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, messageForAlert]);
    },
    [chatId]
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  useSocketEvents(socket, eventHandler);

  useErrors(errors);

  const allMessages = [...oldMessages, ...messages];

  useEffect(() => {
    setMessages((prevMessages) => {
      // console.log(prevMessages.length, 'sdddddddddddddddd');
      let lastMsg =
        prevMessages.length > 0 ? prevMessages[prevMessages.length - 1] : null;
      // Simulate receiving a new message
      if (smartReplyEnabled && lastMsg && lastMsg.sender._id != user._id) {
        // const newMessage = 'Hello, how are you?';
        let newMsg = fetchSmartReplies(lastMsg.content);
        let newMsgObj = {
          _id: '6778620b6d8bb7a168471b3b',
          content: newMsg,
          sender: {
            _id: user._id,
            name: user.name,
          },
          chat: lastMsg.chat,
          attachments: [],
          createdAt: '2025-01-03T22:17:47.653Z',
          updatedAt: '2025-01-03T22:17:47.653Z',
          __v: 0,
        };
        return [...prevMessages, newMsgObj];
      }

      return [...prevMessages];
    });

    // console.log(lastMsg);

    // console.log('smartReplyEnabled', smartReplyEnabled, 'smartReplyEnabled');

    // let aaa = {
    //   _id: '6778620b6d8bb7a168471b3b',
    //   content: newMessage,
    //   sender: {
    //     _id: '676fed9d662c1925052766d1',
    //     name: 'Sara',
    //   },
    //   chat: '676fedac662c1925052766e9',
    //   attachments: [],
    //   createdAt: '2025-01-03T22:17:47.653Z',
    //   updatedAt: '2025-01-03T22:17:47.653Z',
    //   __v: 0,
    // };

    setMessages((prevMessages) => [...prevMessages]);

    // Send the new message to the backend for AI analysis
    // fetchSmartReplies(aaa);
  }, []);

  async function fetchSmartReplies(message) {
    try {
      const response = await fetch('http://localhost:9090/api/smart-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setReplySuggestions(data.replies || '');
      console.log('Smart replies:', data.replies);
    } catch (error) {
      console.error('Error generating smart replies:', error);
    }
  }

  const handleReplySelect = (reply) => {
    // console.log("calling ....")
    // Send the selected reply as a message
    // setMessages((prevMessages) => [...prevMessages, reply]);
    // setMessages([...messages,reply])
    // console.log("calling ....",)
    // messageInputRef.current.value = reply
    setReplySuggestions([]); // Clear suggestions after sending
  };

  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <Fragment>
      <Stack
        ref={containerRef}
        boxSizing="border-box"
        padding="1rem"
        spacing="1rem"
        bgcolor="white"
        height="90%"
        sx={{
          overflowX: 'hidden',
          overflowY: 'auto',
          backgroundImage: `url('https://i.ibb.co/7GK6Gnr/gi-Dck-OUM5a.png')`,
          backgroundSize: 'cover',
          backgroundColor: 'rgb(240, 235, 228)',
        }}
      >
        {allMessages.map((message,i) => {
          // console.log('Message: ', message);
          // console.log('User: ', user);
          return (
            <MessageComponent key={i} message={message} user={user} />
          );
        })}

        {userTyping && <TypingLoader />}

        <div ref={bottomRef} />
      </Stack>

      <form
        style={{
          height: '10%',
        }}
        onSubmit={submitHandler}
      >
        <Stack
          direction="row"
          height="100%"
          padding="0.75rem"
          alignItems="center"
          position="relative"
          bgcolor="rgb(240, 242, 245)"
        >
          <IconButton
            sx={{
              position: 'absolute',
              left: '1rem',
              transform: 'rotate(30deg)', // Use 'transform' for rotation
            }}
            onClick={handleFileOpen}
          >
            <AttachFileIcon />
          </IconButton>

          <InputBox
            placeholder="Type Message Here..."
            value={message}
            onChange={messageOnChange}
            fullWidth // Ensure it stretches within its container
          />

          <IconButton
            onClick={handleToggleSmartReply}
            sx={{
              marginLeft: '1rem',
              padding: '0.5rem',
              borderRadius: '10px',
              fontSize: '14px',
              bgcolor: smartReplyEnabled
                ? 'rgb(76, 175, 80)'
                : 'rgb(244, 67, 54)',
              color: 'white',
              '&:hover': {
                bgcolor: smartReplyEnabled
                  ? 'rgb(56, 142, 60)'
                  : 'rgb(211, 47, 47)',
              },
            }}
          >
            {smartReplyEnabled ? 'Disable Smart Reply' : 'Enable Smart Reply'}
          </IconButton>

          <IconButton
            onClick={handleSpeechToText}
            sx={{
              bgcolor: isListening ? 'rgb(255, 87, 34)' : 'rgb(33, 150, 243)',
              color: 'white',
              marginLeft: '1rem',
              padding: '0.5rem',
              '&:hover': {
                bgcolor: isListening ? 'rgb(244, 67, 54)' : 'rgb(30, 136, 229)',
              },
            }}
          >
            <MicIcon />
          </IconButton>

          <IconButton
            type="submit"
            sx={{
              bgcolor: 'rgb(77, 127, 255)',
              color: 'white',
              marginLeft: '1rem',
              padding: '0.5rem',
              '&:hover': {
                bgcolor: 'rgb(39, 98, 253)',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Stack>

        {smartReplyEnabled && replySuggestions?.length > 0 && (
          <Stack direction="row" spacing={1} padding="0.5rem">
            {replySuggestions?.map((suggestion, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'rgb(240, 242, 245)',
                  border: 'none',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  borderRadius: '10px',
                }}
              >
                {suggestion}
              </div>
            ))}
          </Stack>
        )}

        <FileMenu anchorEl={fileMenuAnchor} chatId={chatId} />
      </form>
    </Fragment>
  );
};
export default AppLayout()(Chat);
