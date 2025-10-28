import { useState, useRef, useEffect } from "react";
import { Button, Input, Spin, DatePicker, TimePicker } from "antd";
import { SendOutlined, CloseOutlined } from "@ant-design/icons";
import { SERVER_URL } from "../../config";
import axios from "axios";
import "./ChatWidget.css";

// Centralized iO Logo URL
const LOGO_URL =
  "https://na1.hubspot-logos.com/80ea9a8f-ce90-4028-aceb-97b72755cd5b";

export default function ChatWidget() {
  const widgetId = "io-energy";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [messages, loading, showAppointmentPicker]);

  const handleOpenChat = async () => {
    setIsOpen(true);
    if (!sessionId) {
      try {
        const response = await axios.post(`${SERVER_URL}/query`, { query: "" });
        setSessionId(response.data.session_id);
        setMessages([{ text: response.data.message, sender: "bot" }]);
        setSuggestions(response.data.suggestions || []);
      } catch (error) {
        setMessages([
          {
            text: "Hello! How can I help you save on energy today?",
            sender: "bot",
          },
        ]);
      }
    }
  };

  const parseLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(
      urlRegex,
      (url) => `
      <a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #FF127F; text-decoration: underline;">
        ${url}
      </a>
    `
    );
  };

  const handleSend = async (overrideInput = null) => {
    const messageToSend = overrideInput || input.trim();
    if (!messageToSend) return;

    const userMessage = { text: messageToSend, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setSuggestions([]);

    try {
      const response = await axios.post(`${SERVER_URL}/query`, {
        query: messageToSend,
        session_id: sessionId,
      });

      const botMessage = {
        text: response.data.message,
        sender: "bot",
        showButtons: response.data.message.includes("preferred day"),
      };

      setMessages((prev) => [...prev, botMessage]);
      setShowAppointmentPicker(botMessage.showButtons);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      const errorText =
        "Sorry, I'm having trouble connecting. Please try again.";
      setMessages((prev) => [...prev, { text: errorText, sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!fullName || !email || !phone || !postcode || !selectedDate) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Please fill in all fields and select a date/time.",
          sender: "bot",
        },
      ]);
      return;
    }

    setLoading(true);
    const preferredDay = selectedDate.format("YYYY-MM-DD");
    const preferredTime =
      isMobile && selectedTime
        ? selectedTime.format("HH:mm")
        : selectedDate.format("HH:mm");

    try {
      const response = await axios.post(`${SERVER_URL}/book_appointment`, {
        session_id: sessionId,
        preferred_day: preferredDay,
        preferred_time: preferredTime,
        full_name: fullName,
        email,
        phone,
        postcode,
      });

      setMessages((prev) => [
        ...prev,
        { text: response.data.message, sender: "bot" },
      ]);
      setShowAppointmentPicker(false);
      resetForm();
    } catch (error) {
      const errMsg =
        error.response?.data?.detail || "Failed to book. Please try again.";
      setMessages((prev) => [...prev, { text: errMsg, sender: "bot" }]);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPostcode("");
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleConfirm = () => {
    if (isMobile && !selectedTime) {
      setMessages((prev) => [
        ...prev,
        { text: "Please select a time.", sender: "bot" },
      ]);
      return;
    }
    handleBookAppointment();
  };

  return (
    <div className="io-chat-widget">
      {/* Floating Button */}
      {!isOpen && (
        <div className="io-chat-button-container" onClick={handleOpenChat}>
          <button className="io-chat-button">
            <img src={LOGO_URL} alt="iO" className="io-chat-icon-logo" />
            <span className="io-chat-text">How can I help?</span>
          </button>
        </div>
      )}

      {/* Chat Popup */}
      {isOpen && (
        <div className="io-chat-popup">
          {/* Header */}
          <div className="io-chat-header">
            <div className="io-header-left">
              <img src={LOGO_URL} alt="iO Energy" className="io-logo" />
              <span>iO Energy Assistant</span>
            </div>
            <CloseOutlined
              className="io-close"
              onClick={() => setIsOpen(false)}
            />
          </div>

          {/* Messages */}
          <div className="io-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`io-message-wrapper ${msg.sender}`}>
                {msg.sender === "bot" && (
                  <div className="io-bot-avatar">
                    <img src={LOGO_URL} alt="iO" className="io-bot-logo" />
                  </div>
                )}
                <div
                  className={`io-message ${
                    msg.sender === "user" ? "user" : "bot"
                  }`}
                  dangerouslySetInnerHTML={{
                    __html: parseLinks(msg.text.replace(/\n/g, "<br />")),
                  }}
                />
              </div>
            ))}

            {/* Appointment Form */}
            {showAppointmentPicker && (
              <div className="io-message-wrapper bot">
                <div className="io-bot-avatar">
                  <img src={LOGO_URL} alt="iO" className="io-bot-logo" />
                </div>
                <div className="io-appointment-form">
                  <Input
                    placeholder="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="io-form-input"
                  />
                  <Input
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="io-form-input"
                  />
                  <Input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="io-form-input"
                  />
                  <Input
                    placeholder="Postcode"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="io-form-input"
                  />

                  {/* Desktop: Combined Date & Time */}
                  {!isMobile ? (
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      placeholder="Preferred Day & Time"
                      onChange={setSelectedDate}
                      className="io-form-input io-picker-input"
                      popupClassName="io-custom-date-picker"
                    />
                  ) : (
                    <>
                      <DatePicker
                        format="YYYY-MM-DD"
                        placeholder="Select date"
                        onChange={setSelectedDate}
                        className="io-form-input io-picker-input"
                        popupClassName="io-custom-date-picker"
                      />
                      <TimePicker
                        format="HH:mm"
                        placeholder="Select time"
                        onChange={setSelectedTime}
                        className="io-form-input io-picker-input"
                        popupClassName="io-custom-date-picker"
                      />
                    </>
                  )}

                  <Button
                    type="primary"
                    onClick={handleConfirm}
                    className="io-confirm-btn"
                  >
                    Book Call Back
                  </Button>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="io-loading">
                <Spin size="small" />
                <span>Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && !loading && !showAppointmentPicker && (
            <div className="io-suggestions">
              {suggestions.map((sug, i) => (
                <Button
                  key={i}
                  className="io-suggestion-btn"
                  onClick={() => handleSend(sug)}
                >
                  {sug}
                </Button>
              ))}
            </div>
          )}

          {/* Input */}
          {!showAppointmentPicker && (
            // <div className="io-chat-input">
            //   <Input
            //     placeholder="Ask about solar, plans, or savings..."
            //     value={input}
            //     onChange={(e) => setInput(e.target.value)}
            //     onPressEnter={() => handleSend()}
            //     disabled={loading}
            //     className="io-form-input"
            //   />
            //   <Button
            //     icon={<SendOutlined />}
            //     className="io-send-btn"
            //     onClick={() => handleSend()}
            //     disabled={loading}
            //   />
            // </div>
            <div className="io-chat-input">
              <Input.TextArea
                placeholder="Ask about solar, plans, or savings..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={loading}
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="io-chat-textarea"
              />
              <Button
                icon={<SendOutlined />}
                className="io-send-btn"
                onClick={() => handleSend()}
                disabled={loading}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
