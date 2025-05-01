
import { useState } from 'react';

/**
 * CoveoSearchPrototype – mock‑data version
 * ------------------------------------------------------------
 * ▸ Search bar with query‑pill shortcuts.
 * ▸ Inline citations (superscript markers) → tooltip preview.
 * ▸ "Expand All Sources / Collapse All Sources" toggle showing full
 *   source cards in‑line (vertical accent bar, inner shadow, metadata).
 * ▸ Sources limited to 3; inline markers must match.
 */

interface Source {
  id: number;
  label: string;
  url: string;
  excerpt: string;
  date?: string;
  type: string;
}

interface AnswerData {
  answer: string;
  sources: Source[];
}

export default function CoveoSearchPrototype() {
  const presetQueries = [
    'How does Coveo ML relevance ranking work?',
    'What data sources can Coveo index out-of-the-box?',
    'Steps to integrate Coveo with Salesforce Service Cloud',
  ];

  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<AnswerData | null>(null);
  const [showSources, setShowSources] = useState(false);

  /**
   * Fetch mock JSON in /src/mock-data based on slugified query.
   * Example: "How does Coveo ML relevance ranking work?" →
   *           relevance-ranking.json
   */
  const handleSearch = async (q: string) => {
    if (!q) return;
    setQuery(q);
    setShowSources(false);

    const slug = q.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      let data;
      if (slug.includes('relevance-ranking')) {
        data = await import('../mock-data/relevance-ranking.json');
      } else if (slug.includes('data-sources')) {
        data = await import('../mock-data/data-sources.json');
      } else if (slug.includes('salesforce')) {
        data = await import('../mock-data/salesforce-integration.json');
      } else {
        console.error('No matching mock file for', slug);
        return;
      }
      setAnswer(data);
    } catch (err) {
      console.error('Error loading mock file for', slug, err);
      setAnswer(null);
    }
  };

  return (
    <div className="min-h-screen bg-soft-gray font-inter text-dark-gray flex flex-col items-center px-4">
      {/* Header */}
      <header className="w-full py-10 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <h1 className="text-3xl font-semibold text-center">Coveo&nbsp;AI Search</h1>
      </header>

      {/* Main container */}
      <main className="w-full max-w-[1400px] mt-8">
        {/* Search Bar */}
        <div className="relative animate-slide-up">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about Coveo…"
            className="w-full bg-white/90 backdrop-blur-md border border-white/20 rounded-lg p-4 shadow-soft focus:outline-none focus:ring-2 focus:ring-accent-blue text-lg"
          />
          <button
            onClick={() => handleSearch(query)}
            className="absolute right-2 top-2 bg-[#0076CE] hover:bg-[#005DA6] text-white px-4 py-2 rounded-md transition-colors"
          >
            Search
          </button>
        </div>

        {/* Query Pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          {presetQueries.map((pq) => (
            <button
              key={pq}
              onClick={() => handleSearch(pq)}
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 transition-colors"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Answer Panel (+ sources) */}
        {answer && (
          <div className="mt-10 animate-fade-in bg-white/90 backdrop-blur-md border border-white/20 shadow-soft rounded-lg p-6 relative space-y-6 text-lg leading-relaxed">
            {/* Expand / Collapse toggle */}
            <button
              onClick={() => setShowSources(!showSources)}
              className="absolute right-6 top-6 text-accent-blue text-sm font-medium flex items-center gap-1 hover:underline"
            >
              {showSources ? '▲ Collapse All Sources' : '▼ Expand All Sources'}
            </button>

            {/* Answer text with inline citations */}
            <p className="text-dark-gray pt-6">
              {answer.answer.split(/(【\d+】)/).map((chunk, i) =>
                /^【\d+】$/.test(chunk) ? (
                  <Citation key={i} id={chunk.match(/\d+/)?.[0] || ''} sources={answer.sources} />
                ) : (
                  chunk
                )
              )}
            </p>

            {/* Source Cards (when expanded) */}
            {showSources && (
              <div className="space-y-6">
                {answer.sources.map((s) => (
                  <SourceCard key={s.id} source={s} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ✦ Inline citation superscript + on‑hover tooltip preview */
function Citation({ id, sources }: { id: string; sources: Source[] }) {
  const src = sources.find((s) => s.id.toString() === id.toString());
  if (!src) return <>{`【${id}】`}</>;

  return (
    <sup className="relative text-accent-blue hover:cursor-pointer group select-none">
      {`【${id}】`}
      {/* Tooltip */}
      <span className="opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition duration-300 absolute z-10 ml-1 mt-[-6px] bg-white border border-gray-200 shadow-medium rounded-lg p-3 text-xs w-64 text-dark-gray">
        <strong className="block mb-1">{src.label}</strong>
        {src.excerpt}
        <br />
        <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-[#0076CE] hover:underline text-[11px] inline-block mt-1">
          View full source ↗
        </a>
      </span>
    </sup>
  );
}

/* ✦ Full source card */
function SourceCard({ source }: { source: Source }) {
  return (
    <div className="flex gap-4 bg-soft-gray p-4 rounded-lg border border-[#E6F0FF] shadow-inner animate-fade-in">
      {/* Vertical accent */}
      <span className="w-1 rounded bg-accent-blue"></span>

      <div className="text-sm leading-snug text-dark-gray">
        <div className="font-semibold mb-1 flex items-center gap-1">
          <span>{source.type}</span>
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#0076CE] hover:underline">
            {`Source ${source.id}: ${source.label}`}
          </a>
        </div>
        {source.date && (
          <div className="text-[11px] text-medium-gray mb-2">{source.date}</div>
        )}
        <p>
          {source.excerpt}{' '}
          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#0076CE] hover:underline">
            View full document ↗
          </a>
        </p>
      </div>
    </div>
  );
}
