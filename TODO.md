# TODO

- [ ] Production (`prodbox`) still runs the pre-rework build. Before updating it:
      double-check the party list there has correct guest limits set (migration
      defaults every party to 1), and remember the update clears all pre-entered
      guests and recorded responses (emails are preserved on the party; every
      invitation resets to pending).
- [ ] Send a fresh backup of production before applying the update (migration
      0019 is destructive and has no automatic rollback).
