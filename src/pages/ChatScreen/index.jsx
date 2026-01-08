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

const LOGO_URL =
  "https://na1.hubspot-logos.com/80ea9a8f-ce90-4028-aceb-97b72755cd5b";

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

  // Appointment form
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
    const match = text.match(/\{.*type.*data.*\}/s);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
    return null;
  };

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

    if (!comparisonId) {
      try {
        const compResponse = await axios.post(`${SERVER_URL}/comparisons`);
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

  const handleUploadBill = async (file) => {
    if (!sessionId) {
      message.error("Session not initialized. Please wait a moment.");
      return false;
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
        { text: response.data.message, sender: "bot" },
      ]);
      message.success(`${file.name} uploaded successfully!`);
    } catch (error) {
      message.error("Failed to upload bill. Please try again.");
    } finally {
      setLoading(false);
    }

    return false;
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
        { pricing_version: "latest" }
      );

      setComparisonResults(response.data);
    } catch (error) {
      message.error("Failed to calculate comparison.");
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
              comparisonResults.aggregate.our_cost.amount,
            ],
            backgroundColor: ["#FF6384", "#36A2EB"],
          },
        ],
      },
      options: { scales: { y: { beginAtZero: true } } },
    };

    return (
      <div className="io-comparison-results">
        <h4>
          Potential Savings: {comparisonResults.aggregate.savings?.amount || 0}{" "}
          AUD ({comparisonResults.aggregate.savings_percentage || 0}%)
        </h4>
        <Chart
          type="bar"
          data={chartConfig.data}
          options={chartConfig.options}
        />
        <table>
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
                <td>{p.current_cost?.amount || "N/A"}</td>
                <td>{p.our_cost.amount}</td>
                <td>{p.savings?.amount || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="io-chat-widget">
      {!isOpen && (
        <div className="io-chat-button-container" onClick={handleOpenChat}>
          <button className="io-chat-button">
            <img src={LOGO_URL} alt="iO" className="io-chat-icon-logo" />
            <span className="io-chat-text">How can I help?</span>
          </button>
        </div>
      )}

      {isOpen && (
        <div className="io-chat-popup">
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

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            className="io-custom-tabs"
          >
            <Tabs.TabPane tab="Chat" key="chat" />
            <Tabs.TabPane tab="Manual Comparison" key="manual-comparison" />
          </Tabs>

          <div className="io-chat-messages">
            {activeTab === "chat" && (
              <>
                {messages.map((msg, i) => {
                  const chartConfig = extractChartConfig(msg.text);
                  return (
                    <div key={i} className={`io-message-wrapper ${msg.sender}`}>
                      {msg.sender === "bot" && (
                        <div className="io-bot-avatar">
                          <img
                            src={LOGO_URL}
                            alt="iO"
                            className="io-bot-logo"
                          />
                        </div>
                      )}
                      <div
                        className={`io-message ${
                          msg.sender === "user" ? "user" : "bot"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: parseMessage(msg.text),
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

                {loading && (
                  <div className="io-loading">
                    <Spin size="small" />
                    <span>Thinking...</span>
                  </div>
                )}
              </>
            )}

            {activeTab === "manual-comparison" && (
              <div className="io-manual-form-container">
                <Form
                  form={manualForm}
                  onFinish={handleManualInput}
                  layout="vertical"
                >
                  <Form.Item
                    name="start_date"
                    label="Start Date"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      className="io-manual-input"
                      popupClassName="io-custom-date-picker"
                    />
                  </Form.Item>
                  <Form.Item
                    name="end_date"
                    label="End Date"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      className="io-manual-input"
                      popupClassName="io-custom-date-picker"
                    />
                  </Form.Item>
                  <Form.Item name="tax_inclusive" valuePropName="checked">
                    <Checkbox className="io-manual-checkbox">
                      Tax Inclusive
                    </Checkbox>
                  </Form.Item>
                  <Form.Item name="usage_total_kwh" label="Total Usage (kWh)">
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item name="usage_peak_kwh" label="Peak Usage (kWh)">
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="usage_offpeak_kwh"
                    label="Off-Peak Usage (kWh)"
                  >
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="usage_shoulder_kwh"
                    label="Shoulder Usage (kWh)"
                  >
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item name="solar_export_kwh" label="Solar Export (kWh)">
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="controlled_load_kwh"
                    label="Controlled Load (kWh)"
                  >
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="current_supply_daily"
                    label="Daily Supply Charge ($)"
                  >
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="current_unit_rate_flat"
                    label="Flat Rate (c/kWh)"
                  >
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item name="current_peak_rate" label="Peak Rate (c/kWh)">
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="current_offpeak_rate"
                    label="Off-Peak Rate (c/kWh)"
                  >
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="current_shoulder_rate"
                    label="Shoulder Rate (c/kWh)"
                  >
                    <InputNumber
                      className="io-manual-input"
                      min={0}
                      step={0.01}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                  >
                    Calculate Savings
                  </Button>
                </Form>

                {comparisonResults && renderComparisonResults()}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {activeTab === "chat" && !showAppointmentPicker && (
            <div className="io-chat-input">
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleUploadBill(e.target.files[0]);
                    e.target.value = "";
                  }
                }}
              />
              <Button
                icon={<PaperClipOutlined />}
                className="io-attach-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                title="Upload bill"
              />
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
                disabled={loading || !input.trim()}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
