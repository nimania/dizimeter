export const ratingRows = [
  { slug:"veliaht", titleFa:"ولیعهد", titleTr:"Veliaht", network:"Show TV", total:7.42, ab:5.91, abc1:6.84, deltaTotal:.38, deltaAb:-.12, deltaAbc1:.27 },
  { slug:"kizilcik-serbeti", titleFa:"شربت زغال‌اخته", titleTr:"Kızılcık Şerbeti", network:"Show TV", total:6.98, ab:7.31, abc1:7.64, deltaTotal:-.18, deltaAb:.26, deltaAbc1:.41 },
  { slug:"gunesin-dogdugu-yer", titleFa:"جایی که خورشید طلوع می‌کند", titleTr:"Güneşin Doğduğu Yer", network:"ATV", total:6.37, ab:4.82, abc1:5.73, deltaTotal:.22, deltaAb:.16, deltaAbc1:.31 },
  { slug:"uzak-sehir", titleFa:"شهر دور", titleTr:"Uzak Şehir", network:"Kanal D", total:5.89, ab:4.47, abc1:5.14, deltaTotal:-.09, deltaAb:-.21, deltaAbc1:-.12 },
];
export const series = [
  {...ratingRows[0], monogram:"V", episode:12, airDay:"پنجشنبه‌ها"}, {...ratingRows[1], monogram:"K", episode:41, airDay:"جمعه‌ها"},
  {...ratingRows[2], monogram:"G", episode:1, airDay:"پنجشنبه‌ها"}, {...ratingRows[3], monogram:"U", episode:1, airDay:"دوشنبه‌ها"},
];
export const latestRecaps = [
  {slug:"veliaht",episode:12,readTime:7,title:"اتحادی که با یک راز تازه فرو ریخت",summary:"درحالی‌که تیمور برای حفظ خانواده تصمیم نهایی‌اش را گرفته بود، ورود یک شاهد قدیمی همه معادلات را تغییر داد."},
  {slug:"kizilcik-serbeti",episode:41,readTime:9,title:"خانه‌ای که دیگر برای هیچ‌کس امن نیست",summary:"مهمانی خانوادگی به رویارویی بزرگی تبدیل شد و پیمانی که قرار بود بحران را تمام کند، آغاز اختلافی تازه بود."},
  {slug:"uzak-sehir",episode:1,readTime:6,title:"بازگشت به شهری که همه‌چیز را به یاد دارد",summary:"بازگشت ناخواسته، رازهایی را زنده کرد که دو خانواده سال‌ها برای پنهان‌کردنشان جنگیده بودند."},
];
export const findSeries=(slug:string)=>series.find(item=>item.slug===slug);
