// solid colored cards like the Dr. Friend article cards; text stays dark for contrast
const TONES = [
  "bg-[#F06AA6]", // pink
  "bg-[#D9F25C]", // lime
  "bg-[#FFFFFF]", // white
  "bg-[#8CC8FF]", // sky
  "bg-[#7FD1B0]", // mint
];

export default function ReviewCard({ item }) {
  const tone = TONES[(item.tone || 0) % TONES.length];
  return (
    <article className={`font-figtree flex h-[230px] w-full flex-col justify-between rounded-[20px] p-5 text-[#1F2937] ${tone}`}>
      <div>
        <p className="text-[13px] font-bold uppercase tracking-wide">Review</p>
        <p className="mt-2 line-clamp-4 text-[15px] font-medium leading-6">{item.body}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* photo placeholder */}
        <div className="h-10 w-10 shrink-0 rounded-full bg-[#1F2937]/15" />
        <div className="leading-tight">
          <p className="text-[15px] font-bold">{item.pet}</p>
          <p className="text-[13px] font-medium text-[#1F2937]/80">and his owner {item.owner}</p>
        </div>
      </div>
    </article>
  );
}