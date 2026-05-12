import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  JOB_DATA,
  JOB_SLUGS,
  RECRUITERS,
  type CandidateData,
} from "@/lib/data";

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getJobSlug(title: string): string {
  return (
    JOB_SLUGS[title] ||
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: CandidateData };

export default function ResultsPage() {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("cityscapeCandidate");
    if (!raw) {
      setState({ status: "error" });
      return;
    }
    try {
      const data = JSON.parse(raw);
      if (!data || typeof data !== "object") {
        setState({ status: "error" });
        return;
      }
      setState({ status: "ready", data });
    } catch (err) {
      console.error("Failed to parse candidate data:", err);
      setState({ status: "error" });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Your Matches — Cityscape AI</title>
      </Head>

      <header
        className="sticky top-0 bg-white flex items-center justify-between px-7 z-[100]"
        style={{ height: "var(--header-h)", boxShadow: "var(--shadow-header)" }}
      >
        <Link
          href="/"
          className="text-[22px] font-semibold tracking-tight text-charcoal no-underline"
        >
          Cityscape<span className="text-green">AI</span>
        </Link>
        <div className="text-sm font-medium text-green tracking-wide hidden sm:block">
          Your AI Recruiter
        </div>
      </header>

      <main className="py-14 px-7 pb-20 max-w-[1200px] mx-auto">
        {state.status === "loading" && null}
        {state.status === "error" && <ErrorState />}
        {state.status === "ready" && <Results data={state.data} />}
      </main>
    </>
  );
}

function ErrorState() {
  return (
    <div
      className="text-center py-20 px-6"
      style={{ animation: "fadeIn 0.5s var(--ease)" }}
    >
      <h2 className="text-2xl font-semibold text-charcoal mb-3 tracking-tight">
        Something went wrong
      </h2>
      <p className="text-grey-600 mb-6 text-[15px]">
        We couldn't find your profile. Please start again — it only takes a
        couple of minutes.
      </p>
      <Link
        href="/"
        className="inline-block bg-green text-white no-underline px-6 py-3 rounded-3xl font-medium text-sm transition-all duration-200 hover:bg-green-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(74,124,89,0.25)]"
      >
        Start again
      </Link>
    </div>
  );
}

function Results({ data }: { data: CandidateData }) {
  // ----- Jobs section -----
  const valid = Array.isArray(data.jobMatches)
    ? data.jobMatches.filter((t): t is string => !!t && !!JOB_DATA[t])
    : [];

  const fallbackOrder = [
    "Senior Project Manager",
    "Quantity Surveyor",
    "Civil Engineer",
    "Contracts Manager",
    "Design Manager",
  ];
  const jobs = [...valid];
  for (const fb of fallbackOrder) {
    if (jobs.length >= 3) break;
    if (!jobs.includes(fb)) jobs.push(fb);
  }
  const topThree = jobs.slice(0, 3);

  // ----- Recruiter section -----
  const recruiterName =
    data.recruiterMatch && RECRUITERS[data.recruiterMatch]
      ? data.recruiterMatch
      : "James Hartley";
  const recruiter = RECRUITERS[recruiterName];
  const initials = getInitials(recruiterName);
  const firstName = recruiterName.split(" ")[0];
  const calendlySubject = encodeURIComponent(
    `Introduction call — ${data.name || "New candidate"}`,
  );
  const calendlyBody = encodeURIComponent(
    `Hi ${firstName},\n\nI just completed the Cityscape AI intake and would like to book an introduction call.\n\nThanks,\n${data.name || ""}`,
  );

  return (
    <>
      <section>
        <div
          className="text-center mb-10"
          style={{ animation: "fadeUp 0.6s var(--ease) backwards" }}
        >
          <h2 className="text-[32px] font-semibold text-charcoal mb-2.5 tracking-tight">
            Roles matched for you
          </h2>
          <p className="text-base text-grey-600 mx-auto max-w-[560px]">
            Based on your profile, here are three opportunities worth exploring.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[22px] mb-2">
          {topThree.map((title, i) => (
            <JobCard key={title} title={title} index={i} />
          ))}
        </div>
      </section>

      <hr
        className="border-0 h-px bg-grey-200 mx-auto max-w-[800px]"
        style={{ margin: "72px auto 56px" }}
      />

      <section>
        <div
          className="text-center mb-10"
          style={{ animation: "fadeUp 0.6s var(--ease) backwards" }}
        >
          <h2 className="text-[32px] font-semibold text-charcoal mb-2.5 tracking-tight">
            Meet your dedicated consultant
          </h2>
          <p className="text-base text-grey-600 mx-auto max-w-[560px]">
            They'll be in touch shortly — here's a little about them.
          </p>
        </div>
        <div
          className="bg-white rounded-card shadow-card max-w-[560px] mx-auto text-center"
          style={{
            padding: "40px 36px",
            animation: "fadeUp 0.6s var(--ease) backwards",
            animationDelay: "0.4s",
          }}
        >
          <div
            className="w-24 h-24 rounded-full bg-green text-white flex items-center justify-center text-[34px] font-semibold tracking-tight mx-auto mb-[22px]"
            style={{
              boxShadow: "0 4px 16px rgba(74, 124, 89, 0.25)",
              animation: "avatarPop 0.7s var(--ease) backwards",
              animationDelay: "0.5s",
            }}
          >
            {initials}
          </div>
          <h3 className="text-2xl font-semibold text-charcoal mb-1.5 tracking-tight">
            {recruiterName}
          </h3>
          <div className="text-sm font-medium text-green mb-5">
            {recruiter.title}
          </div>
          <p className="text-[14.5px] text-grey-600 leading-[1.6] mb-[22px] text-left">
            {recruiter.bio}
          </p>
          <a
            href={`mailto:${recruiter.email}`}
            className="inline-block text-charcoal no-underline text-sm font-medium mb-[22px] px-3.5 py-1.5 rounded-full transition-all duration-200 hover:bg-[rgba(74,124,89,0.14)]"
            style={{ background: "var(--green-soft)" }}
          >
            {recruiter.email}
          </a>
          <br />
          <a
            href={`mailto:${recruiter.email}?subject=${calendlySubject}&body=${calendlyBody}`}
            className="inline-block bg-green text-white no-underline px-8 py-3 rounded-[26px] font-medium text-[15px] transition-all duration-200 hover:bg-green-hover hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(74,124,89,0.28)]"
          >
            Book an Introduction Call
          </a>
        </div>
      </section>
    </>
  );
}

function JobCard({ title, index }: { title: string; index: number }) {
  const job = JOB_DATA[title];
  if (!job) return null;
  const slug = getJobSlug(title);
  const url = `https://www.cityscapeltd.com/job-role/${slug}`;
  return (
    <article
      className="bg-white rounded-card shadow-card flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover"
      style={{
        padding: "26px 24px",
        animation: "fadeUp 0.6s var(--ease) backwards",
        animationDelay: `${0.1 * (index + 1)}s`,
      }}
    >
      <span className="inline-block bg-green text-white text-[11px] font-medium tracking-wide px-[11px] py-[5px] rounded-full mb-4 self-start uppercase">
        {job.sector}
      </span>
      <h3 className="text-[19px] font-semibold text-charcoal mb-2.5 tracking-tight leading-tight">
        {title}
      </h3>
      <div className="text-sm text-grey-600 mb-1.5 flex items-center gap-1.5">
        📍 {job.location}
      </div>
      <div className="text-base font-semibold text-green mb-4">
        {job.salary}
      </div>
      <p className="text-sm text-grey-600 leading-[1.55] flex-1 mb-[22px]">
        {job.description}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-center bg-green text-white no-underline px-[18px] py-[11px] rounded-3xl font-medium text-sm transition-all duration-200 hover:bg-green-hover hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(74,124,89,0.25)]"
      >
        View Role
      </a>
    </article>
  );
}
