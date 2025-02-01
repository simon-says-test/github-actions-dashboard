import React from 'react';
import styles from './RepositorySelect.module.css';

const RepositorySelect = ({ repos, selectedRepo, onRepoChange }) => {
  const sortedRepos = [...repos].sort((a, b) => {
    const orgCompare = a.owner.localeCompare(b.owner);
    return orgCompare !== 0 ? orgCompare : a.name.localeCompare(b.name);
  });

  return (
    <div className={styles.container}>
      <label className={styles.label} htmlFor="repo-select">
        Repository:
      </label>
      <select
        className={styles.select}
        id="repo-select"
        value={`${selectedRepo.owner}/${selectedRepo.name}`}
        onChange={e => {
          const [owner, name] = e.target.value.split('/');
          onRepoChange(sortedRepos.find(r => r.owner === owner && r.name === name));
        }}
      >
        {sortedRepos.map(repo => (
          <option key={`${repo.owner}/${repo.name}`} value={`${repo.owner}/${repo.name}`}>
            {repo.owner}/{repo.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RepositorySelect;
