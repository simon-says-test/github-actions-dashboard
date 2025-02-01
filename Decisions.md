## Workflow tab
### Repository filter:
- populated from the config returned from the API
- sorted by organisation and then repository name
- default value is the first owner/repository in the list

### Workflow filter:
- populated from the workflows of the selected repository
- only workflows with test summaries are included in the list
- default value is the first workflow in the list
- if the repository has no appropriate workflows, display "none found"
- updates when selected repository changes

### Workflow records:
- populated from the workflows of the selected repository that have test summaries
- only workflows that match the workflow filter are included in the list
- if there are no matching workflow records then display "none found"
- updates when selected repository changes
- updates when selected workflow changes
 
## Security Vulnerability tab
### Repository filter:
- populated from the config returned from the API
- sorted by organisation and then repository name
- default value is the first owner/repository in the list

### Severity filter:
- populated with the following list:
    - "Critical"
    - "High"
    - "Medium"
    - "Low"
    - "All"
- default value is "All"
- doesn't update once set

### Status filter:
- populated with the following list:
    - "Triage"
    - "Draft"
    - "Published"
    - "Closed"
    - "Open"
    - "All"
- default value is "Open" 
- doesn't update once set

### Vulnerability records:
- populated from the vulnerabilities of the selected repository
- only vulnerabilities that match the severity and status filter are included in the list
- the severity filter must be applied in the API on the records returned from GitHub
- The status filter can be used when querying GitHub using the state field
- a severity filter value of "All" means no filter is applied for this value 
- a status filter value of "Open" excludes records for closed vulnerabilities in the results
- a status filter value of "All" means no filter is applied for this value 
- if there are no matching vulnerability records then display "none found"
- updates when selected repository changes
- updates when selected severity changes
- updates when selected status changes