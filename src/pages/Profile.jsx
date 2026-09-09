import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, Eye, Bookmark, FileText, Users, Heart, Settings, LogOut } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";

const TABS = [
  { id: "activity", label: "Activity", icon: Eye },
  { id: "reviews", label: "Reviews", icon: FileText },
  { id: "lists", label: "Lists", icon: Bookmark },
  { id: "favorites", label: "Favorites", icon: Heart },
];

export default function Profile() {
  const [me, setMe] = useState(null);
  const [seen, setSeen] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [customLists, setCustomLists] = useState([]);
  const [tab, setTab] = useState("activity");
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");

  const load = async () => {
    const u = await base44.auth.me();
    setMe(u);
    setBio(u.bio || "");
    setDisplayName(u.display_name || "");
    const [s, w, r, cl] = await Promise.all([
      base44.entities.SeenEntry.filter({ user_id: u.id }),
      base44.entities.WatchlistItem.filter({ user_id: u.id }),
      base44.entities.Review.filter({ user_id: u.id }),
      base44.entities.CustomList.filter({ user_id: u.id }),
    ]);
    setSeen(s); setWatchlist(w); setReviews(r); setCustomLists(cl);
  };

  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    await base44.auth.updateMe({ bio, display_name: displayName });
    setEditing(false);
    load();
  };

  const logout = async () => { await base44.auth.logout(); };

  if (!me) return <div className="flex items-center justify-center h-[60vh]"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  const avgRating = reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : "—";

  return (
    <div className="pb-24">
      <div className="relative h-40">
        <Image src={me.banner_url || `https://picsum.photos/seed/${me.id}-banner/1200/400`} alt="banner" fittingType="fill" className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute top-3 right-3 flex gap-2">
          <button onClick={() => setEditing(!editing)} className="glass rounded-full p-2 ring-1 ring-border/60"><Settings size={16} /></button>
          <button onClick={logout} className="glass rounded-full p-2 ring-1 ring-border/60"><LogOut size={16} /></button>
        </div>
      </div>

      <div className="px-4 -mt-12 relative">
        <div className="w-24 h-24 rounded-full ring-4 ring-background overflow-hidden bg-card">
          {me.avatar_url ? <Image src={me.avatar_url} fittingType="fill" className="w-full h-full" /> : <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-primary">{(me.display_name || me.full_name || "U")[0]}</div>}
        </div>
        <h1 className="font-heading text-xl font-bold mt-3">{me.display_name || me.full_name || "BL Fan"}</h1>
        <p className="text-sm text-muted-foreground">{me.email}</p>
        {me.country && <p className="text-xs text-muted-foreground mt-0.5">📍 {me.country}</p>}

        {editing ? (
          <div className="mt-4 space-y-2">
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" className="w-full bg-card rounded-2xl px-4 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary" />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell fans about yourself…" className="w-full bg-card rounded-2xl px-4 py-2.5 text-sm outline-none ring-1 ring-border focus:ring-primary min-h-[70px]" />
            <Button onClick={saveProfile} className="rounded-full bg-primary text-white">Save</Button>
          </div>
        ) : (
          me.bio && <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{me.bio}</p>
        )}

        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: "Seen", value: seen.length, icon: Eye },
            { label: "Watchlist", value: watchlist.length, icon: Bookmark },
            { label: "Reviews", value: reviews.length, icon: FileText },
            { label: "Avg Rating", value: avgRating, icon: Star },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-3 text-center ring-1 ring-border">
              <s.icon size={16} className="mx-auto text-primary mb-1" />
              <p className="font-heading font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 mt-5 border-b border-border">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4">
          {tab === "activity" && (
            <div className="space-y-2">
              {seen.slice(0, 8).map((s) => (
                <Link key={s.id} to={`/series/${s.series_id}`} className="flex items-center gap-3 bg-card rounded-2xl p-2.5 ring-1 ring-border">
                  <div className="w-10 h-14 rounded-lg overflow-hidden shrink-0"><Image src={s.poster_url} fittingType="fill" className="w-full h-full" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold">{s.series_title}</p><p className="text-xs text-muted-foreground">Marked as seen</p></div>
                  <StarRating value={s.rating} size={12} />
                </Link>
              ))}
              {seen.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No activity yet.</p>}
            </div>
          )}
          {tab === "reviews" && (
            <div className="space-y-3">
              {reviews.map((r) => (
                <Link key={r.id} to={`/series/${r.series_id}`} className="block bg-card rounded-2xl p-4 ring-1 ring-border">
                  <div className="flex items-center justify-between"><p className="text-sm font-semibold">{r.series_title}</p><StarRating value={r.rating} size={12} /></div>
                  {r.text && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.text}</p>}
                </Link>
              ))}
              {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No reviews written yet.</p>}
            </div>
          )}
          {tab === "lists" && (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Eye size={14} className="text-success" /> Seen ({seen.length})</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {seen.map((s) => <Link key={s.id} to={`/series/${s.series_id}`} className="w-16 shrink-0"><div className="aspect-[2/3] rounded-lg overflow-hidden"><Image src={s.poster_url} fittingType="fill" className="w-full h-full" /></div></Link>)}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Bookmark size={14} className="text-primary" /> Watchlist ({watchlist.length})</p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {watchlist.map((s) => <Link key={s.id} to={`/series/${s.series_id}`} className="w-16 shrink-0"><div className="aspect-[2/3] rounded-lg overflow-hidden"><Image src={s.poster_url} fittingType="fill" className="w-full h-full" /></div></Link>)}
                </div>
              </div>
              {customLists.map((cl) => (
                <div key={cl.id}>
                  <p className="text-sm font-semibold mb-2">{cl.name} <span className="text-xs text-muted-foreground">· {cl.visibility}</span></p>
                  <p className="text-xs text-muted-foreground">{cl.series_ids?.length || 0} series</p>
                </div>
              ))}
            </div>
          )}
          {tab === "favorites" && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Heart size={14} className="text-primary" /> Favorite Ships</p>
                <div className="flex flex-wrap gap-2">
                  {(me.favorite_ships || []).map((s) => <span key={s} className="bg-primary/15 text-primary text-xs px-3 py-1.5 rounded-full">{s}</span>)}
                  {!(me.favorite_ships || []).length && <p className="text-xs text-muted-foreground">None selected</p>}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5"><Star size={14} className="text-warning" /> Favorite Series</p>
                <div className="flex flex-wrap gap-2">
                  {(me.favorite_series || []).map((s) => <span key={s} className="bg-secondary/15 text-secondary text-xs px-3 py-1.5 rounded-full">{s}</span>)}
                  {!(me.favorite_series || []).length && <p className="text-xs text-muted-foreground">None selected</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}