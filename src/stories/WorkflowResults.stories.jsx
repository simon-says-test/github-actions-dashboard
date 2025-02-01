import React from 'react';
import WorkflowResults from '../components/WorkflowResults';

const meta = {
  title: 'Components/WorkflowResults',
  component: WorkflowResults,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

const mockRepo = {
  owner: 'testowner',
  name: 'testrepo',
};

const Template = args => <WorkflowResults {...args} />;

export const Loading = Template.bind({});
Loading.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'test-workflow',
};

export const WithData = Template.bind({});
WithData.parameters = {
  mockData: [
    {
      repository: 'testrepo',
      workflow: 'test-workflow',
      badge_url: 'https://github.com/testowner/testrepo/workflows/test-workflow/badge.svg',
      testResults: [
        {
          name: 'Unit Tests',
          summary: 'Tests: 42 passed, 0 failed',
        },
        {
          name: 'Integration Tests',
          summary: 'Tests: 12 passed, 1 failed',
        },
      ],
    },
  ],
};
WithData.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'test-workflow',
};

export const NoResults = Template.bind({});
NoResults.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'non-existent-workflow',
};
