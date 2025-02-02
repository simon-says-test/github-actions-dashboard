import React from 'react';
import WorkflowResults from './WorkflowResults';
import { apiService } from '../../services/api';

const mockRepo = {
  owner: 'test-owner',
  name: 'test-repo',
};

const mockWorkflowData = {
  simple: [
    {
      repository: 'test-repo',
      workflow: 'test-workflow',
      name: 'Unit Tests',
      conclusion: 'success',
      summary: '4 tests   1 ✅  1m 20s ⏱️\n3 suites  0 💤\n3 files    0 ❌',
    },
    {
      repository: 'test-repo',
      workflow: 'test-workflow',
      name: 'Integration Tests',
      conclusion: 'failure',
      summary: '10 tests   1 ✅  3m 20s ⏱️\n6 suites  0 💤\n6 files    3 ❌',
    },
  ],
  multiple: [
    {
      repository: 'frontend-app',
      workflow: 'ci-pipeline',
      name: 'Unit Tests',
      conclusion: 'success',
      summary: 'Tests: 156 passed, 2 failed',
    },
    {
      repository: 'backend-api',
      workflow: 'ci-pipeline',
      name: 'Unit Tests',
      conclusion: 'success',
      summary: 'Tests: 89 passed, 0 failed',
    },
    {
      repository: 'backend-api',
      workflow: 'ci-pipeline',
      name: 'Integration Tests',
      conclusion: 'failure',
      summary: 'Tests: 45 passed, 3 failed',
    },
    {
      repository: 'backend-api',
      workflow: 'ci-pipeline',
      name: 'Security Scan',
      conclusion: 'failure',
      summary: 'Found 2 medium vulnerabilities',
    },
  ],
  error: [
    {
      repository: 'test-repo',
      workflow: 'no-workflow',
      name: 'N/A',
      conclusion: 'error',
      summary: 'Error fetching workflow runs: Not Found',
    },
  ],
};

const meta = {
  title: 'Components/WorkflowResults',
  component: WorkflowResults,
  decorators: [
    Story => {
      const originalFetchWorkflowRuns = apiService.fetchWorkflowRuns;

      apiService.fetchWorkflowRuns = async (owner, repo, workflow) => {
        if (workflow === 'loading-workflow') return new Promise(() => {});
        if (workflow === 'non-existent-workflow') return [];
        if (workflow === 'fetch-error-workflow') return mockWorkflowData.error;
        return repo === 'all' ? mockWorkflowData.multiple : mockWorkflowData.simple;
      };

      return (
        <React.Fragment>
          <Story />
          {React.useEffect(
            () => () => {
              apiService.fetchWorkflowRuns = originalFetchWorkflowRuns;
            },
            []
          )}
        </React.Fragment>
      );
    },
  ],
  args: {
    selectedRepo: mockRepo,
    selectedWorkflow: 'test-workflow',
  },
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

const Template = args => <WorkflowResults {...args} />;

export const WithData = Template.bind({});
WithData.args = meta.args;

export const FetchError = Template.bind({});
FetchError.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'fetch-error-workflow',
};

export const Loading = Template.bind({});
Loading.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'loading-workflow',
};

export const MultipleRepos = Template.bind({});
MultipleRepos.args = {
  selectedRepo: { owner: 'test-owner', name: 'all' },
  selectedWorkflow: 'ci-pipeline',
};

export const NoResults = Template.bind({});
NoResults.args = {
  selectedRepo: mockRepo,
  selectedWorkflow: 'non-existent-workflow',
};
