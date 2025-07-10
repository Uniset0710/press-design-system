import React from 'react';
import { Paper, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { ChecklistItem } from '../types';

interface ChecklistProps {
  items: ChecklistItem[];
  selectedOption: ChecklistItem['optionType'];
}

const Checklist: React.FC<ChecklistProps> = ({ items, selectedOption }) => {
  const filteredItems = items.filter(item => item.optionType === selectedOption);

  return (
    <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        체크리스트 - {selectedOption}
      </Typography>
      <List>
        {filteredItems.map((item) => (
          <ListItem key={item.id} divider>
            <ListItemText
              primary={item.description}
              secondary={
                item.imageUrl && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={item.imageUrl}
                      alt="체크리스트 이미지"
                      style={{ maxWidth: '100%', maxHeight: 200 }}
                    />
                  </Box>
                )
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Checklist; 