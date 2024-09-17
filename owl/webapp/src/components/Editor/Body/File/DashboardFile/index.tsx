import "@components/Editor/styles.css";
import { IEditorTabState } from "@hooks/editorStore";
import { Tabs } from "@mantine/core";
import { IFileModel } from "@ts/interfaces/interfaces";
import { useEffect, useState } from "react";
import { StoreApi, UseBoundStore, useStore } from "zustand";
import DashboardCode from "./DashboardCode";
import DashboardRenderer from "./DashboardRenderer";

interface IDashboardFileProps<T extends IFileModel> {
  store: UseBoundStore<StoreApi<IEditorTabState<T>>>;
}

const DashboardFile = <T extends IFileModel>({
  store,
  ...other
}: IDashboardFileProps<T>) => {
  const { content } = useStore(store, (state) => ({
    content: state.content,
  }));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log("DashboardFile.index");
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: "100%",
      }}
    >
      <Tabs
        defaultValue="gallery"
        style={{
          height: "calc(100% - 32px)",
          width: "100%",
        }}
        inverted
      >
        <Tabs.Panel
          value="gallery"
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <div style={{ flex: 1, overflow: "hidden", height: "100%" }}>
            <DashboardCode store={store} />
          </div>
        </Tabs.Panel>
        <Tabs.Panel
          value="messages"
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <DashboardRenderer code={""} />
        </Tabs.Panel>

        <Tabs.List
          style={{
            justifyContent: "start",
          }}
        >
          <Tabs.Tab value="gallery">Code</Tabs.Tab>
          <Tabs.Tab value="messages">Result</Tabs.Tab>
        </Tabs.List>
      </Tabs>
    </div>
  );
};

export default DashboardFile;
