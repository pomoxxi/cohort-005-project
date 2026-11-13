# A place on a course ends at approval, and is kept for 90 days

The buyer keeps the course while their Refund Request is Open, and loses it the moment a Platform Admin approves it. The enrollment isn't deleted. It becomes a Revoked Enrollment, which access checks, instructor lists, counts and analytics all leave out. If the learner buys the course again or claims a Seat for it within the 90-day Retention Period, the enrollment is restored with its original dates. After that, it's deleted.

## Considered Options

- **When the request is raised**: rejected, because a buyer whose request is declined would have been locked out for nothing.
- **When the Refund is Issued**: rejected, because a Failed Refund would leave the buyer holding both the course and an Approved Refund Request.
- **Delete the enrollment at approval**: rejected, because a learner who comes back would lose their enrollment dates and completion.

## Consequences

Every read of `enrollments` must go through one shared helper that leaves out Revoked Enrollments. A query that reads the table directly would give a refunded learner back the course they were refunded for.
