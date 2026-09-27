"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider } from "antd";

const theme = {
  token: {
    colorPrimary: "#006199",
    colorLink: "#006199",
    colorText: "#000000",
    colorBgLayout: "#EEEEEE",
    colorBgContainer: "#FFFFFF",
    colorBorderSecondary: "#EEEEEE",
    borderRadius: 6,
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AntdRegistry>
      <ConfigProvider theme={theme}>
        <App>{children}</App>
      </ConfigProvider>
    </AntdRegistry>
  );
}
