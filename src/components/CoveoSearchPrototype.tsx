import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowRight, FileText, Link } from 'lucide-react';

/**
 * CoveoSearchPrototype – mock‑data version
 * ------------------------------------------------------------
 * ▸ Search bar with query‑pill shortcuts.
 * ▸ Inline citations (superscript markers) → tooltip preview.
 * ▸ "Expand All Sources / Collapse All Sources" toggle showing source
 *   cards inline directly after each citation.
 * ▸ Sources limited to 3; inline markers must match.
 * ▸ Follow-up questions section.
 * ▸ Sources used section with category cards.
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
  
  const followUpQuestions = [
    'What is Coveo Machine Learning and how does it improve search results?',
    'How does Coveo handle personalization in enterprise search?',
    'What are Coveo\'s key features for e-commerce search?',
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

  // Process answer text with inline sources
  const renderAnswerWithInlineSources = () => {
    if (!answer) return null;
    
    // Split the answer text by citation markers
    const segments = answer.answer.split(/(【\d+】)/);
    
    return (
      <div className="text-dark-gray">
        {segments.map((segment, index) => {
          // Check if this segment is a citation marker
          const isCitation = /^【\d+】$/.test(segment);
          
          if (isCitation) {
            // Extract the citation ID
            const id = segment.match(/\d+/)?.[0] || '';
            // Find the corresponding source
            const source = answer.sources.find(s => s.id.toString() === id);
            
            return (
              <span key={index}>
                <Citation id={id} sources={answer.sources} />
                {showSources && source && (
                  <div className="my-3 ml-6 animate-fade-in">
                    <SourceCard source={source} />
                  </div>
                )}
              </span>
            );
          } else {
            // Regular text segment
            return <span key={index}>{segment}</span>;
          }
        })}
      </div>
    );
  };

  // Get icon based on the source type
  const getSourceIcon = (type: string) => {
    if (type.includes('PDF') || type.includes('Documentation') || type.includes('Guide')) {
      return <FileText size={16} className="mr-2 text-gray-500" />;
    } else {
      return <Link size={16} className="mr-2 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-soft-gray font-inter text-dark-gray flex flex-col items-center px-4">
      {/* Header */}
      <header className="w-full py-10 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
        <div className="flex justify-center items-center">
          <img 
            src="/lovable-uploads/67178166-b63c-4697-b66d-82745bf182af.png" 
            alt="Coveo Logo" 
            className="h-10"
          />
          <h1 className="text-3xl font-semibold ml-2">AI Search</h1>
        </div>
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

        {/* Answer Panel (+ inline sources) */}
        {answer && (
          <div className="mt-10 animate-fade-in bg-white/90 backdrop-blur-md border border-white/20 shadow-soft rounded-lg p-6 relative space-y-6 text-lg leading-relaxed">
            {/* Expand / Collapse toggle */}
            <button
              onClick={() => setShowSources(!showSources)}
              className="absolute right-6 top-6 text-accent-blue text-sm font-medium flex items-center gap-1 hover:underline"
            >
              {showSources ? '▲ Collapse All Sources' : '▼ Expand All Sources'}
            </button>

            {/* Answer text with inline citations and sources */}
            <div className="text-dark-gray pt-6">
              {renderAnswerWithInlineSources()}
            </div>
            
            {/* Follow-up section - Made smaller */}
            <div className="mt-8 border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-brand-primary mb-2">
                <ArrowRight size={16} />
                <h2 className="text-base font-semibold">Follow-up</h2>
              </div>
              
              <div className="space-y-2">
                {followUpQuestions.slice(0, 3).map((question, index) => (
                  <button 
                    key={index} 
                    onClick={() => handleSearch(question)}
                    className="w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between"
                  >
                    <span className="text-brand-primary text-sm">{question}</span>
                    <ArrowRight className="text-brand-primary" size={14} />
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sources Used section - Now showing actual sources from the answer */}
            <div className="mt-10 border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 text-brand-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 14.5l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h2 className="text-lg font-semibold">Sources Used</h2>
                </div>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 ml-2">
                  {answer.sources.length} Sources
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {answer.sources.map((source, index) => (
                  <div 
                    key={index} 
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-brand-primary mb-2 flex items-center">
                      <span className="bg-brand-primary text-white rounded-full w-6 h-6 inline-flex items-center justify-center text-xs mr-2">
                        {source.id}
                      </span>
                      {source.label}
                    </h3>
                    <div className="flex items-center">
                      {getSourceIcon(source.type)}
                      <span className="text-sm text-gray-500">{source.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Ask anything section */}
            <div className="mt-10 border-t border-gray-200 pt-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything about Coveo..."
                  className="w-full bg-white border border-gray-200 rounded-full py-3 px-5 focus:outline-none focus:ring-2 focus:ring-accent-blue"
                />
                <ArrowRight className="absolute right-4 top-1/2 transform -translate-y-1/2 text-brand-primary" size={18} />
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                AI responses may be inaccurate. For key decisions, please 
                <a href="#" className="text-accent-blue underline mx-1">contact Coveo Support.</a>
                Learn more about 
                <a href="#" className="text-accent-blue underline ml-1">Coveo's privacy policy.</a>
              </p>
            </div>
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
