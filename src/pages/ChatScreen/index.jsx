// import { useState, useRef, useEffect } from "react";
// import { Button, Input, Spin, DatePicker, TimePicker } from "antd";
// import { SendOutlined, CloseOutlined } from "@ant-design/icons";
// import { SERVER_URL } from "../../config";
// import axios from "axios";
// import { marked } from "marked";
// import DOMPurify from "dompurify";
// import "./ChatWidget.css";

// // Centralized iO Logo URL
// const LOGO_URL =
//   "https://na1.hubspot-logos.com/80ea9a8f-ce90-4028-aceb-97b72755cd5b";

// export default function ChatWidget() {
//   const widgetId = "io-energy";
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
//   const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [isMobile, setIsMobile] = useState(false);

//   // Form fields
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [postcode, setPostcode] = useState("");
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);

//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     const checkMobile = () => setIsMobile(window.innerWidth <= 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [messages, loading, showAppointmentPicker]);

//   // Configure marked for safe Markdown rendering
//   marked.setOptions({
//     gfm: true,
//     breaks: true,
//     headerIds: false,
//     mangle: false,
//   });

//   // Parse Markdown → HTML → Sanitize for XSS safety
//   const parseMessage = (text) => {
//     if (!text) return "";
//     const html = marked.parse(text);
//     return DOMPurify.sanitize(html, {
//       USE_PROFILES: { html: true },
//     });
//   };

//   const handleOpenChat = async () => {
//     setIsOpen(true);
//     if (!sessionId) {
//       try {
//         const response = await axios.post(`${SERVER_URL}/query`, { query: "" });
//         setSessionId(response.data.session_id);
//         setMessages([{ text: response.data.message, sender: "bot" }]);
//         setSuggestions(response.data.suggestions || []);
//       } catch (error) {
//         setMessages([
//           {
//             text: "Hello! How can I help you save on energy today?",
//             sender: "bot",
//           },
//         ]);
//       }
//     }
//   };

//   const handleSend = async (overrideInput = null) => {
//     const messageToSend = overrideInput || input.trim();
//     if (!messageToSend) return;

//     const userMessage = { text: messageToSend, sender: "user" };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);
//     setSuggestions([]);

//     try {
//       const response = await axios.post(`${SERVER_URL}/query`, {
//         query: messageToSend,
//         session_id: sessionId,
//       });

//       const botMessage = {
//         text: response.data.message,
//         sender: "bot",
//         showButtons: response.data.message.includes("preferred day"),
//       };

//       setMessages((prev) => [...prev, botMessage]);
//       setShowAppointmentPicker(botMessage.showButtons);
//       setSuggestions(response.data.suggestions || []);
//     } catch (error) {
//       const errorText =
//         "Sorry, I'm having trouble connecting. Please try again.";
//       setMessages((prev) => [...prev, { text: errorText, sender: "bot" }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookAppointment = async () => {
//     if (!fullName || !email || !phone || !postcode || !selectedDate) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           text: "Please fill in all fields and select a date/time.",
//           sender: "bot",
//         },
//       ]);
//       return;
//     }

//     setLoading(true);
//     const preferredDay = selectedDate.format("YYYY-MM-DD");
//     const preferredTime =
//       isMobile && selectedTime
//         ? selectedTime.format("HH:mm")
//         : selectedDate.format("HH:mm");

//     try {
//       const response = await axios.post(`${SERVER_URL}/book_appointment`, {
//         session_id: sessionId,
//         preferred_day: preferredDay,
//         preferred_time: preferredTime,
//         full_name: fullName,
//         email,
//         phone,
//         postcode,
//       });

//       setMessages((prev) => [
//         ...prev,
//         { text: response.data.message, sender: "bot" },
//       ]);
//       setShowAppointmentPicker(false);
//       resetForm();
//     } catch (error) {
//       const errMsg =
//         error.response?.data?.detail || "Failed to book. Please try again.";
//       setMessages((prev) => [...prev, { text: errMsg, sender: "bot" }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFullName("");
//     setEmail("");
//     setPhone("");
//     setPostcode("");
//     setSelectedDate(null);
//     setSelectedTime(null);
//   };

//   const handleConfirm = () => {
//     if (isMobile && !selectedTime) {
//       setMessages((prev) => [
//         ...prev,
//         { text: "Please select a time.", sender: "bot" },
//       ]);
//       return;
//     }
//     handleBookAppointment();
//   };

//   return (
//     <div className="io-chat-widget">
//       {/* Floating Button */}
//       {!isOpen && (
//         <div className="io-chat-button-container" onClick={handleOpenChat}>
//           <button className="io-chat-button">
//             <img src={LOGO_URL} alt="iO" className="io-chat-icon-logo" />
//             <span className="io-chat-text">How can I help?</span>
//           </button>
//         </div>
//       )}

