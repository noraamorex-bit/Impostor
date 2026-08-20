import type { Category, CategoryId, CategoryMeta, Word, WordSeed } from "@/types";

import food from "./data/food";
import fruitsVeg from "./data/fruits-veg";
import desserts from "./data/desserts";
import drinks from "./data/drinks";
import animals from "./data/animals";
import places from "./data/places";
import countries from "./data/countries";
import cities from "./data/cities";
import nature from "./data/nature";
import weather from "./data/weather";
import sports from "./data/sports";
import school from "./data/school";
import technology from "./data/technology";
import electronics from "./data/electronics";
import transportation from "./data/transportation";
import jobs from "./data/jobs";
import clothing from "./data/clothing";
import household from "./data/household";
import everydayObjects from "./data/everyday-objects";
import kitchen from "./data/kitchen";
import activities from "./data/activities";
import hobbies from "./data/hobbies";
import entertainment from "./data/entertainment";
import moviesTv from "./data/movies-tv";
import games from "./data/games";
import buildings from "./data/buildings";
import festivals from "./data/festivals";
import outdoors from "./data/outdoors";
import music from "./data/music";
import bodyHealth from "./data/body-health";
import space from "./data/space";

interface CategorySource {
  id: CategoryId;
  label: string;
  emoji: string;
  seeds: WordSeed[];
}

/**
 * Ordering matters: when the same word appears in two categories the first
 * occurrence wins, so broader/more obvious categories are listed first.
 */
const SOURCES: CategorySource[] = [
  { id: "food", label: "Food", emoji: "🍔", seeds: food },
  { id: "fruits-veg", label: "Fruit & Veg", emoji: "🍎", seeds: fruitsVeg },
  { id: "desserts", label: "Sweets", emoji: "🍩", seeds: desserts },
  { id: "drinks", label: "Drinks", emoji: "☕️", seeds: drinks },
  { id: "animals", label: "Animals", emoji: "🐾", seeds: animals },
  { id: "places", label: "Places", emoji: "🌍", seeds: places },
  { id: "countries", label: "Countries", emoji: "🗺️", seeds: countries },
  { id: "cities", label: "Cities", emoji: "🏙️", seeds: cities },
  { id: "nature", label: "Nature", emoji: "🌿", seeds: nature },
  { id: "weather", label: "Weather", emoji: "🌦️", seeds: weather },
  { id: "sports", label: "Sports", emoji: "⚽️", seeds: sports },
  { id: "school", label: "School", emoji: "📚", seeds: school },
  { id: "technology", label: "Technology", emoji: "💻", seeds: technology },
  { id: "electronics", label: "Electronics", emoji: "🔌", seeds: electronics },
  { id: "transportation", label: "Travel", emoji: "✈️", seeds: transportation },
  { id: "jobs", label: "Jobs", emoji: "👩‍🔧", seeds: jobs },
  { id: "clothing", label: "Clothing", emoji: "👕", seeds: clothing },
  { id: "household", label: "Household", emoji: "🛋️", seeds: household },
  { id: "everyday-objects", label: "Everyday", emoji: "🔑", seeds: everydayObjects },
  { id: "kitchen", label: "Kitchen", emoji: "🍳", seeds: kitchen },
  { id: "activities", label: "Activities", emoji: "🏃", seeds: activities },
  { id: "hobbies", label: "Hobbies", emoji: "🎨", seeds: hobbies },
  { id: "entertainment", label: "Nights Out", emoji: "🎪", seeds: entertainment },
  { id: "movies-tv", label: "Movies & TV", emoji: "🎬", seeds: moviesTv },
  { id: "games", label: "Games", emoji: "🎲", seeds: games },
  { id: "buildings", label: "Buildings", emoji: "🏛️", seeds: buildings },
  { id: "festivals", label: "Festivals", emoji: "🎉", seeds: festivals },
  { id: "outdoors", label: "Outdoors", emoji: "🌳", seeds: outdoors },
  { id: "music", label: "Music", emoji: "🎵", seeds: music },
  { id: "body-health", label: "Health", emoji: "❤️", seeds: bodyHealth },
  { id: "space", label: "Space", emoji: "🚀", seeds: space },
];

export const normalizeWord = (word: string): string => word.trim().toLowerCase();

function buildCategories(): Category[] {
  const seen = new Set<string>();
  return SOURCES.map(({ id, label, emoji, seeds }) => {
    const words: Word[] = [];
    for (const [word, clue] of seeds) {
      const key = normalizeWord(word);
      if (seen.has(key)) continue;
      seen.add(key);
      words.push({ word, clue, category: id });
    }
    return { id, label, emoji, words };
  }).filter((category) => category.words.length > 0);
}

export const CATEGORIES: Category[] = buildCategories();

export const CATEGORY_META: CategoryMeta[] = CATEGORIES.map(({ id, label, emoji, words }) => ({
  id,
  label,
  emoji,
  count: words.length,
}));

export const ALL_WORDS: Word[] = CATEGORIES.flatMap((category) => category.words);

const WORDS_BY_CATEGORY = new Map<CategoryId, Word[]>(
  CATEGORIES.map((category) => [category.id, category.words]),
);

const WORD_BY_KEY = new Map<string, Word>(
  ALL_WORDS.map((entry) => [normalizeWord(entry.word), entry]),
);

export function getCategory(id: CategoryId): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

/** Look up a word entry (and its clue) by name, case-insensitively. */
export function findWord(word: string): Word | undefined {
  return WORD_BY_KEY.get(normalizeWord(word));
}

/**
 * Words available for the given category selection.
 * An empty (or fully unknown) selection means "all categories".
 */
export function getWordPool(categoryIds: CategoryId[]): Word[] {
  if (!categoryIds.length) return ALL_WORDS;
  const pool = categoryIds.flatMap((id) => WORDS_BY_CATEGORY.get(id) ?? []);
  return pool.length ? pool : ALL_WORDS;
}

export const TOTAL_WORD_COUNT = ALL_WORDS.length;

export { WORD_PAIRS, getPairPool, TOTAL_PAIR_COUNT } from "./pairs";
