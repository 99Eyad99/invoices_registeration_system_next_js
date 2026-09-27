"use client";

import { FileTextOutlined, LogoutOutlined, PlusOutlined, UnorderedListOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, Space, Typography } from "antd";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "../login/actions";

type Props = { appName: string; username: string; children: React.ReactNode };

export default function AppShell({ appName, username, children }: Props) {
  const pathname = usePathname();
  const selected = pathname === "/invoices/new" ? "new" : "list";

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Layout.Header
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #EEEEEE",
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 16px",
        }}
      >
        <Link href="/invoices" style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
          <FileTextOutlined style={{ fontSize: 20 }} />
          <Typography.Text strong style={{ fontSize: 16, color: "#006199" }} className="brand-name">
            {appName}
          </Typography.Text>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[selected]}
          style={{ flex: 1, minWidth: 0, borderBottom: "none" }}
          items={[
            { key: "list", icon: <UnorderedListOutlined />, label: <Link href="/invoices">Invoices</Link> },
            { key: "new", icon: <PlusOutlined />, label: <Link href="/invoices/new">Add Invoice</Link> },
          ]}
        />
        <Space>
          <Typography.Text className="user-name">
            <UserOutlined /> {username}
          </Typography.Text>
          <form action={logout}>
            <Button htmlType="submit" icon={<LogoutOutlined />}>
              Logout
            </Button>
          </form>
        </Space>
      </Layout.Header>
      <Layout.Content style={{ padding: 16, maxWidth: 1200, width: "100%", margin: "0 auto" }}>{children}</Layout.Content>
    </Layout>
  );
}
