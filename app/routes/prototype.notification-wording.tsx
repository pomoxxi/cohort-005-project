// PROTOTYPE — throwaway, lives on the prototype/notification-wording branch only.
// Question (wayfinder ticket "What does each Notification say, and where does
// clicking it take you?"): three wording styles for every Notification kind,
// switchable via ?variant=A|B|C, on a throwaway /prototype/notification-wording
// route. The Notification Feed's look is a separate ticket, so every variant
// uses the same plain list; only the words (and their hierarchy) change.
// Sample data is hard-coded from the seed's people and courses. No database.
import type { ReactNode } from "react";
import { useSearchParams } from "react-router";
import { PrototypeSwitcher } from "~/components/prototype-switcher";
import { formatPrice } from "~/lib/utils";

type Kind =
  | "refund_request_raised"
  | "refund_request_approved"
  | "refund_request_declined"
  | "seat_claimed"
  | "question_posted"
  | "comment_reply";

type Sample = {
  id: string;
  kind: Kind;
  ago: string;
  actor?: string; // the person who acted (never the recipient)
  course: string;
  lesson?: string;
  purchase?: "individual" | "team";
  seats?: { claimed: number; total: number };
  amount?: number; // cents
  text?: string; // what a person wrote: reason, decision note, Question, reply
  link: string; // where clicking goes (recommended)
  edge?: string; // the edge case this row exists to show
};

type Recipient = { name: string; role: string; samples: Sample[] };

const TS = "Introduction to TypeScript";
const API = "Building REST APIs with Node.js";

const RECIPIENTS: Recipient[] = [
  {
    name: "Alex Rivera",
    role: "Platform Admin",
    samples: [
      {
        id: "raised-individual",
        kind: "refund_request_raised",
        ago: "4m",
        actor: "Emma Wilson",
        course: TS,
        purchase: "individual",
        amount: 4900,
        text: "The pace is too fast for me and I don't have time to keep up with it this month.",
        link: "/admin/refunds",
      },
      {
        id: "raised-team",
        kind: "refund_request_raised",
        ago: "1h",
        actor: "Bossy McBossface",
        course: API,
        purchase: "team",
        seats: { claimed: 0, total: 10 },
        amount: 39000,
        text: "We bought the wrong course for the team.",
        link: "/admin/refunds",
      },
      {
        id: "raised-already-decided",
        kind: "refund_request_raised",
        ago: "2d",
        actor: "James Park",
        course: API,
        purchase: "individual",
        amount: 5900,
        text: "Not what I expected.",
        link: "/admin/refunds?status=declined",
        edge: "Another Platform Admin already declined it. The Notification stays as it was, but it's no longer on the Open list.",
      },
    ],
  },
  {
    name: "Emma Wilson",
    role: "Student (buyer of an Individual Purchase)",
    samples: [
      {
        id: "approved-individual",
        kind: "refund_request_approved",
        ago: "10m",
        course: TS,
        purchase: "individual",
        amount: 4900,
        link: "/settings",
        edge: "Approved with no note. Emma has lost her Enrollment.",
      },
      {
        id: "declined-individual",
        kind: "refund_request_declined",
        ago: "3d",
        course: API,
        purchase: "individual",
        amount: 5900,
        text: "You've watched most of the course, which is past the Watch Limit.",
        link: "/settings",
      },
    ],
  },
  {
    name: "Bossy McBossface",
    role: "Team Admin",
    samples: [
      {
        id: "seat-claimed",
        kind: "seat_claimed",
        ago: "2m",
        actor: "Olivia Martinez",
        course: API,
        seats: { claimed: 4, total: 10 },
        link: "/team",
      },
      {
        id: "approved-team",
        kind: "refund_request_approved",
        ago: "1d",
        course: TS,
        purchase: "team",
        seats: { claimed: 0, total: 5 },
        amount: 19500,
        text: "Refunded in full; sorry it wasn't the right fit.",
        link: "/team",
      },
      {
        id: "declined-team",
        kind: "refund_request_declined",
        ago: "1w",
        course: API,
        purchase: "team",
        amount: 39000,
        text: "Three Seats were already claimed, so this Team Licence can't be refunded.",
        link: "/team",
      },
    ],
  },
  {
    name: "Sarah Chen",
    role: "Instructor",
    samples: [
      {
        id: "question",
        kind: "question_posted",
        ago: "20m",
        actor: "Olivia Martinez",
        course: TS,
        lesson: "Generic Constraints",
        text: "Why does `T extends object` still let me pass an array? I expected it to only accept plain objects.",
        link: "/courses/introduction-to-typescript/lessons/<id>#comment-<id>",
      },
      {
        id: "question-long",
        kind: "question_posted",
        ago: "5h",
        actor: "Liam Thompson",
        course: TS,
        lesson: "Installing and Configuring TypeScript",
        text: "I followed every step but tsc keeps saying it can't find my tsconfig. I'm on Windows using PowerShell, and I installed TypeScript globally with npm before the lesson, then again locally like the video shows. Do I need to uninstall the global one first, or is it something about the path? I tried running it from the project folder and from the src folder and got the same error both times.",
        link: "/courses/introduction-to-typescript/lessons/<id>#comment-<id>",
        edge: "A long Question: how much of it the Notification shows.",
      },
    ],
  },
  {
    name: "Liam Thompson",
    role: "Student (author of a top-level Comment)",
    samples: [
      {
        id: "reply-instructor",
        kind: "comment_reply",
        ago: "1h",
        actor: "Sarah Chen",
        course: TS,
        lesson: "Installing and Configuring TypeScript",
        text: "Run `npx tsc --init` from the project folder. The global install is fine, but tsc looks for tsconfig.json in the folder you run it from.",
        link: "/courses/introduction-to-typescript/lessons/<id>#comment-<id>",
        edge: "The reply is from the course's Instructor.",
      },
      {
        id: "reply-student",
        kind: "comment_reply",
        ago: "2h",
        actor: "Emma Wilson",
        course: TS,
        lesson: "Installing and Configuring TypeScript",
        text: "Same thing happened to me!",
        link: "/courses/introduction-to-typescript/lessons/<id>#comment-<id>",
      },
    ],
  },
];

