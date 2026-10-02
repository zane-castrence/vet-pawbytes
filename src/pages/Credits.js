import credits from "../data/credits";

export default function Credits() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Credits</h1>
      <p className="mt-2 text-gray-600">
        PawBytes is built with the help of these open-source resources and
        community components. Thank you to everyone who shared their work.
      </p>

      <ul className="mt-8 space-y-4">
        {credits.map((item) => (
          <li
            key={item.name}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-gray-600">
              by{" "}
              <a
                href={item.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {item.author}
              </a>
              {" · via "}
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {item.source}
              </a>
            </p>
            {item.usedIn && (
              <p className="mt-1 text-xs text-gray-500">Used in: {item.usedIn}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}