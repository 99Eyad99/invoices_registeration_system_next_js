"use client";

import { DownloadOutlined, EyeOutlined, PlusOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Button, Card, Input, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { InvoiceRow } from "@/lib/format";

export default function InvoiceList({ invoices, query }: { invoices: InvoiceRow[]; query: string }) {
  const router = useRouter();

  function search(value: string) {
    const q = value.trim();
    router.push(q ? `/invoices?q=${encodeURIComponent(q)}` : "/invoices");
  }

  const columns: TableColumnsType<InvoiceRow> = [
    {
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      render: (value: string, row) => (
        <Link href={`/invoices/${row.id}`}>
          <strong>{value}</strong>
        </Link>
      ),
    },
    { title: "End Date", dataIndex: "endDate", width: 130 },
    { title: "Description", dataIndex: "description", ellipsis: true, render: (value: string) => value || "—" },
    {
      title: "Tags",
      dataIndex: "tags",
      render: (tags: string[]) => (tags.length ? tags.map((t) => <Tag key={t}>{t}</Tag>) : "—"),
    },
    { title: "Created Date", dataIndex: "createdAt", width: 130 },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, row) => (
        <Space>
          <Link href={`/invoices/${row.id}`}>
            <Button size="small" icon={<EyeOutlined />}>
              View
            </Button>
          </Link>
          <Button size="small" type="primary" icon={<DownloadOutlined />} href={`/api/invoices/${row.id}/file?download=1`}>
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <UnorderedListOutlined />
          Invoices
        </Space>
      }
      extra={
        <Link href="/invoices/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Add Invoice
          </Button>
        </Link>
      }
    >
      <Input.Search
        key={query}
        defaultValue={query}
        placeholder="Search by invoice number, description or tags"
        allowClear
        enterButton="Search"
        onSearch={search}
        style={{ marginBottom: 16 }}
      />
      {query && (
        <Typography.Paragraph type="secondary">
          {invoices.length} result{invoices.length === 1 ? "" : "s"} for &quot;{query}&quot;
        </Typography.Paragraph>
      )}
      <Table<InvoiceRow>
        rowKey="id"
        columns={columns}
        dataSource={invoices}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        scroll={{ x: 900 }}
        locale={{ emptyText: query ? "No invoices match your search." : "No invoices yet. Add your first invoice." }}
      />
    </Card>
  );
}
