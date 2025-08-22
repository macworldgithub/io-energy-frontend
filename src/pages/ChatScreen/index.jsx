
// import { useState, useRef, useEffect } from "react";
// import { Button, Input, Spin, DatePicker, TimePicker } from "antd";
// import { SendOutlined, CloseOutlined } from "@ant-design/icons";
// import { SERVER_URL } from "../../config";
// import image from "../../../public/pic.jpeg";
// import axios from "axios";
// import "./ChatWidget.css";

// export default function ChatWidget() {
//   const widgetId = "ths";
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     { text: "Hello! May I have your full name, please?", sender: "bot", showButtons: false },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
//   const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);

//   const [isMobile, setIsMobile] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);

//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

//     // detect mobile
//     const checkMobile = () => setIsMobile(window.innerWidth <= 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [messages, loading, showAppointmentPicker]);

//   const handleOpenChat = async () => {
//     setIsOpen(true);
//     window.parent.postMessage({ event: "iframeButtonClick" }, "*");

//     let userIP = "";
//     try {
//       const ipRes = await axios.get("https://api64.ipify.org?format=json");
//       userIP = ipRes.data.ip;
//     } catch (e) {
//       console.error("IP fetch failed", e);
//     }

//     try {
//       await axios.post(`https://widgetsanalytics.vercel.app/api/track-visitor`, {
//         event: "chat_opened",
//         timestamp: new Date().toISOString(),
//         widgetId,
//         ip: userIP,
//       });
//     } catch (error) {
//       console.error("Failed to track visitor:", error);
//     }
//   };

//   function parseLinks(text) {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     return text.replace(urlRegex, (url) => {
//       return `<a href="${url}" target="_blank" style="color: rgb(237, 0, 141); text-decoration: underline;">${url}</a>`;
//     });
//   }

//   const handleSend = async () => {
//     if (input.trim() === "") return;

//     const newMessages = [...messages, { text: input, sender: "user", showButtons: false }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);

//     const requestBody = { query: input };
//     if (sessionId) requestBody.session_id = sessionId;

//     try {
//       const response = await axios.post(`${SERVER_URL}/query`, requestBody);
//       const newMessage = {
//         text: response.data.message,
//         sender: "bot",
//         showButtons:
//           response.data.message.toLowerCase().includes("preferred day") ||
//           response.data.message.toLowerCase().includes("preferred time"),
//       };
//       setMessages([...newMessages, newMessage]);
//       setSessionId(response.data.session_id);
//       setShowAppointmentPicker(newMessage.showButtons);
//     } catch (error) {
//       console.log(error)
//       setMessages([
//         ...newMessages,
//         { text: "Sorry, something went wrong. Please try again.", sender: "bot", showButtons: false },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookAppointment = async (dateObj) => {
//     if (!sessionId || !dateObj) {
//       setMessages([
//         ...messages,
//         { text: "Please select a date and time for the appointment.", sender: "bot", showButtons: false },
//       ]);
//       return;
//     }

//     setLoading(true);
//     const preferredDay = dateObj.format("YYYY-MM-DD");
//     const preferredTime = dateObj.format("HH:mm");

//     try {
//       const response = await axios.post(`${SERVER_URL}/book_appointment`, {
//         session_id: sessionId,
//         preferred_day: preferredDay,
//         preferred_time: preferredTime,
//       });
//       setMessages([...messages, { text: response.data.message, sender: "bot", showButtons: false }]);
//       setShowAppointmentPicker(false);
//     } catch (error) {
//       const errorMessage = error.response?.data?.detail || "Error booking appointment. Please try again.";
//       setMessages([...messages, { text: errorMessage, sender: "bot", showButtons: false }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMobileConfirm = () => {
//     if (selectedDate && selectedTime) {
//       const combined = selectedDate.clone().set({
//         hour: selectedTime.hour(),
//         minute: selectedTime.minute(),
//       });
//       handleBookAppointment(combined);
//     } else {
//       setMessages([...messages, { text: "Please select both date and time.", sender: "bot", showButtons: false }]);
//     }
//   };