//       {/* Chat Popup */}
//       {isOpen && (
//         <div className="io-chat-popup">
//           {/* Header */}
//           <div className="io-chat-header">
//             <div className="io-header-left">
//               <img src={LOGO_URL} alt="iO Energy" className="io-logo" />
//               <span>iO Energy Assistant</span>
//             </div>
//             <CloseOutlined
//               className="io-close"
//               onClick={() => setIsOpen(false)}
//             />
//           </div>

//           {/* Messages */}
//           <div className="io-chat-messages">
//             {messages.map((msg, i) => (
//               <div key={i} className={`io-message-wrapper ${msg.sender}`}>
//                 {msg.sender === "bot" && (
//                   <div className="io-bot-avatar">
//                     <img src={LOGO_URL} alt="iO" className="io-bot-logo" />
//                   </div>
//                 )}
//                 <div
//                   className={`io-message ${
//                     msg.sender === "user" ? "user" : "bot"
//                   }`}
//                   dangerouslySetInnerHTML={{
//                     __html: parseMessage(msg.text),
//                   }}
//                 />
//               </div>
//             ))}

//             {/* Appointment Form */}
//             {showAppointmentPicker && (
//               <div className="io-message-wrapper bot">
//                 <div className="io-bot-avatar">
//                   <img src={LOGO_URL} alt="iO" className="io-bot-logo" />
//                 </div>
//                 <div className="io-appointment-form">
//                   <Input
//                     placeholder="Full Name"
//                     value={fullName}
//                     onChange={(e) => setFullName(e.target.value)}
//                     className="io-form-input"
//                   />
//                   <Input
//                     placeholder="Email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="io-form-input"
//                   />
//                   <Input
//                     placeholder="Phone"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     className="io-form-input"
//                   />
//                   <Input
//                     placeholder="Postcode"
//                     value={postcode}
//                     onChange={(e) => setPostcode(e.target.value)}
//                     className="io-form-input"
//                   />

//                   {/* Desktop: Combined Date & Time */}
//                   {!isMobile ? (
//                     <DatePicker
//                       showTime
//                       format="YYYY-MM-DD HH:mm"
//                       placeholder="Preferred Day & Time"
//                       onChange={setSelectedDate}
//                       className="io-form-input io-picker-input"
//                       popupClassName="io-custom-date-picker"
//                     />
//                   ) : (
//                     <>
//                       <DatePicker
//                         format="YYYY-MM-DD"
//                         placeholder="Select date"
//                         onChange={setSelectedDate}
//                         className="io-form-input io-picker-input"
//                         popupClassName="io-custom-date-picker"
//                       />
//                       <TimePicker
//                         format="HH:mm"
//                         placeholder="Select time"
//                         onChange={setSelectedTime}
//                         className="io-form-input io-picker-input"
//                         popupClassName="io-custom-date-picker"
//                       />
//                     </>
//                   )}

//                   <Button
//                     type="primary"
//                     onClick={handleConfirm}
//                     className="io-confirm-btn"
//                   >
//                     Book Call Back
//                   </Button>
//                 </div>
//               </div>
//             )}

//             {/* Loading */}
//             {loading && (
//               <div className="io-loading">
//                 <Spin size="small" />
//                 <span>Thinking...</span>
//               </div>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Suggestions */}
//           {suggestions.length > 0 && !loading && !showAppointmentPicker && (
//             <div className="io-suggestions">
//               {suggestions.map((sug, i) => (
//                 <Button
//                   key={i}
//                   className="io-suggestion-btn"
//                   onClick={() => handleSend(sug)}
//                 >
//                   {sug}
//                 </Button>
//               ))}
//             </div>
//           )}

//           {/* Input */}
//           {!showAppointmentPicker && (
//             <div className="io-chat-input">
//               <Input.TextArea
//                 placeholder="Ask about solar, plans, or savings..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onPressEnter={(e) => {
//                   if (!e.shiftKey) {
//                     e.preventDefault();
//                     handleSend();
//                   }
//                 }}
//                 disabled={loading}
//                 autoSize={{ minRows: 1, maxRows: 4 }}
//                 className="io-chat-textarea"
//               />
//               <Button
//                 icon={<SendOutlined />}
//                 className="io-send-btn"
//                 onClick={() => handleSend()}
//                 disabled={loading}
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
// import { useState, useRef, useEffect } from "react";
// import {
//   Button,
//   Input,
//   Spin,
//   DatePicker,
//   TimePicker,
//   Upload,
//   message,
//   Tabs,
//   Form,
//   InputNumber,
//   Checkbox,
// } from "antd";
// import { SendOutlined, CloseOutlined, UploadOutlined } from "@ant-design/icons";
// import { SERVER_URL } from "../../config";
// import axios from "axios";
// import { marked } from "marked";
// import DOMPurify from "dompurify";
// import { Chart } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   BarController,
// } from "chart.js";
// import "./ChatWidget.css";

