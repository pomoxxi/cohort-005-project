# A decision can be reopened until the Refund is Issued

A Platform Admin can Reopen an Approved or Declined Refund Request, with a required note, which sends it back to Open. Reopening undoes everything the decision did: a Revoked Enrollment is restored, a Team Licence's Unclaimed Seats go back to being frozen, and the request stops counting toward the one-Refund rule. The buyer is emailed that their request is being reviewed again. An Approved request can't be reopened once its Refund is Issued, because Cadence can't take the money back.

## Considered Options

- **Decisions are final, and the buyer raises a new request instead**: rejected, because a wrong approval would have no way back, even while the money hasn't gone yet.
- **Only Declined requests can be reopened**: rejected for the same reason.

## Consequences

Everything approval does has to be undoable. A future change to what approval does must also say how Reopen undoes it.
