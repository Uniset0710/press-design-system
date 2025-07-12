import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TreeView, { PressNode, Part } from './TreeView';

describe('TreeView', () => {
  const data: PressNode[] = [
    {
      id: 'press1',
      name: 'Press 1',
      assemblies: [
        {
          id: 'asm1',
          name: 'Assembly 1',
          parts: [
            { id: 'part1', name: 'Part 1' },
            { id: 'part2', name: 'Part 2' },
          ],
        },
      ],
    },
  ];
  const openNodes = { press1: true };
  const openAssemblies = { asm1: true };
  const onToggleNode = jest.fn();
  const onToggleAssembly = jest.fn();
  const onSelectPart = jest.fn();

  it('renders root, assembly, and parts', () => {
    render(
      <TreeView
        data={data}
        selectedPartId={''}
        onSelectPart={onSelectPart}
        openNodes={openNodes}
        onToggleNode={onToggleNode}
        openAssemblies={openAssemblies}
        onToggleAssembly={onToggleAssembly}
      />
    );
    expect(screen.getByText('Press 1')).toBeInTheDocument();
    expect(screen.getByText('Assembly 1')).toBeInTheDocument();
    expect(screen.getByText('Part 1')).toBeInTheDocument();
    expect(screen.getByText('Part 2')).toBeInTheDocument();
  });

  it('calls onToggleNode when root is clicked', () => {
    render(
      <TreeView
        data={data}
        selectedPartId={''}
        onSelectPart={onSelectPart}
        openNodes={{ press1: false }}
        onToggleNode={onToggleNode}
        openAssemblies={openAssemblies}
        onToggleAssembly={onToggleAssembly}
      />
    );
    fireEvent.click(screen.getByText('Press 1'));
    expect(onToggleNode).toHaveBeenCalledWith('press1');
  });

  it('calls onToggleAssembly when assembly is clicked', () => {
    render(
      <TreeView
        data={data}
        selectedPartId={''}
        onSelectPart={onSelectPart}
        openNodes={openNodes}
        onToggleNode={onToggleNode}
        openAssemblies={{ asm1: false }}
        onToggleAssembly={onToggleAssembly}
      />
    );
    fireEvent.click(screen.getByText('Assembly 1'));
    expect(onToggleAssembly).toHaveBeenCalledWith('asm1');
  });

  it('calls onSelectPart when part is clicked', () => {
    render(
      <TreeView
        data={data}
        selectedPartId={''}
        onSelectPart={onSelectPart}
        openNodes={openNodes}
        onToggleNode={onToggleNode}
        openAssemblies={openAssemblies}
        onToggleAssembly={onToggleAssembly}
      />
    );
    fireEvent.click(screen.getByText('Part 1'));
    expect(onSelectPart).toHaveBeenCalledWith({ id: 'part1', name: 'Part 1' });
  });
}); 