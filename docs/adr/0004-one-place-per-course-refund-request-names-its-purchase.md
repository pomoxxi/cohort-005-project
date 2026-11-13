# One place per course, and a Refund Request names its Purchase

A learner has at most one place per course, from either an Individual Purchase or a Claimed Seat, never both. Buying and claiming a Seat both refuse a learner who already has a place. So when a Refund Request on an Individual Purchase is approved, the place being revoked can only have come from that Purchase.

A Refund Request belongs to one specific Purchase, which the buyer picks: an Individual Purchase from the course page, or a Team Licence from the team page. Only the buyer of a Purchase can raise one.

## Consequences

The code used to attach a Refund Request to the buyer's newest Purchase of the course. A learner who bought for themselves and then bought a Team Licence would have refunded the wrong one.
