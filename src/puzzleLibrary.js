
const API_URL = 'https://datasets-server.huggingface.co/rows';

const DATASET = 'Lichess/chess-puzzles';
const CONFIG = 'default';
const SPLIT = 'train';

export const PAGE_SIZE = 100;

const pageCache = new Map();

// تحويل بيانات المصدر إلى صيغة موحدة
function normalizePuzzle(item) {
  const row = item.row || item;

  const moves = Array.isArray(row.Moves)
    ? row.Moves
    : String(row.Moves || '').trim().split(/\s+/).filter(Boolean);

  return {
    id: String(row.PuzzleId || ''),
    fen: String(row.FEN || ''),
    moves,

    rating: Number(row.Rating || 0),
    ratingDeviation: Number(row.RatingDeviation || 0),
    popularity: Number(row.Popularity || 0),
    plays: Number(row.NbPlays || 0),

    themes: Array.isArray(row.Themes)
      ? row.Themes
      : String(row.Themes || '').split(/\s+/).filter(Boolean),

    openings: Array.isArray(row.OpeningTags)
      ? row.OpeningTags
      : String(row.OpeningTags || '').split(/\s+/).filter(Boolean),

    gameUrl: row.GameUrl || ''
  };
}

// تحميل صفحة من الموسوعة
export async function loadPuzzlePage(page = 0, options = {}) {
  if (!Number.isSafeInteger(page) || page < 0) {
    throw new Error('رقم الصفحة غير صحيح.');
  }

  if (!options.forceRefresh && pageCache.has(page)) {
    return pageCache.get(page);
  }

  const offset = page * PAGE_SIZE;

  const params = new URLSearchParams({
    dataset: DATASET,
    config: CONFIG,
    split: SPLIT,
    offset: String(offset),
    length: String(PAGE_SIZE)
  });

  const response = await fetch(
    `${API_URL}?${params.toString()}`,
    {
      signal: options.signal,
      headers: {
        Accept: 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `تعذر تحميل الألغاز. رمز الخطأ: ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.rows)) {
    throw new Error('صيغة بيانات الألغاز غير صحيحة.');
  }

  const puzzles = data.rows
    .map(normalizePuzzle)
    .filter(puzzle =>
      puzzle.id &&
      puzzle.fen &&
      puzzle.moves.length >= 2
    );

  const result = {
    page,
    offset,
    puzzles,
    totalRows: data.num_rows_total ?? null,
    hasMore: puzzles.length === PAGE_SIZE
  };

  pageCache.set(page, result);

  return result;
}

// الوصول إلى أي لغز بواسطة رقمه في الموسوعة
export async function loadPuzzleByIndex(index, options = {}) {
  if (!Number.isSafeInteger(index) || index < 0) {
    throw new Error('رقم اللغز غير صحيح.');
  }

  const page = Math.floor(index / PAGE_SIZE);
  const position = index % PAGE_SIZE;

  const result = await loadPuzzlePage(page, options);

  return result.puzzles[position] || null;
}

// مسح الصفحات المحفوظة في الذاكرة
export function clearPuzzleCache() {
  pageCache.clear();
}
