import Link from "next/link";
import { ArrowLeft, CalendarDays, Clapperboard, Flame, LineChart, Play, Search, Sparkles } from "lucide-react";
import { latestRecaps, ratingRows, series } from "@/lib/demo-data";

function Rating({ value, delta }: { value: number; delta: number }) {
  return <div className="rating"><strong>{value.toFixed(2)}</strong><span className={delta >= 0 ? "up" : "down"}>{delta >= 0 ? "+" : ""}{delta.toFixed(2)}</span></div>;
}

export default function Home() {
  return <main dir="rtl">
    <header className="site-header"><div className="shell header-inner">
      <Link href="/" className="brand" aria-label="دیزی‌متر"><b>D</b><span><strong>DiziMeter</strong><small>دیزی‌متر</small></span></Link>
      <nav><Link href="/ratings">ریتینگ‌ها</Link><Link href="/recaps">ری‌کپ‌ها</Link><a href="#series">سریال‌ها</a></nav>
      <form className="search" action="/search"><Search size={17}/><input name="q" aria-label="جست‌وجوی سریال" placeholder="نام سریال یا بازیگر…"/></form>
    </div></header>

    <section className="hero shell">
      <img src="/images/dizimeter-hero.png" alt="درامی خیالی در استانبول" fetchPriority="high"/>
      <div className="hero-shade"/>
      <div className="hero-copy"><span className="eyebrow"><Sparkles size={14}/> پرونده ویژه</span><p className="kicker">امشب در تلویزیون ترکیه</p><h1>قبل از قسمت تازه، قصه را به یاد بیاور.</h1><p>ری‌کپ قسمت قبل، ریتینگ‌های سه گروه و مهم‌ترین تغییرات داستانی؛ یک‌جا و به فارسی.</p><div className="hero-actions"><Link href="/recaps" className="primary"><Play size={16} fill="currentColor"/> تازه‌ترین ری‌کپ</Link><Link href="/ratings">جدول ریتینگ امروز <ArrowLeft size={16}/></Link></div></div>
      <aside className="hero-stat"><span>بیشترین رشد هفته</span><strong>+۰٫۷۸</strong><small>در گروه ABC1</small></aside>
    </section>

    <section className="shell section"><div className="section-head"><div><i><LineChart size={18}/></i><span><small>نبض تلویزیون ترکیه</small><h2>جدول ریتینگ</h2></span></div><div className="head-meta"><em>داده نمایشی نسخه اولیه</em><Link href="/ratings">مشاهده کامل <ArrowLeft size={15}/></Link></div></div>
      <div className="table-wrap"><table><thead><tr><th>رتبه</th><th>برنامه / سریال</th><th>شبکه</th><th>Total</th><th>AB</th><th>ABC1</th></tr></thead><tbody>{ratingRows.map((row,index)=><tr key={row.slug}><td><b className="rank">{index+1}</b></td><td><Link className="program" href={`/dizi/${row.slug}`}><strong>{row.titleFa}</strong><span>{row.titleTr}</span></Link></td><td><span className="network">{row.network}</span></td><td><Rating value={row.total} delta={row.deltaTotal}/></td><td><Rating value={row.ab} delta={row.deltaAb}/></td><td><Rating value={row.abc1} delta={row.deltaAbc1}/></td></tr>)}</tbody></table></div>
    </section>

    <section id="series" className="shell section"><div className="section-head"><div><i className="red"><Flame size={18}/></i><span><small>محبوب این هفته</small><h2>سریال‌های داغ</h2></span></div></div><div className="series-grid">{series.map((item,index)=><Link href={`/dizi/${item.slug}`} className={`series-card tone-${index+1}`} key={item.slug}><div className="series-art"><strong>{item.monogram}</strong><small>۰{index+1}</small></div><div className="series-info"><div><span>{item.network}</span><span>قسمت {item.episode}</span></div><h3>{item.titleFa}</h3><p>{item.titleTr}</p><footer><span><CalendarDays size={14}/>{item.airDay}</span><strong>{item.total.toFixed(2)}</strong></footer></div></Link>)}</div></section>

    <section className="recap-band"><div className="shell section"><div className="section-head light"><div><i className="gold"><Clapperboard size={18}/></i><span><small>قصه تا اینجا</small><h2>تازه‌ترین ری‌کپ‌ها</h2></span></div><Link href="/recaps">همه ری‌کپ‌ها <ArrowLeft size={15}/></Link></div><div className="recap-grid">{latestRecaps.map((recap,index)=><article className="recap-card" key={recap.slug}><b>{String(index+1).padStart(2,"0")}</b><div><span>قسمت {recap.episode} · {recap.readTime} دقیقه</span><h3>{recap.title}</h3><p>{recap.summary}</p><Link href={`/dizi/${recap.slug}`}>ادامه ری‌کپ <ArrowLeft size={15}/></Link></div></article>)}</div></div></section>
    <footer className="site-footer"><div className="shell"><div className="brand"><b>D</b><span><strong>DiziMeter</strong><small>قصه، عدد، تحلیل</small></span></div><p>داده‌های ریتینگ با ذکر منبع منتشر می‌شوند. این نسخه، پیش‌نمایش محصول است.</p><span>© ۲۰۲۶</span></div></footer>
  </main>;
}
