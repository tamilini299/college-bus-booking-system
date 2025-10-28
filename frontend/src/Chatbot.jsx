import React, { useState } from "react";

function Chatbot() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAI = async () => {
    if (!input.trim()) {
      setError("Please enter a question");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");

    try {
      // Mock responses for testing (remove this when you have OpenAI billing set up)
      const mockResponses = {
        "routes": "Our college bus system has 3 main routes:\n1. Route A: Campus → Downtown (7:00 AM, 5:00 PM)\n2. Route B: Campus → Mall Area (8:00 AM, 6:00 PM)\n3. Route C: Campus → Residential Area (7:30 AM, 5:30 PM)",
        "booking": "To book a seat:\n1. Login to your account\n2. Go to the Booking page\n3. Select your route and time\n4. Choose your seat\n5. Confirm your booking",
        "time": "Bus schedules:\n- Morning: 7:00 AM - 8:30 AM\n- Evening: 5:00 PM - 6:30 PM\n- Weekend: Limited service 9:00 AM - 4:00 PM",
        "price": "Bus fare is $2 per trip for students and $3 for non-students. Monthly passes available for $40.",
        "default": "I'm a bus assistant! I can help you with:\n- Bus routes and schedules\n- Booking procedures\n- Fare information\n- General bus service questions\n\nWhat would you like to know?"
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const question = input.toLowerCase();
      let response = mockResponses.default;

      if (question.includes("route")) {
        response = mockResponses.routes;
      } else if (question.includes("book") || question.includes("reserve")) {
        response = mockResponses.booking;
      } else if (question.includes("time") || question.includes("schedule")) {
        response = mockResponses.time;
      } else if (question.includes("price") || question.includes("cost") || question.includes("fare")) {
        response = mockResponses.price;
      }

      setResponse(response);

      // Uncomment this section when you have OpenAI billing set up:
      /*
      const apiKey = import.meta.env.VITE_OPENAI_KEY;
      const res = await fetch("https://api.openai.com/v1/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-instruct",
          prompt: `You are a helpful bus assistant for a college bus booking system. Answer this question about bus routes, schedules, or booking: ${input}`,
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`API Error: ${res.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await res.json();
      if (data.choices && data.choices[0] && data.choices[0].text) {
        setResponse(data.choices[0].text.trim());
      } else {
        throw new Error("No response from AI");
      }
      */
    } catch (err) {
      console.error("Error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "20px", 
      maxWidth: "600px", 
      margin: "0 auto",
      background: "rgba(255, 255, 255, 0.95)",
      borderRadius: "12px",
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
    }}>
      <h2 style={{ 
        color: "#374151", 
        marginBottom: "20px",
        textAlign: "center"
      }}>
        🤖 Bus Assistant
      </h2>
      
      <div style={{ marginBottom: "15px" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about routes, timings, or booking..."
          style={{
            width: "100%",
            padding: "12px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "16px",
            marginBottom: "10px"
          }}
          onKeyPress={(e) => e.key === 'Enter' && askAI()}
        />
        <button 
          onClick={askAI}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            background: loading ? "#9ca3af" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease"
          }}
        >
          {loading ? "⏳ Thinking..." : "🚀 Ask"}
        </button>
      </div>

      {error && (
        <div style={{
          padding: "12px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          color: "#dc2626",
          marginBottom: "15px"
        }}>
          ❌ {error}
        </div>
      )}

      {response && (
        <div style={{
          padding: "15px",
          background: "#f0f9ff",
          border: "1px solid #bae6fd",
          borderRadius: "8px",
          color: "#0c4a6e"
        }}>
          <strong>🤖 Assistant:</strong> {response}
        </div>
      )}

      <div style={{ 
        marginTop: "20px", 
        fontSize: "14px", 
        color: "#6b7280",
        textAlign: "center"
      }}>
        💡 Try asking: "What are the bus routes?" or "How do I book a seat?"
      </div>
    </div>
  );
}

export default Chatbot;
