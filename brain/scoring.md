<!-- Scoring formula used by n8n/Claude when processing a content_inbox row into a content_ideas row. This app never computes or calls this formula itself — it only displays the resulting score/ease and score_breakdown, and lets Ben edit the underlying fields (which does not recompute score). -->

# Scoring formula

Score is a weighted sum of four components, each rated 1-5 except ease
(computed separately, see below), scaled to a 0-100 result.

| Component     | Weight | How it's rated |
|----------------|--------|----------------|
| Hook strength  | 40%    | Claude rates 1-5 against `brain/hooks.md` |
| Demand         | 30%    | Claude rates 1-5 from `brain/channel.md` keyword/demand data |
| Pillar fit     | 20%    | 5 = clean fit to Pillar A or B, 3 = fits a title system but not a pillar, 1 = neither |
| Ease           | 10%    | The computed ease score (see below), 1-5 |

`score = round(((hook/5)*0.40 + (demand/5)*0.30 + (pillar_fit/5)*0.20 + (ease/5)*0.10) * 100)`

Store the component ratings and any notes in `content_ideas.score_breakdown`
(jsonb) alongside the final `score`.

# Ease formula

Start at 5. Subtract 1 for each of the following that applies, floor at 1:

- A second location (more than one entry in `requirements.locations`)
- Any person besides Ben (any entry in `requirements.people`)
- A timing constraint (`requirements.timing` is set)
- A prop or scene requiring arrangement (any entry in `requirements.props_or_scenes`)
- Multi-day filming (`requirements.multi_day` is true)

`ease = max(1, 5 - count_of_applicable_factors_above)`
