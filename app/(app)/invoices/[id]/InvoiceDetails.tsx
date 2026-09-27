"use client";

import { ArrowLeftOutlined, DownloadOutlined, EyeOutlined, FileTextOutlined } from "@ant-design/icons";
import { Button, Card, Descriptions, Image, Space, Tag } from "antd";
import Link from "next/link";
import type { InvoiceRow } from "@/lib/format";

export default function InvoiceDetails({ invoice }: { invoice: InvoiceRow }) {
  const fileUrl = `/api/invoices/${invoice.id}/file`;

  return (
    <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
      <Link href="/invoices">
        <ArrowLeftOutlined /> Back to invoices
      </Link>

      <Card
        title={
          <Space>
            <FileTextOutlined />
            Invoice {invoice.invoiceNumber}
          </Space>
        }
        extra={
          <Space wrap>
            <Button icon={<EyeOutlined />} href={fileUrl} target="_blank" rel="noopener noreferrer">
              View / Preview
            </Button>
            <Button type="primary" icon={<DownloadOutlined />} href={`${fileUrl}?download=1`}>
              Download
            </Button>
          </Space>
        }
      >
        <Descriptions
          bordered
          column={1}
          items={[
            { key: "number", label: "Invoice Number", children: invoice.invoiceNumber },
            { key: "end", label: "End Date", children: invoice.endDate },
            {
              key: "desc",
              label: "Description",
              children: <span style={{ whiteSpace: "pre-wrap" }}>{invoice.description || "—"}</span>,
            },
            {
              key: "tags",
              label: "Tags",
              children: invoice.tags.length ? invoice.tags.map((t) => <Tag key={t}>{t}</Tag>) : "—",
            },
            { key: "file", label: "File", children: invoice.fileName },
            { key: "created", label: "Created Date", children: invoice.createdAt },
          ]}
        />
      </Card>

      <Card title="Preview">
        {invoice.mimeType === "application/pdf" ? (
          <iframe src={fileUrl} title={`Invoice ${invoice.invoiceNumber}`} style={{ width: "100%", height: "70vh", border: 0 }} />
        ) : (
          <div style={{ textAlign: "center" }}>
            <Image src={fileUrl} alt={`Invoice ${invoice.invoiceNumber}`} style={{ maxWidth: "100%" }} />
          </div>
        )}
      </Card>
    </Space>
  );
}
