export default function SectionHeading({ bold, light, className = "" }) {
  return (
    <h2
      className={`font-figtree text-[clamp(3rem,7.5vw,6.5rem)] font-extrabold leading-[0.95] tracking-[-0.03em] ${className}`}
    >
      {bold}
      {light && (
        <>
          <br />
          <span className="font-normal">{light}</span>
        </>
      )}
    </h2>
  );
}