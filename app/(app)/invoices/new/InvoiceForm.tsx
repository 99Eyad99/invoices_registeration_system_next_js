"use client";

import { InboxOutlined, NumberOutlined, PlusOutlined, SaveOutlined } from "@ant-design/icons";
import { Alert, Button, Card, DatePicker, Form, Input, Select, Space, Upload } from "antd";
import type { UploadFile } from "antd";
import type { Dayjs } from "dayjs";
import Link from "next/link";
import { useState } from "react";
import { createInvoice, type CreateInvoiceResult } from "./actions";

type Values = {
  invoiceNumber: string;
  endDate?: Dayjs | null;
  description?: string;
  tags?: string[];
  file: UploadFile[];
};

const ACCEPT = ".pdf,.jpg,.jpeg,.png";
const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function InvoiceForm({ maxFileSizeMb }: { maxFileSizeMb: number }) {
  const [form] = Form.useForm<Values>();
  const [result, setResult] = useState<CreateInvoiceResult | null>(null);
  const [saving, setSaving] = useState(false);

  async function onFinish(values: Values) {
    const file = values.file[0]?.originFileObj;
    if (!file) return;

    const data = new FormData();
    data.set("invoiceNumber", values.invoiceNumber);
    data.set("endDate", values.endDate ? values.endDate.format("YYYY-MM-DD") : "");
    data.set("description", values.description ?? "");
    data.set("tags", (values.tags ?? []).join(","));
    data.set("file", file);

    setSaving(true);
    setResult(null);
    try {
      const res = await createInvoice(data);
      setResult(res);
      if (res.ok) form.resetFields();
    } catch {
      setResult({ ok: false, message: "Something went wrong. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card
      title={
        <Space>
          <PlusOutlined />
          Add Invoice
        </Space>
      }
      style={{ maxWidth: 720, margin: "0 auto" }}
    >
      {result && (
        <Alert
          type={result.ok ? "success" : "error"}
          showIcon
          closable
          onClose={() => setResult(null)}
          style={{ marginBottom: 16 }}
          title={result.message}
          description={result.ok ? <Link href={`/invoices/${result.invoiceId}`}>View invoice</Link> : undefined}
        />
      )}

      <Form<Values> form={form} layout="vertical" onFinish={onFinish} disabled={saving}>
        <Form.Item
          name="invoiceNumber"
          label="Invoice Number"
          rules={[{ required: true, whitespace: true, message: "Invoice Number is required" }]}
        >
          <Input prefix={<NumberOutlined />} placeholder="e.g. INV-1001" />
        </Form.Item>

        <Form.Item name="endDate" label="End Date">
          <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="tags" label="Tags" extra="Type a tag and press Enter or comma.">
          <Select mode="tags" tokenSeparators={[","]} open={false} suffixIcon={null} placeholder="e.g. office, utilities" />
        </Form.Item>

        <Form.Item
          name="file"
          label="Invoice File"
          valuePropName="fileList"
          getValueFromEvent={(e: { fileList: UploadFile[] }) => e.fileList.slice(-1)}
          rules={[
            { required: true, message: "Invoice File is required" },
            {
              validator: async (_, fileList: UploadFile[] = []) => {
                const file = fileList[0];
                if (!file) return;
                if (!ALLOWED_TYPES.includes(file.type ?? "")) throw new Error("Only PDF, JPG and PNG files are supported");
                if ((file.size ?? 0) > maxFileSizeMb * 1024 * 1024) throw new Error(`File must be ${maxFileSizeMb} MB or smaller`);
              },
            },
          ]}
        >
          <Upload.Dragger accept={ACCEPT} maxCount={1} beforeUpload={() => false}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag a file here</p>
            <p className="ant-upload-hint">PDF, JPG or PNG. Max {maxFileSizeMb} MB.</p>
          </Upload.Dragger>
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
          {saving ? "Uploading..." : "Save Invoice"}
        </Button>
      </Form>
    </Card>
  );
}
