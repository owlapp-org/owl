import Main from "@components/Main/Main";
import NavLeftSidebar from "@components/Nav/NavLeftSidebar";
import TopNavBar from "@components/Nav/TopNavBar";
import { useRef } from "react";
import {
  ImperativePanelHandle,
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import { Outlet } from "react-router-dom";

export default function App() {
  const ref = useRef<ImperativePanelHandle>(null);

  function onNavLeftMenuClick() {
    const panel = ref.current;
    if (panel && !panel?.isCollapsed()) {
      panel.collapse();
    } else if (panel && panel?.isCollapsed()) {
      panel.expand();
    }
  }

  return (
    <>
      <PanelGroup direction="horizontal" id="group">
        <Panel id="left-panel" maxSize={20} collapsible ref={ref}>
          <NavLeftSidebar />
        </Panel>
        <PanelResizeHandle
          id="resize-handle"
          className="side-panel-resize-handle"
        />
        <Panel id="right-panel">
          <TopNavBar onMenuClick={onNavLeftMenuClick} />
          <Main
            style={{ padding: "0 1px 0", overflow: "hidden", height: "100%" }}
          >
            <Outlet />
          </Main>
        </Panel>
      </PanelGroup>
    </>
  );
}
