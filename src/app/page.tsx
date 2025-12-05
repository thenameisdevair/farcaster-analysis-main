"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type Summary = {
  range: string;
  totalCasts: number;
  totalImpressions: number;
  totalEngagements: number;
  avgEngagementRatePercent: number;
  followerCount: number;
  accountAgeDays: number;
};

type Account = {
  farcasterId: string;
  handle: string;
  displayName: string | null;
  createdAt: string;
};

type MeSummaryResponse = {
  account: Account;
  summary: Summary;
  highlights: {
    bestDayImpressions: {
      date: string;
      impressions: number;
    };
    topCastId: number | null;
  };
};

type TopPost = {
  id: number;
  text: string | null;
  impressions: number;
  engagements: number;
  createdAt: string;
};

type TopPostsResponse = {
  account: Account;
  count: number;
  posts: TopPost[];
};

type ActivityDay = {
  date: string;
  postCount: number;
  engagements: number;
};

type ActivityResponse = {
  ok: boolean;
  fid: number;
  range: string;
  days: ActivityDay[];
};

type Tab = "overview" | "audience" | "content" | "video";
type ActivityMetric = "postCount" | "engagements";

export default function HomePage() {
  const searchParams = useSearchParams();
  const fidFromUrl = searchParams.get("fid");
  const fid = fidFromUrl && fidFromUrl.trim().length > 0 ? fidFromUrl : "774643";

  const [tab, setTab] = useState<Tab>("overview");

  const [summary, setSummary] = useState<Summary | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [activityDays, setActivityDays] = useState<ActivityDay[]>([]);

  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingTopPosts, setLoadingTopPosts] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);

  const [errorSummary, setErrorSummary] = useState<string | null>(null);
  const [errorTopPosts, setErrorTopPosts] = useState<string | null>(null);
  const [errorActivity, setErrorActivity] = useState<string | null>(null);

  const [activityMetric, setActivityMetric] =
    useState<ActivityMetric>("postCount");

  // Fetch summary
  useEffect(() => {
    async function fetchSummary() {
      setLoadingSummary(true);
      setErrorSummary(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/live/summary?fid=${encodeURIComponent(fid)}`
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Summary error: ${res.status} ${res.statusText} – ${text}`
          );
        }
        const data = (await res.json()) as MeSummaryResponse;
        setSummary(data.summary);
        setAccount(data.account);
      } catch (err: any) {
        console.error("Error fetching summary:", err);
        setErrorSummary(err?.message ?? "Unknown summary error");
      } finally {
        setLoadingSummary(false);
      }
    }

    fetchSummary();
  }, [fid]);

  // Fetch top posts
  useEffect(() => {
    async function fetchTopPosts() {
      setLoadingTopPosts(true);
      setErrorTopPosts(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/live/top-posts?fid=${encodeURIComponent(
            fid
          )}&limit=5`
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Top posts error: ${res.status} ${res.statusText} – ${text}`
          );
        }
        const data = (await res.json()) as TopPostsResponse;
        setTopPosts(data.posts ?? []);
      } catch (err: any) {
        console.error("Error fetching top posts:", err);
        setErrorTopPosts(err?.message ?? "Unknown top posts error");
      } finally {
        setLoadingTopPosts(false);
      }
    }

    fetchTopPosts();
  }, [fid]);

  // Fetch activity
  useEffect(() => {
    async function fetchActivity() {
      setLoadingActivity(true);
      setErrorActivity(null);
      try {
        const res = await fetch(
          `${API_BASE}/api/live/activity?fid=${encodeURIComponent(fid)}`
        );
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Activity error: ${res.status} ${res.statusText} – ${text}`
          );
        }
        const data = (await res.json()) as ActivityResponse;
        if (!data.ok) {
          throw new Error("Activity response not ok");
        }
        setActivityDays(data.days ?? []);
      } catch (err: any) {
        console.error("Error fetching activity:", err);
        setErrorActivity(err?.message ?? "Unknown activity error");
      } finally {
        setLoadingActivity(false);
      }
    }

    fetchActivity();
  }, [fid]);

  // Build activity bars (simple inline, no canvas)
  const maxValue = React.useMemo(() => {
    const key = activityMetric;
    let max = 0;
    activityDays.forEach((d) => {
      const v = d[key] || 0;
      if (v > max) max = v;
    });
    return max || 1;
  }, [activityDays, activityMetric]);

  const brandPurple = "#5A32FF";

  return (
    <div
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "16px 24px 40px",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        background: "#050816",
        color: "#e6e9f0",
        minHeight: "100vh",
      }}
    >
      {/* Header + Tabs */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Analytics</div>
          <div style={{ fontSize: 12, color: "#8899a6" }}>
            {account
              ? `@${account.handle} • fid ${account.farcasterId}`
              : "Loading Farcaster account…"}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, fontSize: 14 }}>
          {(["overview", "audience", "content", "video"] as Tab[]).map((t) => (
            <div
              key={t}
              onClick={() => setTab(t)}
              style={{
                position: "relative",
                paddingBottom: 6,
                cursor: "pointer",
                color: tab === t ? "#ffffff" : "#8899a6",
                fontWeight: tab === t ? 600 : 400,
              }}
            >
              {t[0].toUpperCase() + t.slice(1)}
              {tab === t && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: 3,
                    borderRadius: 999,
                    background: brandPurple,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Range bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 600 }}>Account overview</div>
        <div
          style={{
            display: "inline-flex",
            gap: 4,
            background: "#111827",
            padding: 2,
            borderRadius: 999,
          }}
        >
          {["7D", "2W", "4W", "3M", "1Y"].map((label, idx) => (
            <div
              key={label}
              style={{
                padding: "4px 10px",
                fontSize: 12,
                borderRadius: 999,
                cursor: "default",
                color: idx === 0 ? "#050816" : "#e6e9f0",
                background: idx === 0 ? "#e6e9f0" : "transparent",
                fontWeight: idx === 0 ? 500 : 400,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* TABS CONTENT */}
      {tab === "overview" && (
        <>
          {/* Main card */}
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(90,50,255,0.18), rgba(10,10,20,0.95))",
              borderRadius: 16,
              border: "1px solid rgba(148,163,255,0.3)",
              padding: "16px 20px",
              marginBottom: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>
                  {account
                    ? `@${account.handle} – Overview`
                    : "Loading overview…"}
                </div>
                <div style={{ fontSize: 12, color: "#cbd5f5" }}>
                  {summary
                    ? `${summary.range} • Account age: ${summary.accountAgeDays} days`
                    : "Fetching summary…"}
                </div>
              </div>
              <div style={{ fontSize: 12, color: "#cbd5f5" }}>
                Daily ·{" "}
                {activityMetric === "postCount" ? "Posts" : "Engagements"}
              </div>
            </div>

            {/* Metric toggle */}
            <div
              style={{
                display: "inline-flex",
                gap: 4,
                background: "rgba(15,23,42,0.7)",
                padding: 2,
                borderRadius: 999,
                marginBottom: 8,
                fontSize: 11,
              }}
            >
              {[
                { key: "postCount", label: "Posts" },
                { key: "engagements", label: "Engagements" },
              ].map((m) => (
                <div
                  key={m.key}
                  onClick={() => setActivityMetric(m.key as ActivityMetric)}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 999,
                    cursor: "pointer",
                    background:
                      activityMetric === m.key ? brandPurple : "transparent",
                    color:
                      activityMetric === m.key ? "#ffffff" : "rgba(226,232,255,0.8)",
                    fontWeight: activityMetric === m.key ? 600 : 400,
                    border:
                      activityMetric === m.key
                        ? "1px solid rgba(255,255,255,0.3)"
                        : "1px solid transparent",
                  }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* Activity chart */}
            <div
              style={{
                marginTop: 4,
                borderRadius: 12,
                background: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(148,163,255,0.35)",
                padding: "10px 12px 8px",
              }}
            >
              {loadingActivity && (
                <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 6 }}>
                  Loading activity…
                </div>
              )}
              {errorActivity && (
                <div style={{ fontSize: 11, color: "#fca5a5", marginBottom: 6 }}>
                  {errorActivity}
                </div>
              )}

              <div
                style={{
                  height: 180,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 12,
                  padding: "8px 0 4px",
                }}
              >
                {activityDays.length === 0 ? (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9ca3af",
                    }}
                  >
                    No recent activity yet for this fid.
                  </div>
                ) : (
                  activityDays.map((d) => {
                    const value =
                      activityMetric === "postCount"
                        ? d.postCount
                        : d.engagements;
                    const heightPercent = Math.max(
                      8,
                      Math.round((value / maxValue) * 100)
                    );
                    const dateObj = new Date(d.date);
                    const labelText = dateObj.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={d.date}
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 4,
                        }}
                      >
                        <div
                          style={{
                            width: 18,
                            borderRadius: 999,
                            background:
                              "linear-gradient(180deg, #a78bfa, #5b21b6)",
                            height: `${heightPercent}%`,
                            boxShadow:
                              value > 0
                                ? "0 0 10px rgba(129,140,248,0.7)"
                                : "none",
                            transition: "height 0.25s ease",
                          }}
                          title={`${value} ${activityMetric}`}
                        />
                        <div
                          style={{
                            fontSize: 10,
                            color: "#9ca3af",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {labelText}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div
            style={{
              background: "rgba(15,23,42,0.95)",
              borderRadius: 16,
              border: "1px solid rgba(148,163,255,0.3)",
              padding: "16px 20px",
              marginBottom: 16,
            }}
          >
            {loadingSummary && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 8 }}>
                Loading summary…
              </div>
            )}
            {errorSummary && (
              <div style={{ fontSize: 11, color: "#fca5a5", marginBottom: 8 }}>
                {errorSummary}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <StatCard
                label="Followers"
                main={
                  summary ? summary.followerCount.toLocaleString() : "–"
                }
                sub={
                  summary
                    ? `${summary.followerCount.toLocaleString()} total`
                    : ""
                }
              />
              <StatCard
                label="Total casts"
                main={summary ? summary.totalCasts.toString() : "–"}
              />
              <StatCard
                label="Impressions"
                main={
                  summary
                    ? summary.totalImpressions.toLocaleString()
                    : "–"
                }
              />
              <StatCard
                label="Engagements"
                main={
                  summary
                    ? summary.totalEngagements.toLocaleString()
                    : "–"
                }
              />
              <StatCard
                label="Engagement rate"
                main={
                  summary
                    ? `${summary.avgEngagementRatePercent.toFixed(1)}%`
                    : "–"
                }
              />
            </div>
          </div>

          {/* Top posts */}
          <div
            style={{
              background: "rgba(15,23,42,0.95)",
              borderRadius: 16,
              border: "1px solid rgba(148,163,255,0.3)",
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600 }}>
                Top posts (by engagements)
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Recent</div>
            </div>

            {loadingTopPosts && (
              <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                Loading top posts…
              </div>
            )}
            {errorTopPosts && (
              <div style={{ fontSize: 11, color: "#fca5a5", marginBottom: 4 }}>
                {errorTopPosts}
              </div>
            )}

            {topPosts.length === 0 && !loadingTopPosts && !errorTopPosts && (
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                No posts found yet for this fid.
              </div>
            )}

            {topPosts.map((post) => {
              const text =
                post.text && post.text.length > 180
                  ? post.text.slice(0, 180) + "…"
                  : post.text || "(no text)";

              return (
                <div
                  key={post.id}
                  style={{
                    padding: "8px 0",
                    borderTop: "1px solid rgba(55,65,81,0.6)",
                  }}
                >
                  <div style={{ fontSize: 13 }}>{text}</div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#9ca3af",
                      marginTop: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      {new Date(post.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>
                      {post.impressions.toLocaleString()} impressions ·{" "}
                      {post.engagements.toLocaleString()} engagements
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "audience" && (
        <PlaceholderCard
          title="Audience"
          subtitle="Demographics, devices, and active times (future Farcaster data integrations)."
        />
      )}

      {tab === "content" && (
        <PlaceholderCard
          title="Content"
          subtitle="Per-post performance, replies, and media breakdown (future extension)."
        />
      )}

      {tab === "video" && (
        <PlaceholderCard
          title="Video"
          subtitle="Video views and watch time across your casts (future extension)."
        />
      )}

      {/* Footer */}
      <div
        style={{
          fontSize: 11,
          color: "#9ca3af",
          marginTop: 20,
          textAlign: "center",
        }}
      >
        Made by <span style={{ color: brandPurple }}>0xdevair</span> · Powered
        by Neynar & Farcaster Hub
      </div>
    </div>
  );
}

function StatCard(props: {
  label: string;
  main: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(148,163,255,0.25)",
        padding: "8px 10px",
        background:
          "linear-gradient(145deg, rgba(30,64,175,0.4), rgba(15,23,42,0.9))",
      }}
    >
      <div style={{ fontSize: 11, color: "#cbd5f5", marginBottom: 4 }}>
        {props.label}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700 }}>{props.main}</div>
        {props.sub && (
          <div style={{ fontSize: 11, color: "#9ca3af" }}>{props.sub}</div>
        )}
      </div>
    </div>
  );
}

function PlaceholderCard(props: { title: string; subtitle: string }) {
  return (
    <div
      style={{
        background: "rgba(15,23,42,0.95)",
        borderRadius: 16,
        border: "1px solid rgba(148,163,255,0.3)",
        padding: "16px 20px",
        marginTop: 8,
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
        {props.title}
      </div>
      <div style={{ fontSize: 12, color: "#9ca3af" }}>{props.subtitle}</div>
      <div
        style={{
          fontSize: 11,
          color: "#6b7280",
          marginTop: 8,
        }}
      >
        This tab is a placeholder in the MVP. Once the core overview is solid,
        we can progressively enhance it with more Farcaster + Neynar data.
      </div>
    </div>
  );
}
