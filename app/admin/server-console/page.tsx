"use client";

import React, { useRef, useState } from 'react';

const ADMIN_EMAIL = 'lucas@example.com'; // Must match API route

export default function ServerConsole() {
  const [output, setOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const textareaRef = useRef<HTMLDivElement>(null);

  const handleCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      // Append command to output
      setOutput((prev) => [...prev, `> ${command}`]);
      try {
        const res = await fetch('/api/terminal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'admin-email': ADMIN_EMAIL,
          },
          body: JSON.stringify({ command }),
        });
        const data = await res.json();
        if (data.stdout) setOutput((prev) => [...prev, data.stdout]);
        if (data.stderr) setOutput((prev) => [...prev, data.stderr]);
        if (data.error) setOutput((prev) => [...prev, `Error: ${data.error}`]);
      } catch (err) {
        setOutput((prev) => [...prev, 'Error: Failed to reach server']);
      }
      setCommand('');
      // Scroll to bottom
      setTimeout(() => {
        textareaRef.current?.scrollTo({ top: textareaRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ color: '#00ff00', fontFamily: 'monospace', marginBottom: 8 }}>Server Console</h2>
      <div
        ref={textareaRef}
        style={{
          background: '#111',
          color: '#00ff00',
          fontFamily: 'monospace',
          minHeight: 300,
          maxHeight: 400,
          overflowY: 'auto',
          padding: 16,
          borderRadius: 8,
          boxShadow: '0 0 8px #00ff00',
          marginBottom: 12,
          fontSize: 16,
        }}
      >
        {output.map((line, idx) => (
          <div key={idx} style={{ whiteSpace: 'pre-wrap' }}>{line}</div>
        ))}
      </div>
      <input
        type="text"
        value={command}
        onChange={(e) => setCommand(e.target.value)}
        onKeyDown={handleCommand}
        placeholder="Type a command and press Enter"
        style={{
          width: '100%',
          background: '#222',
          color: '#00ff00',
          fontFamily: 'monospace',
          border: '1px solid #00ff00',
          borderRadius: 4,
          padding: '8px 12px',
          fontSize: 16,
        }}
        autoFocus
      />
    </div>
  );
}
