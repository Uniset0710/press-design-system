import React, { useState } from 'react';
import { TreeView, TreeItem } from '@mui/lab';
import { ExpandMore, ChevronRight } from '@mui/icons-material';
import { TreeNode } from '../types';

interface PressTreeProps {
  data: TreeNode[];
  onNodeSelect: (nodeId: string) => void;
}

const PressTree: React.FC<PressTreeProps> = ({ data, onNodeSelect }) => {
  const renderTree = (node: TreeNode) => (
    <TreeItem
      key={node.id}
      nodeId={node.id.toString()}
      label={node.name}
      onClick={() => onNodeSelect(node.id.toString())}
    >
      {Array.isArray(node.children)
        ? node.children.map((child) => renderTree(child))
        : null}
    </TreeItem>
  );

  return (
    <TreeView
      defaultCollapseIcon={<ExpandMore />}
      defaultExpandIcon={<ChevronRight />}
      sx={{ height: '100%', flexGrow: 1, maxWidth: 300, overflowY: 'auto' }}
    >
      {data.map((node) => renderTree(node))}
    </TreeView>
  );
};

export default PressTree; 