# Cadence

Cadence is a course platform where learners buy courses and watch their lessons. This glossary fixes the words for a learner getting their money back.

## Language

### People

**Platform Admin**:
A Cadence staff member (`UserRole.Admin`). Only Platform Admins decide Refund Requests. A course's instructor doesn't.
_Avoid_: Admin (on its own), team member, the team, reviewer, support

**Team Admin**:
The customer who manages a Team and buys its Team Licences (`TeamMemberRole.Admin`). A Team Admin has no say over Refund Requests other than their own.
_Avoid_: Admin (on its own)

**Team**:
A customer group whose Team Admin buys Seats in a course for its members. It never means Cadence staff.

### Purchases

**Individual Purchase**:
A Purchase someone makes for themselves. It gives the buyer a place on the course. A learner has at most one place per course, from either an Individual Purchase or a Claimed Seat, never both.

**Team Licence**:
A Purchase a Team Admin makes for others. It gives Seats, not a place on the course for the buyer.
_Avoid_: Team purchase, bulk purchase

**Seat**:
One place on a course that a Team Licence holds for a Team member. An **Unclaimed Seat** hasn't been used yet. A **Claimed Seat** has been used by a learner, which gives them a place on the course.
_Avoid_: Coupon (the code's name for it, which wrongly suggests a discount), code, voucher

### Refund Requests

**Refund Request**:
A buyer asking for their money back on one specific Purchase they choose: an Individual Purchase from the course page, or a Team Licence from the team page. Only the buyer of a Purchase can raise one; a learner who claimed a Seat can't. A Platform Admin decides it. A buyer can open a new one after a decline.
While a Team Licence has an Open Refund Request, its Unclaimed Seats can't be claimed. A Team Licence with any Claimed Seat can't be refunded.
_Avoid_: Cancellation, cancel my purchase, reversal, chargeback, dispute

**Open**:
A Refund Request that no Platform Admin has decided yet, or whose decision was Reopened.
_Avoid_: Requested, pending

**Reopen**:
A Platform Admin sending an Approved or Declined Refund Request back to Open, with a note saying why. It undoes everything the decision did. An Approved request can't be reopened once its Refund is Issued.
_Avoid_: Undo, revert, reverse

**Decline Note**:
The Platform Admin's explanation to the learner of why their Refund Request was Declined. The learner sees it by email and in their settings.

**Approved**:
A Refund Request that a Platform Admin accepted. It leads to a Refund. The learner loses access to the course at that moment, not when the money arrives. For a Team Licence, its Unclaimed Seats can never be claimed.

**Declined**:
A Refund Request that a Platform Admin turned down. It leads to no Refund. It always carries a Decline Note.
_Avoid_: Rejected, denied

### Refunds

**Refund**:
The money going back to the learner after their Refund Request is Approved. It is always the full amount the learner paid (the purchase's amount paid), never the course's list price. A learner gets at most one Refund per course: they can buy it again afterwards, but they can't ask for a second Refund.

The learner's progress (lessons completed, watch history, quiz attempts), comments and ratings are never deleted because of a Refund.
_Avoid_: Reversal, chargeback, cancellation

**Pending Refund**:
A Refund that has been approved but not yet confirmed as sent. A Platform Admin sends the money outside Cadence, then marks the Refund Issued or Failed.

**Issued Refund**:
A Refund confirmed as sent back to the learner.
_Avoid_: Completed, paid out

**Failed Refund**:
A Refund that couldn't be sent. Its Refund Request stays Approved, because the decision hasn't changed. A Platform Admin tries again with a new Refund Attempt.

**Refund Attempt**:
One time a Platform Admin tried to send a Refund's money, and what happened: Issued or Failed, who did it, when, and an optional note. Attempts are never edited or deleted. The Refund's current state is its latest Refund Attempt, or Pending if there are none yet.
_Avoid_: Payout, transaction, retry

### Enrollment after a Refund

**Revoked Enrollment**:
An enrollment whose Refund Request was Approved. The learner can't open the course, but the enrollment is kept so it can be restored if they buy the course again or claim a Seat for it. Instructor student lists, counts and analytics leave it out.
_Avoid_: Cancelled, suspended, refunded enrollment, unenrolled

**Retention Period**:
The 90 days after Approval that a Revoked Enrollment is kept. If the learner buys again or claims a Seat within it, the enrollment is restored with its original dates. After it, the enrollment is deleted. The learner's progress stays either way.
