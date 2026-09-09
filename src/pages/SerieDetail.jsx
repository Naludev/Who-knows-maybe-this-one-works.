import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Bookmark, Eye, Heart, Share2, Flag, ArrowLeft, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";

export default function SeriesDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [series, setSeries] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [me, setMe] = useState(null);
  const [seen, setSeen] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [showRate, setShowRate] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [spoiler, setSpoiler] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const s = await base44.entities.Series.get(id);
    setSeries(s);
    const u = await base44.auth.me();
    setMe(u);
    const [revs, seenList, wl] = await Promise.all([
      base44.entities.Review.filter({ series_id: id }),
      base44.entities.SeenEntry.filter({ user_id: u.id, series_id: id }),
      base44.entities.WatchlistItem.filter({ user_id: u.id, series_id: id }),
    ]);
    setReviews(revs.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)));
    setSeen(seenList[0] || null);
    setInWatchlist(wl.length > 0);
  };

  useEffect(() => { load(); }, [id]);

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length) : (series?.trending_score || 0) / 20;

  const markSeen = async () => {
    if (seen) { setShowRate(true); return; }
    setBusy(true);
    try {
      await base44.entities.SeenEntry.create({ user_id: me.id, series_id: id, series_title: series.title, poster_url: series.poster_url, rating, date_watched: new Date().toISOString().slice(0, 10) });
      await load();
      setShowRate(true);
    } finally { setBusy(false); }
  };

  const toggleWatchlist = async () => {
    setBusy(true);
    try {
      if (inWatchlist) {
        const wl = await base44.entities.WatchlistItem.filter({ user_id: me.id, series_id: id });
        await base44.entities.WatchlistItem.delete(wl[0].id);
        setInWatchlist(false);
      } else {
        await base44.entities.WatchlistItem.create({ user_id: me.id, series_id: id, series_title: series.title, poster_url: series.poster_url });
        setInWatchlist(true);
      }
    } finally { setBusy(false); }
  };

  const submitReview = async () => {
    setBusy(true);
    try {
      const existing = reviews.find((r) => r.user_id === me.id);
      if (existing) {
        await base44.entities.Review.update(existing.id, { rating, text: reviewText, spoiler });
      } else {
        await base44.entities.Review.create({
          series_id: id, series_title: series.title, user_id: me.id,
          user_name: me.display_name || me.full_name || "Fan", user_avatar: me.avatar_url,
          rating, text: reviewText, spoiler, likes: [], replies: [],
        });
      }
      if (seen) await base44.entities.SeenEntry.update(seen.id, { rating, review_text: reviewText });
      setReviewText(""); setShowRate(false);
      await load();
    } finally { setBusy(false); }
  };

  const likeReview = async (r) => {
    const liked = r.likes?.includes(me.id);
    await base44.entities.Review.update(r.id, { likes: liked ? r.likes.filter((x) => x !== me.id) : [...(r.likes || []), me.id] });
    await load();
  };

  if (!series) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="pb-24">
      <div className="relative h-56 -mb-20">
        <Image src={series.cover_url} alt={series.title} fittingType="fill" className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <button onClick={() => nav(-1)} className="absolute top-4 left-4 glass rounded-full p-2 ring-1 ring-border/60"><ArrowLeft size={18} /></button>
      </div>

      <div className="px-4 relative">
        <div className="flex gap-4">
          <div className="w-28 shrink-0 -mt-8">
            <div className="aspect-[2/3] rounded-2xl overflow-hidden ring-2 ring-border/60">
              <Image src={series.poster_url} alt={series.title} fittingType="fill" className="w-full h-full" />
            </div>
          </div>
          <div className="flex-1 pt-2">
            <h1 className="font-heading text-xl font-extrabold leading-tight">{series.title}</h1>
            {series.alt_title && <p className="text-sm text-muted-foreground">{series.alt_title}</p>}
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="flex items-center gap-1 text-warning font-bold"><Star size={15} className="fill-warning" /> {avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">· {reviews.length} reviews</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {series.genres?.map((g) => <span key={g} className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary">{g}</span>)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-5">
          <Button variant={seen ? "default" : "secondary"} onClick={markSeen} disabled={busy}
            className={`rounded-2xl flex flex-col items-center gap-1 h-auto py-3 ${seen ? "bg-success text-white" : "glass border-border/60"}`}>
            <Eye size={18} /> <span className="text-[11px]">{seen ? "Seen" : "Mark Seen"}</span>
          </Button>
          <Button variant="secondary" onClick={toggleWatchlist} disabled={busy}
            className={`rounded-2xl flex flex-col items-center gap-1 h-auto py-3 glass border-border/60 ${inWatchlist ? "text-primary" : ""}`}>
            <Bookmark size={18} className={inWatchlist ? "fill-primary" : ""} /> <span className="text-[11px]">{inWatchlist ? "Saved" : "Watchlist"}</span>
          </Button>
          <Button variant="secondary" className="rounded-2xl flex flex-col items-center gap-1 h-auto py-3 glass border-border/60">
            <Heart size={18} /> <span className="text-[11px]">Favorite</span>
          </Button>
          <Button variant="secondary" className="rounded-2xl flex flex-col items-center gap-1 h-auto py-3 glass border-border/60">
            <Share2 size={18} /> <span className="text-[11px]">Share</span>
          </Button>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex gap-2"><span className="text-muted-foreground w-24">Country</span><span className="font-medium">{series.country}</span></div>
          <div className="flex gap-2"><span className="text-muted-foreground w-24">Released</span><span className="font-medium">{series.release_year}</span></div>
          <div className="flex gap-2"><span className="text-muted-foreground w-24">Episodes</span><span className="font-medium">{series.episode_count}</span></div>
          <div className="flex gap-2"><span className="text-muted-foreground w-24">Status</span><span className="font-medium">{series.status}</span></div>
          <div className="flex gap-2"><span className="text-muted-foreground w-24">Studio</span><span className="font-medium">{series.production_company}</span></div>
          {series.cast?.length > 0 && <div className="flex gap-2"><span className="text-muted-foreground w-24">Cast</span><span className="font-medium">{series.cast.join(", ")}</span></div>}
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{series.synopsis}</p>

        <h2 className="font-heading text-lg font-bold mt-6 mb-3 flex items-center gap-2"><Users size={18} className="text-primary" /> Reviews</h2>

        {showRate && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-3xl p-4 ring-1 ring-border mb-4">
            <p className="text-sm font-semibold mb-2">Your rating</p>
            <StarRating value={rating} onChange={setRating} size={28} />
            <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Write a review (optional)…"
              className="w-full bg-background rounded-2xl p-3 mt-3 text-sm outline-none ring-1 ring-border focus:ring-primary min-h-[80px]" />
            <label className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} /> Contains spoilers
            </label>
            <div className="flex gap-2 mt-3">
              <Button onClick={submitReview} disabled={busy} className="rounded-full bg-primary text-white flex-1">Post Review</Button>
              <Button variant="secondary" className="rounded-full glass border-border/60" onClick={() => setShowRate(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first to review!</p>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-card rounded-2xl p-4 ring-1 ring-border">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/20 overflow-hidden">
                  {r.user_avatar ? <Image src={r.user_avatar} fittingType="fill" className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-primary font-bold text-sm">{(r.user_name || "?")[0]}</div>}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{r.user_name}</p>
                  <StarRating value={r.rating} size={12} />
                </div>
                {r.user_id === me?.id && <span className="text-[10px] text-muted-foreground">You</span>}
              </div>
              {r.spoiler && <p className="text-[11px] text-warning mt-2">⚠ Spoiler warning</p>}
              {r.text && !r.spoiler && <p className="text-sm mt-2 text-foreground/90 leading-relaxed">{r.text}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <button onClick={() => likeReview(r)} className={`flex items-center gap-1 hover:text-primary ${r.likes?.includes(me?.id) ? "text-primary" : ""}`}>
                  <Heart size={13} className={r.likes?.includes(me?.id) ? "fill-primary" : ""} /> {r.likes?.length || 0}
                </button>
                <button className="flex items-center gap-1 hover:text-primary"><Flag size={13} /> Reply</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}