// // Register Chart.js components
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   BarController
// );

// // Centralized iO Logo URL
// const LOGO_URL =
//   "https://na1.hubspot-logos.com/80ea9a8f-ce90-4028-aceb-97b72755cd5b";

// export default function ChatWidget() {
//   const widgetId = "io-energy";
//   const [isOpen, setIsOpen] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [sessionId, setSessionId] = useState(null);
//   const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
//   const [suggestions, setSuggestions] = useState([]);
//   const [isMobile, setIsMobile] = useState(false);
//   const [activeTab, setActiveTab] = useState("chat"); // Tabs: chat, upload-bill, manual-comparison
//   const [comparisonId, setComparisonId] = useState(null); // For bill comparison
//   const [comparisonResults, setComparisonResults] = useState(null); // Store results

//   // Form fields for appointment
//   const [fullName, setFullName] = useState("");
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [postcode, setPostcode] = useState("");
//   const [selectedDate, setSelectedDate] = useState(null);
//   const [selectedTime, setSelectedTime] = useState(null);

//   // Manual input form
//   const [manualForm] = Form.useForm();

//   const messagesEndRef = useRef(null);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     const checkMobile = () => setIsMobile(window.innerWidth <= 768);
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, [messages, loading, showAppointmentPicker, comparisonResults]);

//   // Configure marked for safe Markdown rendering
//   marked.setOptions({
//     gfm: true,
//     breaks: true,
//     headerIds: false,
//     mangle: false,
//   });

//   // Parse Markdown → HTML → Sanitize for XSS safety
//   const parseMessage = (text) => {
//     if (!text) return "";
//     const html = marked.parse(text);
//     return DOMPurify.sanitize(html, {
//       USE_PROFILES: { html: true },
//     });
//   };

//   // Parse potential Chart.js config from message
//   const extractChartConfig = (text) => {
//     const match = text.match(/\{.*type.*data.*\}/s); // Simple regex for JSON-like config
//     if (match) {
//       try {
//         return JSON.parse(match[0]);
//       } catch {
//         return null;
//       }
//     }
//     return null;
//   };

//   const handleOpenChat = async () => {
//     setIsOpen(true);
//     if (!sessionId) {
//       try {
//         const response = await axios.post(`${SERVER_URL}/query`, { query: "" });
//         setSessionId(response.data.session_id);
//         setMessages([{ text: response.data.message, sender: "bot" }]);
//         setSuggestions(response.data.suggestions || []);
//       } catch (error) {
//         setMessages([
//           {
//             text: "Hello! How can I help you save on energy today?",
//             sender: "bot",
//           },
//         ]);
//       }
//     }
//     // Initialize comparison if needed
//     if (!comparisonId) {
//       try {
//         const compResponse = await axios.post(`${SERVER_URL}/comparisons`);
//         setComparisonId(compResponse.data.comparison_id);
//       } catch (error) {
//         message.error("Failed to initialize comparison.");
//       }
//     }
//   };

//   const handleSend = async (overrideInput = null) => {
//     const messageToSend = overrideInput || input.trim();
//     if (!messageToSend) return;

//     const userMessage = { text: messageToSend, sender: "user" };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);
//     setSuggestions([]);

//     try {
//       const response = await axios.post(`${SERVER_URL}/query`, {
//         query: messageToSend,
//         session_id: sessionId,
//       });

//       const botMessage = {
//         text: response.data.message,
//         sender: "bot",
//         showButtons: response.data.message.includes("preferred day"),
//       };