// ─── Variant A: Headline + detail ───────────────────────────────────────────
// A short fixed headline per kind, then one line of detail. No quoted text.

function headline(s: Sample): string {
  switch (s.kind) {
    case "refund_request_raised":
      return "New Refund Request";
    case "refund_request_approved":
      return "Refund Request approved";
    case "refund_request_declined":
      return "Refund Request declined";
    case "seat_claimed":
      return "Seat claimed";
    case "question_posted":
      return "New Question";
    case "comment_reply":
      return "New reply to your Comment";
  }
}

function detail(s: Sample): string {
  const what =
    s.purchase === "team" ? `Team Licence for ${s.course}` : s.course;
  switch (s.kind) {
    case "refund_request_raised":
      return `${s.actor} · ${what} · ${formatPrice(s.amount)}`;
    case "refund_request_approved":
      return `${what} · ${formatPrice(s.amount)} is on its way back to you`;
    case "refund_request_declined":
      return `${what} · you keep everything you bought`;
    case "seat_claimed":
      return `${s.actor} · ${s.course} · ${s.seats!.claimed} of ${s.seats!.total} Seats claimed`;
    case "question_posted":
    case "comment_reply":
      return `${s.actor} · ${s.lesson} · ${s.course}`;
  }
}

function VariantA({ s }: { s: Sample }) {
  return (
    <div>
      <p className="font-semibold">{headline(s)}</p>
      <p className="text-sm text-muted-foreground">{detail(s)}</p>
    </div>
  );
}

// ─── Variant B: One sentence, actor first ───────────────────────────────────
// A single sentence, like "Emma Wilson asked for a refund on X". Names bold.

function VariantB({ s }: { s: Sample }) {
  const b = (t: string | undefined) => <strong>{t}</strong>;
  const course =
    s.purchase === "team" ? (
      <>your Team Licence for {b(s.course)}</>
    ) : (
      b(s.course)
    );
  let sentence: ReactNode;
  switch (s.kind) {
    case "refund_request_raised":
      sentence =
        s.purchase === "team" ? (
          <>
            {b(s.actor)} asked for a refund on a Team Licence for{" "}
            {b(s.course)} ({formatPrice(s.amount)},{" "}
            {s.seats!.total} Seats).
          </>
        ) : (
          <>
            {b(s.actor)} asked for a refund on {b(s.course)} (
            {formatPrice(s.amount)}).
          </>
        );
      break;
    case "refund_request_approved":
      sentence = (
        <>
          We approved your refund for {course}. {formatPrice(s.amount)} is on
          its way back to you.
        </>
      );
      break;
    case "refund_request_declined":
      sentence = <>We declined your refund for {course}.</>;
      break;
    case "seat_claimed":
      sentence = (
        <>
          {b(s.actor)} claimed a Seat on {b(s.course)}. {s.seats!.claimed} of{" "}
          {s.seats!.total} Seats are now claimed.
        </>
      );
      break;
    case "question_posted":
      sentence = (
        <>
          {b(s.actor)} asked a Question on {b(s.lesson)} in {s.course}.
        </>
      );
      break;
    case "comment_reply":
      sentence = (
        <>
          {b(s.actor)} replied to your Comment on {b(s.lesson)}.
        </>
      );
      break;
  }
  return (
    <div className="flex gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {s.actor
          ? s.actor
              .split(" ")
              .map((p) => p[0])
              .join("")
          : "C"}
      </div>
      <p className="text-sm leading-6">{sentence}</p>
    </div>
  );
}