//   return (
//     <div className="ai-chat-widget-wrapper">
//       {!isOpen && (
//         <div className="chat-button-container" onClick={handleOpenChat}>
//           <button className="chat-button">
//             <svg className="chat-button-icon" viewBox="64 64 896 896" focusable="false" fill="currentColor">
//               <path d="M464 512a48 48 0 1096 0 48 48 0 10-96 0zm200 0a48 48 0 1096 0 48 48 0 10-96 0zm-400 0a48 48 0 1096 0 48 48 0 10-96 0zm661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.35 444.35 0 00-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.35 445.35 0 00-142 96.5c-40.9 41.3-73 89.3-95.2 142.8-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 00112 714v152a46 46 0 0046 46h152.1A449.4 449.4 0 00510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.48 444.48 0 00142.8-95.2c41.3-40.9 73.8-88.7 96.5-142 23.6-55.2 35.6-113.9 35.9-174.5.3-60.9-11.5-120-34.8-175.6zm-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8 69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9 44.6 18.7 84.6 45.6 119 80 34.3 34.3 61.3 74.4 80 119 19.4 46.2 29.1 95.2 28.9 145.8-.6 99.6-39.7 192.9-110.1 262.7z"></path>
//             </svg>
//             <span className="chat-button-text">How can I help?</span>
//           </button>
//         </div>
//       )}

//       {isOpen && (
//         <div className="chat-popup">
//           <div className="chat-popup-header">
//             <span>Live Chat</span>
//             <CloseOutlined className="chat-popup-close" onClick={() => setIsOpen(false)} />
//           </div>

//           <div className="chat-popup-messages">
//             {messages.map((msg, index) => (
//               <div key={index} className="message-wrapper">
//                 {msg.sender !== "user" && <img className="bot-avatar" src={image} alt="Bot Avatar" />}
//                 <div
//                   className={msg.sender === "user" ? "user-message" : "bot-message"}
//                   dangerouslySetInnerHTML={{ __html: parseLinks(msg.text) }}
//                 />
//               </div>
//             ))}

