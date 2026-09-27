"use client";

import { FileTextOutlined, LockOutlined, LoginOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { login } from "./actions";

type Values = { username: string; password: string };

export default function LoginForm({ appName, from }: { appName: string; from: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFinish(values: Values) {
    setLoading(true);
    setError("");
    try {
      const result = await login(values.username, values.password, from);
      // login() redirects on success, so we only get here on failure.
      if (result?.error) setError(result.error);
    } catch {
      setError("Login failed because of a server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <Card style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <FileTextOutlined style={{ fontSize: 40, color: "#006199" }} />
          <Typography.Title level={3} style={{ margin: "8px 0 0" }}>
            {appName}
          </Typography.Title>
          <Typography.Text type="secondary">Sign in to continue</Typography.Text>
        </div>

        {error && <Alert type="error" title={error} showIcon style={{ marginBottom: 16 }} />}

        <Form<Values> layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item name="username" label="Username" rules={[{ required: true, message: "Please enter your username" }]}>
            <Input prefix={<UserOutlined />} autoComplete="username" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true, message: "Please enter your password" }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" htmlType="submit" icon={<LoginOutlined />} loading={loading} block>
            Log in
          </Button>
        </Form>
      </Card>
    </div>
  );
}
