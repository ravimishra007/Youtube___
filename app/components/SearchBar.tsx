'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  initialQuery?: string;
  className?: string;
}

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'channel' | 'topic';
}

const POPULAR_SUGGESTIONS: SearchSuggestion[] = [
  { id: 'gaming', title: 'Gaming Channels', type: 'topic' },
  { id: 'tech', title: 'Tech Reviews', type: 'topic' },
  { id: 'music', title: 'Music Artists', type: 'topic' },
  { id: 'education', title: 'Educational Content', type: 'topic' },
  { id: 'cooking', title: 'Cooking & Food', type: 'topic' }
];

export default function SearchBar({ initialQuery = '', className = '' }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title);
    router.push(`/search?q=${encodeURIComponent(suggestion.title)}`);
    setShowSuggestions(false);
  };

  return (
    <div ref={searchContainerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search for YouTube channels..."
            className="w-full h-14 pl-14 pr-12 rounded-2xl bg-white shadow-lg focus:shadow-xl border-2 border-transparent focus:border-blue-500 transition-all duration-300 text-lg text-gray-900 placeholder-gray-500 outline-none"
          />
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-14 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <FiX className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <FiSearch className="w-5 h-5" />
          </button>
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-500">Popular Searches</h3>
          </div>
          <div className="py-2">
            {POPULAR_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
              >
                <FiSearch className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{suggestion.title}</span>
                <span className="ml-auto text-xs text-gray-400 capitalize">{suggestion.type}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 