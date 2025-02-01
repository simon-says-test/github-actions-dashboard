import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import RepositorySelect from './components/RepositorySelect/RepositorySelect';
import WorkflowRuns from './components/WorkflowRuns/WorkflowRuns';
import SecurityVulnerabilities from './components/SecurityVulnerabilities/SecurityVulnerabilities';
import { apiService } from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('workflows');
  const [config, setConfig] = useState(null);
  const [selectedRepo, setSelectedRepo] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await apiService.fetchConfig();
        setConfig(data);

        // Set initial repository
        if (data.repos.length > 0) {
          setSelectedRepo(data.repos[0]);
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();
  }, []);

  if (!config || !selectedRepo) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>GitHub Repository Dashboard</h1>
        <img src="Octocat.png" className={styles.logoSmall} alt="logo" />
      </header>
      <main>
        <div className={styles.controlsContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${activeTab === 'workflows' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('workflows')}
            >
              Workflows
            </button>
            <button
              className={`${styles.tabButton} ${activeTab === 'security' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>
          <RepositorySelect repos={config.repos} selectedRepo={selectedRepo} onRepoChange={setSelectedRepo} />
        </div>
        {activeTab === 'workflows' && <WorkflowRuns selectedRepo={selectedRepo} />}
        {activeTab === 'security' && <SecurityVulnerabilities selectedRepo={selectedRepo} />}
      </main>
    </div>
  );
};

export default App;
