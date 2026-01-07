# Fuzzy Search Without an Index

---

date: 31/12/2025
topics: javascript, fuzzy_search

---

## The "Fat Finger" Problem

Imagine you’re typing **“animation”** into a search bar. Your thumb slips, and you end up with **“animatoin”**.

In a world of exact matching, the result is a cold, empty screen. The system acts like it has no idea what you want, even though a human could spot the intent from a mile away.

Fixing a typo is easy for a user, but preventing the frustration in the first place is where **fuzzy search** shines. Our goal is simple:

- Accept "close enough" inputs.
- Return the right result instantly.
- Keep the logic lightweight enough to run in a browser.

## Why "Distance" is Expensive

When we talk about string similarity, the industry standard is often **Levenshtein Distance**. It measures how many edits (insertions, deletions, or substitutions) are needed to turn Word A into Word B.

While accurate, it has a heavy cost. The complexity is roughly $O(nmk)$, where you’re comparing a query against thousands of possible results.

For a "search-as-you-type" experience, this can make your UI feel sluggish or "janky." We need a shortcut that feels just as smart but runs much faster.

## The Secret: Searching in a Straight Line

What if we don't try to calculate every possible edit? Instead, we can perform a **single linear scan** of the target string reducing the complexity to $O(nm)$.

During this one pass, we look for three key signals:

1. **Ordered Matches:** Do the characters appear in the right sequence?
2. **Proximity:** How close are the matched characters to each other?
3. **Position:** Does the match start at the beginning of the word?

Instead of asking "How many edits does this need?", we ask:

> "How naturally does the query sit inside this word?"

## From Matching to Scoring

### Method 1: The Weighted Bucket

A basic approach is to give points for different "achievements." You might assign a high value to matching a character and a smaller bonus if that character is at the start of the string.

$$
score = 100 \cdot score_{match} + 10 \cdot score_{distance} + score_{start}
$$

The problem? If the "match count" carries too much weight, you get "ghost matches."

For example, the query **"animation"** might match a string like:
`a---n---i---m---a---t---i---o---n`

Technically, all the letters are there in order, but the massive gaps mean it’s definitely not what the user wanted.

---

### Method 2: The "Gap Penalty" Strategy

To fix this, we need to punish the gaps. Think of it like a rubber band: the further you stretch the characters apart, the more tension (or penalty) you create.

We can calculate the score by looking at the **inverse of the gap size**. If the next character in your query appears immediately after the previous one, the gap is small and the score stays high.

$$
S(Q, T)=
\sum_{i \in \mathcal{M}}
\frac{1}{\mathrm{gap}_{i}}
$$

- **Tight matches** (like "anim") get a huge score.
- **Sparse matches** (like "a...n...i") see their score decay rapidly.
- **Automatic Scaling:** The maximum possible score is simply the length of your query.

## Implementing the Logic

Here is how you can implement this "Gap Penalty" logic in TypeScript. It’s light, fast, and requires zero external dependencies. (Here we also add penalty for the first matched character if it’s not the first character in the query.)

```ts
function fuzzySearchStrings(
  data: string[],
  query: string,
  threshold: number,
): string[] {
  const lowercaseQuery = query.toLowerCase();
  const queryLen = lowercaseQuery.length;

  const results: Array<{ index: number; score: number }> = [];

  for (let idx = 0; idx < data.length; idx++) {
    const target = data[idx].toLowerCase();
    const targetLen = target.length;

    if (targetLen < queryLen) continue;

    let score = 0;
    let j = 0;
    let gapSize = 1;

    for (let i = 0; i < targetLen && j < queryLen; i++) {
      if (target[i] === lowercaseQuery[j]) {
        score += 1 / gapSize;
        j++;
        gapSize = 1;
      } else {
        gapSize++;
      }
    }

    // Minimum relevance threshold
    if (score < threshold * queryLen) continue;

    results.push({ index: idx, score });
  }

  return results.sort((a, b) => b.score - a.score).map((r) => data[r.index]);
}
```

## Dive Deeper: Beyond the Single Scan

The linear scan is perfect for lists of titles or usernames. However, if you are searching through the entire text of War and Peace, you'll need bigger guns:

- **Inverted Indexes**: Think of the index at the back of a textbook. Databases like PostgreSQL or Elasticsearch use these to map every word to its location, making searches near-instant.
- **Aho-Corasick Algorithm**: This uses a specialized tree structure (a Trie) to find multiple different keywords in a single document in one pass. It's like looking for 10 different people in a crowd simultaneously.
- **N-Grams**: By breaking words into small chunks (e.g., "fuzzy" becomes "fu", "uz", "zz"), you can compare how many chunks overlap. This is incredibly resilient to major typos.

## References

- [farzher/fuzzysort](https://github.com/farzher/fuzzysort)
