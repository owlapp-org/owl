import { Group, RenderTreeNodePayload } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import React from "react";
import "./styles.css";

const TreeNode: React.FC<RenderTreeNodePayload> = (props) => {
  const { node, expanded, hasChildren, elementProps, level } = props;
  // todo offset as parameter
  const paddingLeft = `${(level - 1) * 35 + 10}px`;

  return (
    <Group
      {...elementProps}
      lh={1.8}
      py={0}
      pr={10}
      align="center"
      gap={5}
      style={{
        paddingLeft,
        flexWrap: "nowrap",
      }}
      className="tree-node"
    >
      {hasChildren && (
        <IconChevronRight
          stroke={1}
          size={24}
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)" }}
        />
      )}
      <div
        onClick={(e: any) => {
          if (e.target.dataset?.section == "label") {
            const onClick = node.nodeProps?.onClick;
            onClick && onClick(e);
          }
        }}
        style={{
          display: "flex",
          gap: 10,
          width: "100%",
          alignItems: "center",
        }}
      >
        {node.nodeProps?.icon && <div>{node.nodeProps?.icon}</div>}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <div
            className="tree-node-label"
            data-section="label"
            style={{ flexGrow: 1 }}
          >
            {node.label}
          </div>
          {node.nodeProps?.actions && node.nodeProps?.actions}
        </div>
      </div>
    </Group>
  );
};

export default TreeNode;