//       setMessages((prev) => [...prev, botMessage]);
//       setShowAppointmentPicker(botMessage.showButtons);
//       setSuggestions(response.data.suggestions || []);
//     } catch (error) {
//       const errorText =
//         "Sorry, I'm having trouble connecting. Please try again.";
//       setMessages((prev) => [...prev, { text: errorText, sender: "bot" }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUploadBill = async (file) => {
//     if (!sessionId) {
//       message.error("Session not initialized.");
//       return;
//     }
//     setLoading(true);
//     const formData = new FormData();
//     formData.append("file", file);
//     try {
//       const response = await axios.post(
//         `${SERVER_URL}/upload_bill?session_id=${sessionId}&consent=true`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       setMessages((prev) => [
//         ...prev,
//         { text: response.data.message, sender: "bot" },
//       ]);
//       // Do not trigger calculation here; let the user ask in chat
//     } catch (error) {
//       message.error("Failed to upload bill.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleManualInput = async (values) => {
//     if (!comparisonId) {
//       message.error("Comparison not initialized.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const manualInput = {
//         periods: [
//           {
//             period: {
//               start_date: values.start_date.format("YYYY-MM-DD"),
//               end_date: values.end_date.format("YYYY-MM-DD"),
//               tax_inclusive: values.tax_inclusive,
//             },
//             usage_total_kwh: values.usage_total_kwh,
//             usage_peak_kwh: values.usage_peak_kwh,
//             usage_offpeak_kwh: values.usage_offpeak_kwh,
//             usage_shoulder_kwh: values.usage_shoulder_kwh,
//             solar_export_kwh: values.solar_export_kwh,
//             controlled_load_kwh: values.controlled_load_kwh,
//             current_supply_daily: values.current_supply_daily,
//             current_unit_rate_flat: values.current_unit_rate_flat,
//             current_peak_rate: values.current_peak_rate,
//             current_offpeak_rate: values.current_offpeak_rate,
//             current_shoulder_rate: values.current_shoulder_rate,
//           },
//         ],
//       };
//       await axios.post(
//         `${SERVER_URL}/comparisons/${comparisonId}/manual_inputs`,
//         manualInput
//       );
//       // Trigger calculation
//       await handleCalculateComparison();
//       manualForm.resetFields();
//     } catch (error) {
//       message.error("Failed to submit manual inputs.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCalculateComparison = async () => {
//     if (!comparisonId) return;
//     setLoading(true);
//     try {
//       const response = await axios.post(
//         `${SERVER_URL}/comparisons/${comparisonId}/calculate`,
//         {
//           pricing_version: "latest",
//         }
//       );
//       setComparisonResults(response.data);
//       // Display results in chat
//       setMessages((prev) => [
//         ...prev,
//         { text: "Comparison Results:", sender: "bot" },
//         { text: JSON.stringify(response.data, null, 2), sender: "bot" }, // Or render nicely
//       ]);
//     } catch (error) {
//       message.error("Failed to calculate comparison.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBookAppointment = async () => {
//     if (!fullName || !email || !phone || !postcode || !selectedDate) {
//       setMessages((prev) => [
//         ...prev,
//         {
//           text: "Please fill in all fields and select a date/time.",
//           sender: "bot",
//         },
//       ]);
//       return;
//     }

//     setLoading(true);
//     const preferredDay = selectedDate.format("YYYY-MM-DD");
//     const preferredTime =
//       isMobile && selectedTime
//         ? selectedTime.format("HH:mm")
//         : selectedDate.format("HH:mm");

//     try {
//       const response = await axios.post(`${SERVER_URL}/book_appointment`, {
//         session_id: sessionId,
//         preferred_day: preferredDay,
//         preferred_time: preferredTime,
//         full_name: fullName,
//         email,
//         phone,
//         postcode,
//       });

//       setMessages((prev) => [
//         ...prev,
//         { text: response.data.message, sender: "bot" },
//       ]);
//       setShowAppointmentPicker(false);
//       resetForm();
//     } catch (error) {
//       const errMsg =
//         error.response?.data?.detail || "Failed to book. Please try again.";
//       setMessages((prev) => [...prev, { text: errMsg, sender: "bot" }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFullName("");
//     setEmail("");
//     setPhone("");
//     setPostcode("");
//     setSelectedDate(null);
//     setSelectedTime(null);
//   };

//   const handleConfirm = () => {
//     if (isMobile && !selectedTime) {
//       setMessages((prev) => [
//         ...prev,
//         { text: "Please select a time.", sender: "bot" },
//       ]);
//       return;
//     }
//     handleBookAppointment();
//   };

//   const renderComparisonResults = () => {
//     if (!comparisonResults || !comparisonResults.aggregate) return null;
//     const chartConfig = {
//       type: "bar",
//       data: {
//         labels: ["Current Cost", "iO Cost"],
//         datasets: [
//           {
//             label: "Costs (AUD)",
//             data: [
//               comparisonResults.aggregate.current_cost?.amount || 0,
//               comparisonResults.aggregate.our_cost.amount,
//             ],
//             backgroundColor: ["#FF6384", "#36A2EB"],
//           },
//         ],
//       },
//       options: { scales: { y: { beginAtZero: true } } },
//     };
//     return (
//       <div className="io-comparison-results">
//         <h4>
//           Aggregate Savings: {comparisonResults.aggregate.savings?.amount} AUD (
//           {comparisonResults.aggregate.savings_percentage}%)
//         </h4>
//         <Chart
//           type="bar"
//           data={chartConfig.data}
//           options={chartConfig.options}
//         />
//         {/* Render periods table */}
//         <table>
//           <thead>
//             <tr>
//               <th>Period</th>
//               <th>Current Cost</th>
//               <th>iO Cost</th>
//               <th>Savings</th>
//             </tr>
//           </thead>
//           <tbody>
//             {(comparisonResults.periods || []).map((p, i) => (
//               <tr key={i}>
//                 <td>
//                   {p.start_date} to {p.end_date}
//                 </td>
//                 <td>{p.current_cost?.amount || "N/A"}</td>
//                 <td>{p.our_cost.amount}</td>
//                 <td>{p.savings?.amount || "N/A"}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     );
//   };