// ─── Variant C: What someone wrote comes first ──────────────────────────────
// A small context line, then the words a person wrote (reason, decision note,
// Question, reply), clamped to three lines. Kinds with no words fall back to a
// short sentence.

function context(s: Sample): string {
  switch (s.kind) {
    case "refund_request_raised":
      return `${s.actor} · Refund Request · ${s.purchase === "team" ? "Team Licence for " : ""}${s.course} · ${formatPrice(s.amount)}`;
    case "refund_request_approved":
      return `Refund Request approved · ${s.course} · ${formatPrice(s.amount)} on its way back`;
    case "refund_request_declined":
      return `Refund Request declined · ${s.course}`;
    case "seat_claimed":
      return `Seat claimed · ${s.course}`;
    case "question_posted":
      return `${s.actor} asked · ${s.lesson} · ${s.course}`;
    case "comment_reply":
      return `${s.actor} replied to you · ${s.lesson}`;
  }
}

function VariantC({ s }: { s: Sample }) {
  const fallback =
    s.kind === "seat_claimed"
      ? `${s.actor} claimed a Seat (${s.seats!.claimed} of ${s.seats!.total}).`
      : s.kind === "refund_request_approved"
        ? "Your refund is on its way."
        : "";
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {context(s)}
      </p>
      {s.text ? (
        <blockquote className="mt-1 line-clamp-3 border-l-2 pl-3 text-sm">
          {s.text}
        </blockquote>
      ) : (
        <p className="mt-1 text-sm">{fallback}</p>
      )}
    </div>
  );
}

const VARIANTS = [
  { key: "A", name: "Headline + detail", Component: VariantA },
  { key: "B", name: "One sentence, actor first", Component: VariantB },
  { key: "C", name: "Their words first", Component: VariantC },
];

export function meta() {
  return [{ title: "PROTOTYPE: Notification wording — Cadence" }];
}

export default function NotificationWordingPrototype() {
  const [searchParams] = useSearchParams();
  const key = searchParams.get("variant") ?? "A";
  const variant = VARIANTS.find((v) => v.key === key) ?? VARIANTS[0];
  const { Component } = variant;

  return (
    <div className="mx-auto max-w-3xl p-6 pb-24 lg:p-8">
      <p className="mb-2 inline-block rounded bg-fuchsia-100 px-2 py-0.5 text-xs font-medium text-fuchsia-800">
        PROTOTYPE · throwaway
      </p>
      <h1 className="text-2xl font-bold">
        What does each Notification say, and where does clicking it take you?
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Variant {variant.key}: {variant.name}. Use ← → or the bar below. The
        grey line under each Notification is the link target and is not part
        of the design.
      </p>

      {RECIPIENTS.map((r) => (
        <section key={r.name} className="mt-8">
          <h2 className="mb-2 text-sm font-semibold">
            {r.name}{" "}
            <span className="font-normal text-muted-foreground">
              · {r.role}
            </span>
          </h2>
          <ul className="divide-y rounded-lg border bg-card">
            {r.samples.map((s) => (
              <li key={s.id} className="flex gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <Component s={s} />
                  <p className="mt-2 font-mono text-xs text-fuchsia-700">
                    → {s.link}
                  </p>
                  {s.edge && (
                    <p className="mt-1 text-xs italic text-amber-700">
                      Edge case: {s.edge}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {s.ago}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <PrototypeSwitcher
        variants={VARIANTS.map(({ key, name }) => ({ key, name }))}
      />
    </div>
  );
}
