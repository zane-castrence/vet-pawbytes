const TONES = [
  "bg-[#F06AA6]",
  "bg-[#D9F25C]",
  "bg-[#FFFFFF]",
  "bg-[#8CC8FF]",
  "bg-[#7FD1B0]",
];

export default function ReviewCard({ item }) {
  const tone = TONES[(item.tone || 0) % TONES.length];

  return (
    <article
      className={`font-figtree flex h-[230px] w-full flex-col justify-between rounded-[20px] p-5 text-[#1F2937] ${tone}`}
    >
      <div>
        <p className="text-[13px] font-bold uppercase tracking-wide">Review</p>
        <p className="mt-2 line-clamp-4 text-[15px] font-medium leading-6">
          {item.body}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#1F2937]/15">
          <img
            src={item.image}
            alt={`${item.pet}`}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="leading-tight">
          <p className="text-[15px] font-bold">{item.pet}</p>
          <p className="text-[13px] font-medium text-[#1F2937]/80">
            and his owner {item.owner}
          </p>
        </div>
      </div>
    </article>
  );
}