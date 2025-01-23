import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import SecurityVulnerabilities from './SecurityVulnerabilities';

const mockVulnerabilities = [
  {
    repository: 'repo1',
    vulnerabilities: [
      {
        number: 1,
        dependency: { package: { name: 'package1' } },
        security_advisory: { description: 'Description1' },
        security_vulnerability: { severity: 'high' },
        created_at: '2023-01-01T00:00:00Z',
        fixed_at: '2023-01-02T00:00:00Z',
        html_url: 'url1',
      },
      {
        number: 2,
        dependency: { package: { name: 'package2' } },
        security_advisory: { description: 'Description2' },
        security_vulnerability: { severity: 'medium' },
        created_at: '2023-01-03T00:00:00Z',
        fixed_at: null,
        html_url: 'url2',
      },
    ],
  },
  {
    repository: 'repo2',
    vulnerabilities: [
      {
        number: 3,
        dependency: { package: { name: 'package3' } },
        security_advisory: { description: 'Description3' },
        security_vulnerability: { severity: 'low' },
        created_at: '2023-01-04T00:00:00Z',
        fixed_at: null,
        html_url: 'url3',
      },
    ],
  },
];

describe('SecurityVulnerabilities component', () => {
  it('renders SecurityVulnerabilities component', () => {
    render(<SecurityVulnerabilities vulnerabilities={mockVulnerabilities} />);
    expect(screen.getByText(/Security Vulnerabilities/i)).toBeInTheDocument();
    expect(screen.getAllByText(/repo1/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/repo2/i)).toBeInTheDocument();
  });

  it('filters vulnerabilities based on selected repository', () => {
    render(<SecurityVulnerabilities vulnerabilities={mockVulnerabilities} />);
    fireEvent.change(screen.getByLabelText(/Filter by repository:/i), { target: { value: 'repo1' } });
    expect(screen.getAllByText(/repo1/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/repo2/i)).not.toBeInTheDocument();
  });

  it('filters vulnerabilities based on selected severity', () => {
    render(<SecurityVulnerabilities vulnerabilities={mockVulnerabilities} />);
    fireEvent.change(screen.getByLabelText(/Filter by severity:/i), { target: { value: 'high' } });
    expect(screen.getByText(/repo1/i)).toBeInTheDocument();
    expect(screen.queryByText(/package2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/package3/i)).not.toBeInTheDocument();
  });

  it('filters vulnerabilities based on selected status', () => {
    render(<SecurityVulnerabilities vulnerabilities={mockVulnerabilities} />);
    fireEvent.change(screen.getByLabelText(/Filter by status:/i), { target: { value: 'fixed' } });
    expect(screen.getByText(/repo1/i)).toBeInTheDocument();
    expect(screen.queryByText(/package3/i)).not.toBeInTheDocument();
  });

  it('calls handleToggleExpand when a vulnerability is expanded or collapsed', () => {
    render(<SecurityVulnerabilities vulnerabilities={mockVulnerabilities} />);
    fireEvent.click(screen.getAllByText(/▼/i)[0]);
    expect(screen.getByText(/Description1/i)).toBeInTheDocument();
    fireEvent.click(screen.getAllByText(/▲/i)[0]);
    expect(screen.queryByText(/Description1/i)).not.toBeInTheDocument();
  });
});
