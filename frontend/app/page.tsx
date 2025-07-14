'use client';
import React from 'react';
import PageContainer from './components/PageContainer';
import { ChecklistProvider } from '../context/ChecklistContext';

export default function Home() {
  return (
    <ChecklistProvider>
      <PageContainer />
    </ChecklistProvider>
  );
}
