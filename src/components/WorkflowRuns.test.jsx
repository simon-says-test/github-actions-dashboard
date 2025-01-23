import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // Import jest-dom matchers
import { describe, it, expect, vi } from 'vitest'; // Import Vitest functions
import WorkflowRuns from './WorkflowRuns';

const mockWorkflowRuns = [
  {
    repository: 'repo1',
    workflow: 'Workflow1',
    badge_url: 'badge_url1',
    latestRun: {
      testResults: [
        { name: 'Job1', summary: 'Summary1' },
        { name: 'Job2', summary: 'Summary2' },
      ],
    },
  },
  {
    repository: 'repo2',
    workflow: 'Workflow2',
    badge_url: 'badge_url2',
    latestRun: {
      testResults: [
        { name: 'Job3', summary: 'Summary3' },
      ],
    },
  },
];

describe('WorkflowRuns component', () => {
  it('renders WorkflowRuns component', () => {
    render(<WorkflowRuns workflowRuns={mockWorkflowRuns} selectedWorkflow="all" handleWorkflowChange={() => {}} />);
    expect(screen.getByLabelText(/Filter by workflow/i)).toBeInTheDocument();
    expect(screen.getAllByText(/repo1/i).length).toBe(2); 
    expect(screen.getByText(/repo2/i)).toBeInTheDocument();
  });

  it('filters workflow runs based on selected workflow', () => {
    render(<WorkflowRuns workflowRuns={mockWorkflowRuns} selectedWorkflow="Workflow1" handleWorkflowChange={() => {}} />);
    expect(screen.getAllByText(/repo1/i).length).toBe(2); 
    expect(screen.queryByText(/repo2/i)).not.toBeInTheDocument();
  });

  it('calls handleWorkflowChange when a new workflow is selected', () => {
    const handleWorkflowChange = vi.fn(); 
    render(<WorkflowRuns workflowRuns={mockWorkflowRuns} selectedWorkflow="all" handleWorkflowChange={handleWorkflowChange} />);
    fireEvent.change(screen.getByLabelText(/Filter by workflow/i), { target: { value: 'Workflow1' } });
    expect(handleWorkflowChange).toHaveBeenCalled();
  });
});
