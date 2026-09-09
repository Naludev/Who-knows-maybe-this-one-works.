import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Flame, Star, Sparkle, Globe, Tag } from "lucide-react";
import { base44 } from "@/api/base44Client";
import SeriesCard from "@/components/SeriesCard";
import HeroBanner from "@/components/HeroBanner";

const GENRES = ["Romance","School","Fantasy","Historical","Action","Comedy","Drama","Mystery","Supernatural","Slice of Life"];
const COUNTRIES = ["Thailand","South Korea","Japan","Taiwan","China","Philippines","Vietnam"];

function Row({ icon: Icon, title, series, accent }) {
  if (!series?.length) return null;
  return (
    <section className="mb-7">
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="font-heading text-lg font-bold flex items-center gap-2">
          <Icon size={18} className={accent} /> {title}
        </h2>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar scroll-snap-x px-1 pb-1">
        {series.map((s) => <SeriesCard key={s.id} series={s} />)}
      </div>
    </section>
  );
}

export default function Home() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Series.list("-trending_score", 1000).then((s) => {
      setAll(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  const featured = all.find((s) => s.featured) || all[0];
  const trending = [...all].sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, 10);
  const highest = [...all].sort((a, b) => (b.trending_score || 0) - (a.trending_score || 0)).slice(0, 10);
  const newest = [...all].sort((a, b) => (b.release_year || 0) - (a.release_year || 0)).slice(0, 10);

  return (
    <div className="px-4 pt-4 pb-24">
      <HeroBanner series={featured} />
      <Row icon={Sparkles} title="Recommended For You" accent="text-primary" series={highest} />
      <Row icon={Flame} title="Trending This Week" accent="text-secondary" series={trending} />
      <Row icon={Star} title="Highest Rated" accent="text-warning" series={highest} />
      <Row icon={Sparkle} title="Newly Added" accent="text-success" series={newest} />

      <section className="mb-7">
        <h2 className="font-heading text-lg font-bold flex items-center gap-2 mb-3 px-1"><Globe size={18} className="text-secondary" /> Browse By Country</h2>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {COUNTRIES.map((c) => {
            const count = all.filter((s) => s.country === c).length;
            return (
              <Link key={c} to={`/search?country=${encodeURIComponent(c)}`}
                className="shrink-0 px-4 py-2.5 rounded-2xl bg-card ring-1 ring-border hover:ring-primary/60 text-sm font-medium">
                {c} <span className="text-muted-foreground text-xs">· {count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mb-7">
        <h2 className="font-heading text-lg font-bold flex items-center gap-2 mb-3 px-1"><Tag size={18} className="text-primary" /> Browse By Genre</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link key={g} to={`/search?genre=${encodeURIComponent(g)}`}
              className="px-3.5 py-2 rounded-full bg-card ring-1 ring-border hover:ring-primary/60 hover:text-primary text-sm font-medium transition-colors">
              {g}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}