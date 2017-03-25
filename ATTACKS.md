## Summary of Attacks

### JWT
- Tried 'None' `Passed`
- Tried forging RSA token `Passed`

### Validation on Routes
`/api/users/:id/profile`

- Doesn't validate School, `Not Fixed`
	- A user can pass in an arbitarary school.
- Doesn't respect `timeConfirm`, `Fixed`