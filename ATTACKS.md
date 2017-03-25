## Summary of Attacks

### JWT
- Tried 'None' `Passed`
- Tried forging RSA token `Passed`

### Validation on Routes
`/api/users/:id/profile`

- Doesn't validate School, `Not Fixed`
	- A user can pass in an arbitarary school.
	- Not fixed, not sure if intended behavior and lower risk.
- Doesn't respect `timeConfirm`, `Fixed`

`/users/:id/team`

- `UserController.createOrJoinTeam` executed a `find` on a user provided field
```
User.find({
    teamCode: code
  })
```

This allows for a NoSQL Injection. Not very severe since the next few lines execute a `$set`. But apart from undiscovered side-effects, allows the attacker to heavily overload servers trying to keep up with forever.
`Fixed`