//             {showAppointmentPicker && (
//               <div className="message-wrapper">
//                 <div className="bot-message date-picker-container">
//                   {!isMobile ? (
//                     <DatePicker
//                       showTime
//                       format="YYYY-MM-DD HH:mm"
//                       placeholder="Select date and time"
//                       onOk={handleBookAppointment}
//                       popupClassName="custom-date-picker"
//                     />
//                   ) : (
//                     <div className="mobile-date-time-picker">
//                       <DatePicker
//                         format="YYYY-MM-DD"
//                         placeholder="Select date"
//                         onChange={(date) => setSelectedDate(date)}
//                         popupClassName="custom-date-picker"
//                       />
//                       <TimePicker
//                         format="HH:mm"
//                         placeholder="Select time"
//                         onChange={(time) => setSelectedTime(time)}
//                         popupClassName="custom-date-picker"
//                       />
//                       <Button type="primary" size="small" onClick={handleMobileConfirm}>
//                         Confirm
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {loading && (
//               <div className="loading-message">
//                 <Spin size="small" />
//                 <span>Thinking...</span>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           <div className="chat-popup-input">
//             <Input
//               placeholder="Type a message..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onPressEnter={handleSend}
//               disabled={loading || showAppointmentPicker}
//             />
//             <Button
//               shape="circle"
//               icon={<SendOutlined />}
//               className="custom-send-button"
//               onClick={handleSend}
//               disabled={loading || showAppointmentPicker}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// Frontend: ChatWidget.jsx
// import { useState, useRef, useEffect } from "react";
// import { Button, Input, Spin, DatePicker, TimePicker } from "antd";
// import { SendOutlined, CloseOutlined } from "@ant-design/icons";
// import { SERVER_URL } from "../../config";
// import image from "../../../public/pic.jpeg";
// import axios from "axios";
// import "./ChatWidget.css";

// export default function ChatWidget() {
//   const widgetId = "ths";
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([
//     { text: "Hello! May I have your full name, please?", sender: "bot", showButtons: false },
//   ]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
//   const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);

//   const [isMobile, setIsMobile] = useState(false);
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);

//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

//     // detect mobile
//     const checkMobile = () => setIsMobile(window.innerWidth <= 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [messages, loading, showAppointmentPicker]);

//   const handleOpenChat = async () => {
//     setIsOpen(true);
//     window.parent.postMessage({ event: "iframeButtonClick" }, "*");

//     let userIP = "";
//     try {
//       const ipRes = await axios.get("https://api64.ipify.org?format=json");
//       userIP = ipRes.data.ip;
//     } catch (e) {
//       console.error("IP fetch failed", e);
//     }

//     try {
//       await axios.post(`https://widgetsanalytics.vercel.app/api/track-visitor`, {
//         event: "chat_opened",
//         timestamp: new Date().toISOString(),
//         widgetId,
//         ip: userIP,
//       });
//     } catch (error) {
//       console.error("Failed to track visitor:", error);
//     }
//   };

//   function parseLinks(text) {
//     const urlRegex = /(https?:\/\/[^\s]+)/g;
//     return text.replace(urlRegex, (url) => {
//       return `<a href="${url}" target="_blank" style="color: rgb(237, 0, 141); text-decoration: underline;">${url}</a>`;
//     });
//   }

//   const handleSuggestionClick = (suggestion) => {
//     setInput(suggestion);
//   };

//   const handleSend = async () => {
//     if (input.trim() === "") return;

//     const newMessages = [...messages, { text: input, sender: "user", showButtons: false }];
//     setMessages(newMessages);
//     setInput("");
//     setLoading(true);
//     setSuggestions([]); // Clear suggestions before sending

//     const requestBody = { query: input };
//     if (sessionId) requestBody.session_id = sessionId;

//     try {
//       const response = await axios.post(`${SERVER_URL}/query`, requestBody);
//       const newMessage = {
//         text: response.data.message,
//         sender: "bot",
//         showButtons:
//           response.data.message.toLowerCase().includes("preferred day") ||
//           response.data.message.toLowerCase().includes("preferred time"),
//       };
//       setMessages([...newMessages, newMessage]);
//       setSessionId(response.data.session_id);
//       setShowAppointmentPicker(newMessage.showButtons);
//       setSuggestions(response.data.suggestions || []); // Set new suggestions
//     } catch (error) {
//       console.log(error);
//       setMessages([
//         ...newMessages,
//         { text: "Sorry, something went wrong. Please try again.", sender: "bot", showButtons: false },
//       ]);
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookAppointment = async (dateObj) => {
//     if (!sessionId || !dateObj) {
//       setMessages([
//         ...messages,
//         { text: "Please select a date and time for the appointment.", sender: "bot", showButtons: false },
//       ]);
//       setSuggestions([]);
//       return;
//     }

//     setLoading(true);
//     const preferredDay = dateObj.format("YYYY-MM-DD");
//     const preferredTime = dateObj.format("HH:mm");

//     try {
//       const response = await axios.post(`${SERVER_URL}/book_appointment`, {
//         session_id: sessionId,
//         preferred_day: preferredDay,
//         preferred_time: preferredTime,
//       });
//       setMessages([...messages, { text: response.data.message, sender: "bot", showButtons: false }]);
//       setShowAppointmentPicker(false);
//       setSuggestions([]);
//     } catch (error) {
//       const errorMessage = error.response?.data?.detail || "Error booking appointment. Please try again.";
//       setMessages([...messages, { text: errorMessage, sender: "bot", showButtons: false }]);
//       setSuggestions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleMobileConfirm = () => {
//     if (selectedDate && selectedTime) {
//       const combined = selectedDate.clone().set({
//         hour: selectedTime.hour(),
//         minute: selectedTime.minute(),
//       });
//       handleBookAppointment(combined);
//     } else {
//       setMessages([...messages, { text: "Please select both date and time.", sender: "bot", showButtons: false }]);
//       setSuggestions([]);
//     }
//   };

//   return (
//     <div className="ai-chat-widget-wrapper">
//       {!isOpen && (
//         <div className="chat-button-container" onClick={handleOpenChat}>
//           <button className="chat-button">
//             <svg className="chat-button-icon" viewBox="64 64 896 896" focusable="false" fill="currentColor">
//               <path d="M464 512a48 48 0 1096 0 48 48 0 10-96 0zm200 0a48 48 0 1096 0 48 48 0 10-96 0zm-400 0a48 48 0 1096 0 48 48 0 10-96 0zm661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.35 444.35 0 00-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.35 445.35 0 00-142 96.5c-40.9 41.3-73 89.3-95.2 142.8-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 00112 714v152a46 46 0 0046 46h152.1A449.4 449.4 0 00510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.48 444.48 0 00142.8-95.2c41.3-40.9 73.8-88.7 96.5-142 23.6-55.2 35.6-113.9 35.9-174.5.3-60.9-11.5-120-34.8-175.6zm-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8 69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9 44.6 18.7 84.6 45.6 119 80 34.3 34.3 61.3 74.4 80 119 19.4 46.2 29.1 95.2 28.9 145.8-.6 99.6-39.7 192.9-110.1 262.7z"></path>
//             </svg>
//             <span className="chat-button-text">How can I help?</span>
//           </button>
//         </div>
//       )}

//       {isOpen && (
//         <div className="chat-popup">
//           <div className="chat-popup-header">
//             <span>Live Chat</span>
//             <CloseOutlined className="chat-popup-close" onClick={() => setIsOpen(false)} />
//           </div>

//           <div className="chat-popup-messages">
//             {messages.map((msg, index) => (
//               <div key={index} className="message-wrapper">
//                 {msg.sender !== "user" && <img className="bot-avatar" src={image} alt="Bot Avatar" />}
//                 <div
//                   className={msg.sender === "user" ? "user-message" : "bot-message"}
//                   dangerouslySetInnerHTML={{ __html: parseLinks(msg.text) }}
//                 />
//               </div>
//             ))}

//             {showAppointmentPicker && (
//               <div className="message-wrapper">
//                 <div className="bot-message date-picker-container">
//                   {!isMobile ? (
//                     <DatePicker
//                       showTime
//                       format="YYYY-MM-DD HH:mm"
//                       placeholder="Select date and time"
//                       onOk={handleBookAppointment}
//                       popupClassName="custom-date-picker"
//                     />
//                   ) : (
//                     <div className="mobile-date-time-picker">
//                       <DatePicker
//                         format="YYYY-MM-DD"
//                         placeholder="Select date"
//                         onChange={(date) => setSelectedDate(date)}
//                         popupClassName="custom-date-picker"
//                       />
//                       <TimePicker
//                         format="HH:mm"
//                         placeholder="Select time"
//                         onChange={(time) => setSelectedTime(time)}
//                         popupClassName="custom-date-picker"
//                       />
//                       <Button type="primary" size="small" onClick={handleMobileConfirm}>
//                         Confirm
//                       </Button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {loading && (
//               <div className="loading-message">
//                 <Spin size="small" />
//                 <span>Thinking...</span>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {suggestions.length > 0 && !loading && !showAppointmentPicker && (
//             <div className="suggestions-container">
//               {suggestions.map((sug, sugIndex) => (
//                 <Button
//                   key={sugIndex}
//                   className="suggestion-button"
//                   onClick={() => handleSuggestionClick(sug)}
//                   disabled={loading || showAppointmentPicker}
//                 >
//                   {sug}
//                 </Button>
//               ))}
//             </div>
//           )}

//           <div className="chat-popup-input">
//             <Input
//               placeholder="Type a message..."
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onPressEnter={handleSend}
//               disabled={loading || showAppointmentPicker}
//             />
//             <Button
//               shape="circle"
//               icon={<SendOutlined />}
//               className="custom-send-button"
//               onClick={handleSend}
//               disabled={loading || showAppointmentPicker}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import { Button, Input, Spin, DatePicker, TimePicker } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";
import { SERVER_URL } from "../../config";
import image from "../../../public/pic.jpeg";
import axios from "axios";
import "./ChatWidget.css";

export default function ChatWidget() {
  const widgetId = "ths";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! May I have your full name, please?", sender: "bot", showButtons: false },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const messagesEndRef = useRef(null);
  const widgetRef = useRef(null); // Ref for the widget wrapper

  useEffect(() => {
    // Append widget to body to ensure it renders last in DOM
    if (widgetRef.current) {
      document.body.appendChild(widgetRef.current);
    }

    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Detect mobile
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [messages, loading, showAppointmentPicker]);

  const handleOpenChat = async () => {
    setIsOpen(true);
    window.parent.postMessage({ event: "iframeButtonClick" }, "*");

    let userIP = "";
    try {
      const ipRes = await axios.get("https://api64.ipify.org?format=json");
      userIP = ipRes.data.ip;
    } catch (e) {
      console.error("IP fetch failed", e);
    }

    try {
      await axios.post(`https://widgetsanalytics.vercel.app/api/track-visitor`, {
        event: "chat_opened",
        timestamp: new Date().toISOString(),
        widgetId,
        ip: userIP,
      });
    } catch (error) {
      console.error("Failed to track visitor:", error);
    }
  };

  function parseLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, (url) => {
      return `<a href="${url}" target="_blank" style="color: rgb(237, 0, 141); text-decoration: underline;">${url}</a>`;
    });
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleSend = async () => {
    if (input.trim() === "") return;

    const newMessages = [...messages, { text: input, sender: "user", showButtons: false }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setSuggestions([]); // Clear suggestions before sending

    const requestBody = { query: input };
    if (sessionId) requestBody.session_id = sessionId;

    try {
      const response = await axios.post(`${SERVER_URL}/query`, requestBody);
      const newMessage = {
        text: response.data.message,
        sender: "bot",
        showButtons:
          response.data.message.toLowerCase().includes("preferred day") ||
          response.data.message.toLowerCase().includes("preferred time"),
      };
      setMessages([...newMessages, newMessage]);
      setSessionId(response.data.session_id);
      setShowAppointmentPicker(newMessage.showButtons);
      setSuggestions(response.data.suggestions || []); // Set new suggestions
    } catch (error) {
      console.log(error);
      setMessages([
        ...newMessages,
        { text: "Sorry, something went wrong. Please try again.", sender: "bot", showButtons: false },
      ]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (dateObj) => {
    if (!sessionId || !dateObj) {
      setMessages([
        ...messages,
        { text: "Please select a date and time for the appointment.", sender: "bot", showButtons: false },
      ]);
      setSuggestions([]);
      return;
    }

    setLoading(true);
    const preferredDay = dateObj.format("YYYY-MM-DD");
    const preferredTime = dateObj.format("HH:mm");

    try {
      const response = await axios.post(`${SERVER_URL}/book_appointment`, {
        session_id: sessionId,
        preferred_day: preferredDay,
        preferred_time: preferredTime,
      });
      setMessages([...messages, { text: response.data.message, sender: "bot", showButtons: false }]);
      setShowAppointmentPicker(false);
      setSuggestions([]);
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Error booking appointment. Please try again.";
      setMessages([...messages, { text: errorMessage, sender: "bot", showButtons: false }]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMobileConfirm = () => {
    if (selectedDate && selectedTime) {
      const combined = selectedDate.clone().set({
        hour: selectedTime.hour(),
        minute: selectedTime.minute(),
      });
      handleBookAppointment(combined);
    } else {
      setMessages([...messages, { text: "Please select both date and time.", sender: "bot", showButtons: false }]);
      setSuggestions([]);
    }
  };

  return (
    <div className="ai-chat-widget-wrapper" ref={widgetRef}>
      {!isOpen && (
        <div className="chat-button-container" onClick={handleOpenChat}>
          <button className="chat-button">
            <svg className="chat-button-icon" viewBox="64 64 896 896" focusable="false" fill="currentColor">
              <path d="M464 512a48 48 0 1096 0 48 48 0 10-96 0zm200 0a48 48 0 1096 0 48 48 0 10-96 0zm-400 0a48 48 0 1096 0 48 48 0 10-96 0zm661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.35 444.35 0 00-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.35 445.35 0 00-142 96.5c-40.9 41.3-73 89.3-95.2 142.8-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 00112 714v152a46 46 0 0046 46h152.1A449.4 449.4 0 00510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.48 444.48 0 00142.8-95.2c41.3-40.9 73.8-88.7 96.5-142 23.6-55.2 35.6-113.9 35.9-174.5.3-60.9-11.5-120-34.8-175.6zm-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8 69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9 44.6 18.7 84.6 45.6 119 80 34.3 34.3 61.3 74.4 80 119 19.4 46.2 29.1 95.2 28.9 145.8-.6 99.6-39.7 192.9-110.1 262.7z"></path>
            </svg>
            <span className="chat-button-text">How can I help?</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="chat-popup">
          <div className="chat-popup-header">
            <span>Live Chat</span>
            <CloseOutlined className="chat-popup-close" onClick={() => setIsOpen(false)} />
          </div>

          <div className="chat-popup-messages">
            {messages.map((msg, index) => (
              <div key={index} className="message-wrapper">
                {msg.sender !== "user" && <img className="bot-avatar" src={image} alt="Bot Avatar" />}
                <div
                  className={msg.sender === "user" ? "user-message" : "bot-message"}
                  dangerouslySetInnerHTML={{ __html: parseLinks(msg.text) }}
                />
              </div>
            ))}

            {showAppointmentPicker && (
              <div className="message-wrapper">
                <div className="bot-message date-picker-container">
                  {!isMobile ? (
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      placeholder="Select date and time"
                      onOk={handleBookAppointment}
                      popupClassName="custom-date-picker"
                    />
                  ) : (
                    <div className="mobile-date-time-picker">
                      <DatePicker
                        format="YYYY-MM-DD"
                        placeholder="Select date"
                        onChange={(date) => setSelectedDate(date)}
                        popupClassName="custom-date-picker"
                      />
                      <TimePicker
                        format="HH:mm"
                        placeholder="Select time"
                        onChange={(time) => setSelectedTime(time)}
                        popupClassName="custom-date-picker"
                      />
                      <Button type="primary" size="small" onClick={handleMobileConfirm}>
                        Confirm
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-message">
                <Spin size="small" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {suggestions.length > 0 && !loading && !showAppointmentPicker && (
            <div className="suggestions-container">
              {suggestions.map((sug, sugIndex) => (
                <Button
                  key={sugIndex}
                  className="suggestion-button"
                  onClick={() => handleSuggestionClick(sug)}
                  disabled={loading || showAppointmentPicker}
                >
                  {sug}
                </Button>
              ))}
            </div>
          )}

          <div className="chat-popup-input">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPressEnter={handleSend}
              disabled={loading || showAppointmentPicker}
            />
            <Button
              shape="circle"
              icon={<SendOutlined />}
              className="custom-send-button"
              onClick={handleSend}
              disabled={loading || showAppointmentPicker}
            />
          </div>
        </div>
      )}
    </div>
  );
}