//   return (
//     <div className="io-chat-widget">
//       {/* Floating Button */}
//       {!isOpen && (
//         <div className="io-chat-button-container" onClick={handleOpenChat}>
//           <button className="io-chat-button">
//             <img src={LOGO_URL} alt="iO" className="io-chat-icon-logo" />
//             <span className="io-chat-text">How can I help?</span>
//           </button>
//         </div>
//       )}

//       {/* Chat Popup */}
//       {isOpen && (
//         <div className="io-chat-popup">
//           {/* Header */}
//           <div className="io-chat-header">
//             <div className="io-header-left">
//               <img src={LOGO_URL} alt="iO Energy" className="io-logo" />
//               <span>iO Energy Assistant</span>
//             </div>
//             <CloseOutlined
//               className="io-close"
//               onClick={() => setIsOpen(false)}
//             />
//           </div>

//           {/* Tabs for Modes */}
//           <Tabs
//             activeKey={activeTab}
//             onChange={setActiveTab}
//             centered
//             className="io-custom-tabs"
//           >
//             <Tabs.TabPane tab="Chat" key="chat" />
//             <Tabs.TabPane tab="Upload Bill" key="upload-bill" />
//             <Tabs.TabPane tab="Manual Comparison" key="manual-comparison" />
//           </Tabs>

//           {/* Content based on tab */}
//           <div className="io-chat-messages">
//             {activeTab === "chat" && (
//               <>
//                 {messages.map((msg, i) => {
//                   const chartConfig = extractChartConfig(msg.text);
//                   return (
//                     <div key={i} className={`io-message-wrapper ${msg.sender}`}>
//                       {msg.sender === "bot" && (
//                         <div className="io-bot-avatar">
//                           <img
//                             src={LOGO_URL}
//                             alt="iO"
//                             className="io-bot-logo"
//                           />
//                         </div>
//                       )}
//                       <div
//                         className={`io-message ${
//                           msg.sender === "user" ? "user" : "bot"
//                         }`}
//                         dangerouslySetInnerHTML={{
//                           __html: parseMessage(msg.text),
//                         }}
//                       />
//                       {chartConfig && (
//                         <Chart
//                           type={chartConfig.type}
//                           data={chartConfig.data}
//                           options={chartConfig.options}
//                         />
//                       )}
//                     </div>
//                   );
//                 })}

//                 {/* Appointment Form */}
//                 {showAppointmentPicker && (
//                   <div className="io-message-wrapper bot">
//                     <div className="io-bot-avatar">
//                       <img src={LOGO_URL} alt="iO" className="io-bot-logo" />
//                     </div>
//                     <div className="io-appointment-form">
//                       <Input
//                         placeholder="Full Name"
//                         value={fullName}
//                         onChange={(e) => setFullName(e.target.value)}
//                         className="io-form-input"
//                       />
//                       <Input
//                         placeholder="Email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         className="io-form-input"
//                       />
//                       <Input
//                         placeholder="Phone"
//                         value={phone}
//                         onChange={(e) => setPhone(e.target.value)}
//                         className="io-form-input"
//                       />
//                       <Input
//                         placeholder="Postcode"
//                         value={postcode}
//                         onChange={(e) => setPostcode(e.target.value)}
//                         className="io-form-input"
//                       />

//                       {/* Desktop: Combined Date & Time */}
//                       {!isMobile ? (
//                         <DatePicker
//                           showTime
//                           format="YYYY-MM-DD HH:mm"
//                           placeholder="Preferred Day & Time"
//                           onChange={setSelectedDate}
//                           className="io-form-input io-picker-input"
//                           popupClassName="io-custom-date-picker"
//                         />
//                       ) : (
//                         <>
//                           <DatePicker
//                             format="YYYY-MM-DD"
//                             placeholder="Select date"
//                             onChange={setSelectedDate}
//                             className="io-form-input io-picker-input"
//                             popupClassName="io-custom-date-picker"
//                           />
//                           <TimePicker
//                             format="HH:mm"
//                             placeholder="Select time"
//                             onChange={setSelectedTime}
//                             className="io-form-input io-picker-input"
//                             popupClassName="io-custom-date-picker"
//                           />
//                         </>
//                       )}

//                       <Button
//                         type="primary"
//                         onClick={handleConfirm}
//                         className="io-confirm-btn"
//                       >
//                         Book Call Back
//                       </Button>
//                     </div>
//                   </div>
//                 )}

