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
- populated from the severity of vulnerabilities in the selected repository
- default value is "All" which doesn't filter the list
- if the repository has no vulnerabilities, display "none found"
- updates when selected repository changes

### Status filter:
- populated from the status of vulnerabilities in the selected repository
- Additional "All" value which doesn't filter the list
- default value is "Open" which only includes records for unfixed vulnerabilities
- if the repository has no vulnerabilities, display "none found"
- updates when selected repository changes

### Vulnerability records:
- populated from the vulnerabilities of the selected repository
- only vulnerabilities that match the severity and status filter are included in the list
- if there are no matching vulnerability records then display "none found"
- updates when selected repository changes
- updates when selected severity changes
- updates when selected status changes