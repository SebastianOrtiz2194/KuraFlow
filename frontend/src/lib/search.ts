import { getLanguages, getLevels, getModules, getLessons, getFlashcardDecks } from './api';

export interface SearchResultItem {
  id: string;
  type: 'lesson' | 'flashcard' | 'module';
  title: string;
  description: string;
  category: string;
  badgeText?: string;
  href: string;
  meta?: {
    estimatedMinutes?: number;
    xpReward?: number;
    cardCount?: number;
    levelCode?: string;
  };
}

let cachedSearchItems: SearchResultItem[] | null = null;
let isIndexing = false;

export async function fetchSearchIndex(): Promise<SearchResultItem[]> {
  if (cachedSearchItems && cachedSearchItems.length > 0) {
    return cachedSearchItems;
  }

  if (isIndexing) {
    // Wait a bit if indexing is in progress
    await new Promise(resolve => setTimeout(resolve, 300));
    return cachedSearchItems || [];
  }

  isIndexing = true;
  const items: SearchResultItem[] = [];

  try {
    const languages = await getLanguages().catch(() => []);
    
    for (const lang of languages) {
      const levels = await getLevels(lang.id).catch(() => []);
      for (const lvl of levels) {
        const modules = await getModules(lvl.id).catch(() => []);
        for (const mod of modules) {
          // Add module as search item
          items.push({
            id: `mod-${mod.id}`,
            type: 'module',
            title: mod.title,
            description: mod.description || `${mod.type.replace('_', ' ')} module in ${lvl.name || lvl.code}`,
            category: lvl.code,
            badgeText: mod.type.replace('_', ' '),
            href: `/lessons`,
            meta: {
              levelCode: lvl.code,
            },
          });

          // Fetch lessons in parallel
          const lessonsPromise = getLessons(mod.id).catch(() => []);
          const decksPromise = getFlashcardDecks(mod.id).catch(() => []);

          const [lessons, decks] = await Promise.all([lessonsPromise, decksPromise]);

          for (const lsn of lessons) {
            items.push({
              id: lsn.id,
              type: 'lesson',
              title: lsn.title,
              description: lsn.description || `Learn ${lsn.title}`,
              category: `${lvl.code} • ${mod.title}`,
              badgeText: `${lsn.estimatedMinutes || 10} min`,
              href: `/lesson/${lsn.id}`,
              meta: {
                estimatedMinutes: lsn.estimatedMinutes,
                xpReward: lsn.xpReward,
                levelCode: lvl.code,
              },
            });
          }

          for (const dck of decks) {
            items.push({
              id: dck.id,
              type: 'flashcard',
              title: dck.title,
              description: dck.description || `Spaced repetition flashcard deck for ${mod.title}`,
              category: `${lvl.code} • ${mod.title}`,
              badgeText: `${dck.cardCount || 10} cards`,
              href: `/flashcards`,
              meta: {
                cardCount: dck.cardCount,
                levelCode: lvl.code,
              },
            });
          }
        }
      }
    }

    if (items.length > 0) {
      cachedSearchItems = items;
    }
  } catch (error) {
    console.error('Error building search index:', error);
  } finally {
    isIndexing = false;
  }

  // Fallback defaults if API returns empty
  if (items.length === 0) {
    return [
      {
        id: 'lsn-self-intro',
        type: 'lesson',
        title: 'Self-Introduction (Jikoshoukai)',
        description: 'Learn to introduce yourself in Japanese using basic copula and particles.',
        category: 'N5 • Grammar',
        badgeText: '12 min',
        href: '/lesson/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        meta: { estimatedMinutes: 12, xpReward: 15, levelCode: 'N5' },
      },
      {
        id: 'lsn-questions',
        type: 'lesson',
        title: 'Questions with Ka (か)',
        description: 'Form basic yes/no questions by adding the particle か.',
        category: 'N5 • Grammar',
        badgeText: '10 min',
        href: '/lessons',
        meta: { estimatedMinutes: 10, xpReward: 10, levelCode: 'N5' },
      },
      {
        id: 'lsn-neg-sentences',
        type: 'lesson',
        title: 'Negative Sentences',
        description: 'Learn to make negative sentences with don\'t and doesn\'t.',
        category: 'A1 • Grammar',
        badgeText: '10 min',
        href: '/lessons',
        meta: { estimatedMinutes: 10, xpReward: 10, levelCode: 'A1' },
      },
      {
        id: 'deck-essentials',
        type: 'flashcard',
        title: 'Everyday Essentials Deck',
        description: 'Essential vocabulary and daily expressions flashcard deck.',
        category: 'N5 • Vocabulary',
        badgeText: '20 cards',
        href: '/flashcards',
        meta: { cardCount: 20, levelCode: 'N5' },
      },
      {
        id: 'deck-greetings',
        type: 'flashcard',
        title: 'Greetings & Introductions Deck',
        description: 'Master conversational greetings and basic polite phrases.',
        category: 'A1 • Vocabulary',
        badgeText: '15 cards',
        href: '/flashcards',
        meta: { cardCount: 15, levelCode: 'A1' },
      },
    ];
  }

  return items;
}

export function searchCatalog(
  items: SearchResultItem[],
  query: string,
  filterType: 'all' | 'lessons' | 'flashcards' = 'all'
): SearchResultItem[] {
  if (!query.trim()) return [];

  const cleanQuery = query.toLowerCase().trim();
  const queryWords = cleanQuery.split(/\s+/);

  return items.filter((item) => {
    if (filterType === 'lessons' && item.type !== 'lesson') return false;
    if (filterType === 'flashcards' && item.type !== 'flashcard') return false;

    const searchableText = `${item.title} ${item.description} ${item.category} ${item.badgeText || ''}`.toLowerCase();
    return queryWords.every((word) => searchableText.includes(word));
  });
}
