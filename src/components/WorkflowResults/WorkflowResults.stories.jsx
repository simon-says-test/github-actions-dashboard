import React from 'react';
import WorkflowResults from './WorkflowResults';

const meta = {
  title: 'Components/WorkflowResults',
  component: WorkflowResults,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => {
      window.STORYBOOK_ENV = true;
      return <Story />;
    },
  ],
  tags: ['autodocs'],
};

export default meta;

const mockRepo = {
  owner: 'testowner',
  name: 'testrepo',
};

const Template = args => <WorkflowResults {...args} />;

const mockData = {
  simple: [
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
  multiple: [
    {
      repository: 'frontend-app',
      workflow: 'ci-pipeline',
      badge_url: 'https://github.com/testowner/frontend-app/workflows/ci-pipeline/badge.svg',
      testResults: [
        {
          name: 'Unit Tests',
          summary: 'Tests: 156 passed, 2 failed',
        },
        {
          name: 'E2E Tests',
          summary: 'Tests: 24 passed, 0 failed',
        },
      ],
    },
    {
      repository: 'backend-api',
      workflow: 'ci-pipeline',
      badge_url: 'https://github.com/testowner/backend-api/workflows/ci-pipeline/badge.svg',
      testResults: [
        {
          name: 'Unit Tests',
          summary: 'Tests: 89 passed, 0 failed',
        },
        {
          name: 'Integration Tests',
          summary: 'Tests: 45 passed, 3 failed',
        },
        {
          name: 'Security Scan',
          summary: 'Found 2 medium vulnerabilities',
        },
      ],
    },
  ],
};

export const Loading = Template.bind({});
Loading.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'test-workflow',
};

export const WithData = Template.bind({});
WithData.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'test-workflow',
  mockData: mockData.simple,
};

export const MultipleRepos = Template.bind({});
MultipleRepos.args = {
  selectedRepo: { owner: 'testowner', name: 'all' },
  selectedWorkflow: 'ci-pipeline',
  mockData: mockData.multiple,
};

export const NoResults = Template.bind({});
NoResults.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'non-existent-workflow',
};
