# Plan 002 — Like button heart pop on save

**Commit:** c879eb4
**File:** `src/components/layout/player-bar.tsx` (`LikeButton`, lines ~56-95)

## Problem
Heart fills instantly on save; no feedback confirming the action. State change is invisible beyond color.

## Fix
Add a brief scale pop on the heart icon when transitioning to liked. Use CSS animation triggered by the liked state, gated for reduced motion.

In `LikeButton`, wrap the Heart:
```tsx
<Heart className={cn("h-[18px] w-[18px] motion-safe:animate-[sunao-pop_200ms_var(--ease-out)]", isLiked && "fill-current")} />
```
Wait — retrigger on each like. Simpler: conditionally apply a class keyed to isLiked and use a key to retrigger. Use `key={isLiked ? "liked" : "unliked"}` on Heart to restart animation on toggle, or use transition.

Simplest robust approach: CSS transition on transform with a one-shot via state. Use:
```tsx
const [pop, setPop] = useState(false);
useEffect(() => { if (isLiked) { setPop(true); const t = setTimeout(() => setPop(false), 200); return () => clearTimeout(t); } }, [isLiked]);
```
Then `<Heart className={cn("h-[18px] w-[18px] transition-transform", pop && "scale-125", isLiked && "fill-current")} />`.

Add keyframes `sunao-pop` optional; transition approach avoids keyframe complexity. Use transition-transform duration-200.

## Verification
- Typecheck + lint.
- Like/unlike rapidly; pop should not stick. Reduced motion: transition still runs but no movement? Global rule scopes transform out under reduced motion → only color remains. Acceptable.