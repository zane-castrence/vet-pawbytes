export default function ReviewCard({ item }) {
  return (
    <article className="font-figtree flex h-[230px] w-full flex-col justify-between rounded-[20px] bg-white p-5 text-[#1F2937]">
      <div>
        <p className="text-[13px] font-semibold text-[#047857]">Review</p>
        <p className="mt-2 line-clamp-4 text-[15px] leading-6">{item.body}</p>
      </div>
      <div className="flex items-center gap-3">
        {/* photo placeholder */}
        <div className="h-10 w-10 shrink-0 rounded-full bg-[#E5E7EB]" />
        <div className="leading-tight">
          <p className="text-[15px] font-semibold">{item.pet}</p>
          <p className="text-[13px] text-[#4B5563]">and his owner {item.owner}</p>
        </div>
      </div>
    </article>
  );
}