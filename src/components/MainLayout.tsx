import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Button, Container, Grid } from '@mui/material';
import PressTree from './PressTree';
import Checklist from './Checklist';
import { ChecklistItem } from '../types';

const OPTIONS = ['DTL', 'DTE', 'DL', 'DE', '2P', '4P'] as const;
type OptionType = typeof OPTIONS[number];

interface MainLayoutProps {
  onLogout?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<OptionType>(OPTIONS[0]);

  // 임시 데이터
  const treeData = [
    {
      id: 1,
      name: '프레스',
      type: 'press' as const,
      children: [
        {
          id: 2,
          name: '메인 프레임',
          type: 'assembly' as const,
          children: [
            {
              id: 3,
              name: '베이스 플레이트',
              type: 'part' as const,
            },
          ],
        },
      ],
    },
  ];

  const checklistItems: ChecklistItem[] = [
    {
      id: 1,
      partId: 3,
      optionType: 'DTL',
      description: '베이스 플레이트 두께 검토',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            프레스 설계 시스템
          </Typography>
          <Button color="inherit" onClick={onLogout}>로그아웃</Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '25%', pr: 3 }}>
            <PressTree
              data={treeData}
              onNodeSelect={(nodeId) => setSelectedNode(nodeId)}
            />
          </Box>
          <Box sx={{ width: '75%' }}>
            <Box sx={{ mb: 2 }}>
              {OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={selectedOption === option ? 'contained' : 'outlined'}
                  onClick={() => setSelectedOption(option)}
                  sx={{ mr: 1 }}
                >
                  {option}
                </Button>
              ))}
            </Box>
            <Checklist
              items={checklistItems}
              selectedOption={selectedOption}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default MainLayout; 