//                 {loading && (
//                   <div className="io-loading">
//                     <Spin size="small" />
//                     <span>Thinking...</span>
//                   </div>
//                 )}
//               </>
//             )}

//             {activeTab === "upload-bill" && (
//               <div className="io-upload-section">
//                 <Upload
//                   accept=".pdf,.jpg,.png"
//                   beforeUpload={(file) => {
//                     handleUploadBill(file);
//                     return false; // Prevent auto-upload
//                   }}
//                   showUploadList={false}
//                 >
//                   <Button icon={<UploadOutlined />}>Upload Bill</Button>
//                 </Upload>
//                 <Checkbox>
//                   Consent to process data (temporary, per privacy policy)
//                 </Checkbox>
//                 {comparisonResults && renderComparisonResults()}
//               </div>
//             )}

//             {activeTab === "manual-comparison" && (
//               <Form
//                 form={manualForm}
//                 onFinish={handleManualInput}
//                 layout="vertical"
//               >
//                 <Form.Item
//                   name="start_date"
//                   label="Start Date"
//                   rules={[{ required: true }]}
//                 >
//                   <DatePicker />
//                 </Form.Item>
//                 <Form.Item
//                   name="end_date"
//                   label="End Date"
//                   rules={[{ required: true }]}
//                 >
//                   <DatePicker />
//                 </Form.Item>
//                 <Form.Item name="tax_inclusive" valuePropName="checked">
//                   <Checkbox>Tax Inclusive</Checkbox>
//                 </Form.Item>
//                 <Form.Item name="usage_total_kwh" label="Total Usage (kWh)">
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item name="usage_peak_kwh" label="Peak Usage (kWh)">
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item
//                   name="usage_offpeak_kwh"
//                   label="Off-Peak Usage (kWh)"
//                 >
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item
//                   name="usage_shoulder_kwh"
//                   label="Shoulder Usage (kWh)"
//                 >
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item name="solar_export_kwh" label="Solar Export (kWh)">
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item
//                   name="controlled_load_kwh"
//                   label="Controlled Load (kWh)"
//                 >
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item
//                   name="current_supply_daily"
//                   label="Current Daily Supply"
//                 >
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item name="current_unit_rate_flat" label="Flat Unit Rate">
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item name="current_peak_rate" label="Peak Rate">
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item name="current_offpeak_rate" label="Off-Peak Rate">
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Form.Item name="current_shoulder_rate" label="Shoulder Rate">
//                   <InputNumber min={0} />
//                 </Form.Item>
//                 <Button type="primary" htmlType="submit">
//                   Submit Manual Input
//                 </Button>
//                 {comparisonResults && renderComparisonResults()}
//               </Form>
//             )}
//             <div ref={messagesEndRef} />
//           </div>

//           {/* Input for Chat Tab */}
//           {activeTab === "chat" && !showAppointmentPicker && (
//             <div className="io-chat-input">
//               <Input.TextArea
//                 placeholder="Ask about solar, plans, or savings..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onPressEnter={(e) => {
//                   if (!e.shiftKey) {
//                     e.preventDefault();
//                     handleSend();
//                   }
//                 }}
//                 disabled={loading}
//                 autoSize={{ minRows: 1, maxRows: 4 }}
//                 className="io-chat-textarea"
//               />
//               <Button
//                 icon={<SendOutlined />}
//                 className="io-send-btn"
//                 onClick={() => handleSend()}
//                 disabled={loading}
//               />
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useRef, useEffect } from "react";
import {
  Button,
  Input,
  Spin,
  DatePicker,
  TimePicker,
  message,
  Tabs,
  Form,
  InputNumber,
  Checkbox,
} from "antd";
import {
  SendOutlined,
  CloseOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import { SERVER_URL } from "../../config";
import axios from "axios";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
} from "chart.js";
import "./ChatWidget.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

const LOGO_URL = "<your-logo-url-here>";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showAppointmentPicker, setShowAppointmentPicker] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  const [comparisonId, setComparisonId] = useState(null);
  const [comparisonResults, setComparisonResults] = useState(null);

  // Appointment form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [postcode, setPostcode] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  // Manual form
  const [manualForm] = Form.useForm();

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [messages, loading, showAppointmentPicker, comparisonResults]);

  marked.setOptions({
    gfm: true,
    breaks: true,
    headerIds: false,
    mangle: false,
  });

  const parseMessage = (text) => {
    if (!text) return "";
    const html = marked.parse(text);
    return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
  };

  const extractChartConfig = (text) => {
    const match = text.match(/\{.*"type".*"data".*\}/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const handleOpenChat = async () => {
    setIsOpen(true);

    if (!sessionId) {
      try {
        const response = await axios.post(`${SERVER_URL}/start_session`, {
          query: "",
        });
        setSessionId(response.data.session_id);
        setMessages([
          {
            text:
              response.data.message ||
              "Hello! How can I help you save on energy today?",
            sender: "bot",
          },
        ]);
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

    if (!comparisonId) {
      try {
        const compResponse = await axios.post(
          `${SERVER_URL}/comparisons/create`
        );
        setComparisonId(compResponse.data.comparison_id);
      } catch (error) {
        message.error("Failed to initialize comparison.");
      }
    }
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
      const response = await axios.post(`${SERVER_URL}/chat`, {
        query: messageToSend,
        session_id: sessionId,
      });

      const botMessage = {
        text: response.data.response || "",
        sender: "bot",
        showButtons: response.data.show_appointment || false,
      };

      setMessages((prev) => [...prev, botMessage]);
      setShowAppointmentPicker(botMessage.showButtons);
      setSuggestions(response.data.suggestions || []);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I'm having trouble connecting. Please try again.",
          sender: "bot",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadBill = async (e) => {
    const file = e.target.files[0];
    if (!file || !sessionId) {
      message.error("Session not ready or no file selected.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        `${SERVER_URL}/upload_bill?session_id=${sessionId}&consent=true`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setMessages((prev) => [
        ...prev,
        {
          text:
            response.data.message ||
            "Bill uploaded and processed successfully!",
          sender: "bot",
        },
      ]);
      message.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      message.error("Failed to upload bill. Please try again.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleManualInput = async (values) => {
    if (!comparisonId) {
      message.error("Comparison not initialized.");
      return;
    }

    setLoading(true);
    try {
      const manualInput = {
        periods: [
          {
            period: {
              start_date: values.start_date.format("YYYY-MM-DD"),
              end_date: values.end_date.format("YYYY-MM-DD"),
              tax_inclusive: values.tax_inclusive || false,
            },
            usage_total_kwh: values.usage_total_kwh || 0,
            usage_peak_kwh: values.usage_peak_kwh || 0,
            usage_offpeak_kwh: values.usage_offpeak_kwh || 0,
            usage_shoulder_kwh: values.usage_shoulder_kwh || 0,
            solar_export_kwh: values.solar_export_kwh || 0,
            controlled_load_kwh: values.controlled_load_kwh || 0,
            current_supply_daily: values.current_supply_daily || 0,
            current_unit_rate_flat: values.current_unit_rate_flat || 0,
            current_peak_rate: values.current_peak_rate || 0,
            current_offpeak_rate: values.current_offpeak_rate || 0,
            current_shoulder_rate: values.current_shoulder_rate || 0,
          },
        ],
      };

      await axios.post(
        `${SERVER_URL}/comparisons/${comparisonId}/manual_inputs`,
        manualInput
      );
      await handleCalculateComparison();
      manualForm.resetFields();
    } catch (error) {
      message.error("Failed to submit manual inputs.");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateComparison = async () => {
    if (!comparisonId) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${SERVER_URL}/comparisons/${comparisonId}/calculate`,
        {
          pricing_version: "latest",
        }
      );

      setComparisonResults(response.data);
      setMessages((prev) => [
        ...prev,
        {
          text: "Comparison complete! Here are your potential savings:",
          sender: "bot",
        },
      ]);
    } catch (error) {
      message.error("Failed to calculate comparison.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!fullName || !email || !phone || !postcode || !selectedDate) {
      message.error("Please fill in all required fields and select a date.");
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
        {
          text: response.data.message || "Appointment booked successfully!",
          sender: "bot",
        },
      ]);
      setShowAppointmentPicker(false);
      resetForm();
    } catch (error) {
      const errMsg =
        error.response?.data?.detail ||
        "Failed to book appointment. Please try again.";
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

  const renderComparisonResults = () => {
    if (!comparisonResults || !comparisonResults.aggregate) return null;

    const chartConfig = {
      type: "bar",
      data: {
        labels: ["Current Cost", "iO Cost"],
        datasets: [
          {
            label: "Costs (AUD)",
            data: [
              comparisonResults.aggregate.current_cost?.amount || 0,
              comparisonResults.aggregate.our_cost?.amount || 0,
            ],
            backgroundColor: ["#FF6384", "#36A2EB"],
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: { legend: { display: true } },
      },
    };

    return (
      <div className="comparison-results">
        <h3>
          Potential Savings: ${comparisonResults.aggregate.savings?.amount || 0}{" "}
          AUD ({comparisonResults.aggregate.savings_percentage || 0}%)
        </h3>
        <Chart
          type="bar"
          data={chartConfig.data}
          options={chartConfig.options}
        />

        <table style={{ width: "100%", marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Period</th>
              <th>Current Cost</th>
              <th>iO Cost</th>
              <th>Savings</th>
            </tr>
          </thead>
          <tbody>
            {(comparisonResults.periods || []).map((p, i) => (
              <tr key={i}>
                <td>
                  {p.start_date} to {p.end_date}
                </td>
                <td>${p.current_cost?.amount || "N/A"}</td>
                <td>${p.our_cost?.amount || "N/A"}</td>
                <td>${p.savings?.amount || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <Button
          className="io-chat-toggle"
          onClick={handleOpenChat}
          icon={<PaperClipOutlined />}
        >
          How can I help?
        </Button>
      )}

      {isOpen && (
        <div className="io-chat-widget">
          <div className="io-chat-header">
            <div className="io-header-title">iO Energy Assistant</div>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
            />
          </div>

          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <Tabs.TabPane tab="Chat" key="chat" />
            <Tabs.TabPane tab="Manual Comparison" key="manual-comparison" />
          </Tabs>

          <div className="io-chat-body">
            {activeTab === "chat" && (
              <>
                <div className="io-messages">
                  {messages.map((msg, i) => {
                    const chartConfig = extractChartConfig(msg.text);
                    return (
                      <div key={i} className={`io-message ${msg.sender}`}>
                        {msg.sender === "bot" && (
                          <div className="io-bot-avatar" />
                        )}
                        <div
                          className="io-message-content"
                          dangerouslySetInnerHTML={{
                            __html: parseMessage(
                              msg.text.replace(/\{.*\}/s, "")
                            ),
                          }}
                        />
                        {chartConfig && (
                          <Chart
                            type={chartConfig.type}
                            data={chartConfig.data}
                            options={chartConfig.options}
                          />
                        )}
                      </div>
                    );
                  })}

                  {showAppointmentPicker && (
                    <div className="io-appointment-form">
                      <h4>Book a Call Back</h4>
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

                      {!isMobile ? (
                        <DatePicker
                          onChange={setSelectedDate}
                          placeholder="Select preferred date and time"
                          showTime
                        />
                      ) : (
                        <>
                          <DatePicker
                            onChange={setSelectedDate}
                            placeholder="Select date"
                          />
                          <TimePicker
                            onChange={setSelectedTime}
                            placeholder="Select time"
                          />
                        </>
                      )}

                      <Button
                        type="primary"
                        onClick={handleBookAppointment}
                        loading={loading}
                      >
                        Book Call Back
                      </Button>
                    </div>
                  )}

                  {loading && (
                    <div className="io-message bot">
                      <Spin />
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </>
            )}

            {activeTab === "manual-comparison" && (
              <div className="io-manual-form">
                <Form
                  form={manualForm}
                  onFinish={handleManualInput}
                  layout="vertical"
                >
                  <Form.Item name="start_date" rules={[{ required: true }]}>
                    <DatePicker placeholder="Start Date" />
                  </Form.Item>
                  <Form.Item name="end_date" rules={[{ required: true }]}>
                    <DatePicker placeholder="End Date" />
                  </Form.Item>

                  <Form.Item name="tax_inclusive" valuePropName="checked">
                    <Checkbox>Tax Inclusive</Checkbox>
                  </Form.Item>

                  <Form.Item name="usage_total_kwh" label="Total Usage (kWh)">
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="usage_peak_kwh" label="Peak Usage (kWh)">
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="usage_offpeak_kwh"
                    label="Off-Peak Usage (kWh)"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="usage_shoulder_kwh"
                    label="Shoulder Usage (kWh)"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="solar_export_kwh" label="Solar Export (kWh)">
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="controlled_load_kwh"
                    label="Controlled Load (kWh)"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>

                  <Form.Item
                    name="current_supply_daily"
                    label="Current Daily Supply Charge"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="current_unit_rate_flat"
                    label="Current Flat Rate"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item name="current_peak_rate" label="Current Peak Rate">
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="current_offpeak_rate"
                    label="Current Off-Peak Rate"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item
                    name="current_shoulder_rate"
                    label="Current Shoulder Rate"
                  >
                    <InputNumber style={{ width: "100%" }} />
                  </Form.Item>

                  <Button type="primary" htmlType="submit" loading={loading}>
                    Calculate Savings
                  </Button>
                </Form>

                {comparisonResults && renderComparisonResults()}
              </div>
            )}
          </div>

          {activeTab === "chat" && !showAppointmentPicker && (
            <div className="io-chat-input">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleUploadBill}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <Button
                icon={<PaperClipOutlined />}
                className="io-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Upload bill"
              />
              <Input.TextArea
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
                placeholder="Type your message..."
              />
              <Button
                icon={<SendOutlined />}
                className="io-send-btn"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              />
            </div>
          )}
        </div>
      )}
    </>
  );
}
