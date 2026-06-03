import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import type { FeedItem, ViewMode } from "@/types";

interface StarredConfig {
	starredItems: string[];
	view: ViewMode;
}

interface UseFeedFiltersReturn {
	searchQuery: string;
	setSearchQuery: (query: string) => void;
	selectedSources: string[];
	setSelectedSources: (sources: string[]) => void;
	sources: string[];
	filteredItems: FeedItem[];
	visibleItems: FeedItem[];
	hasMoreItems: boolean;
	debouncedSearchQuery: string;
	loadMore: () => void;
	clearFilters: () => void;
}

export default function useFeedFilters(
	items: FeedItem[],
	itemsPerBatch: number = 20,
	starredConfig?: StarredConfig,
): UseFeedFiltersReturn {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSources, setSelectedSources] = useState<string[]>([]);
	const [displayLimit, setDisplayLimit] = useState(itemsPerBatch);

	const [debouncedSearchQuery] = useDebounceValue(searchQuery, 300);
	const prevFiltersRef = useRef({ search: "", sources: [] as string[] });

	const sources = useMemo(() => {
		return [
			...new Set(
				items.map((item) => item.feedTitle || item.source || "Unknown"),
			),
		].sort();
	}, [items]);

	const filteredItems = useMemo(() => {
		const searchLower = debouncedSearchQuery.toLowerCase();
		const sourceSet =
			selectedSources.length > 0 ? new Set(selectedSources) : null;
		const starredSet =
			starredConfig?.view === "starred"
				? new Set(starredConfig.starredItems)
				: null;

		return items.filter((item) => {
			if (starredSet) {
				const itemId = item.guid || item.link;
				if (!starredSet.has(itemId)) {
					return false;
				}
			}

			if (sourceSet) {
				if (!sourceSet.has(item.feedTitle || item.source || "Unknown")) {
					return false;
				}
			}

			if (debouncedSearchQuery) {
				const matchesSearch =
					(item.title || "").toLowerCase().includes(searchLower) ||
					(item.contentSnippet || "").toLowerCase().includes(searchLower) ||
					(item.content || "").toLowerCase().includes(searchLower);

				if (!matchesSearch) return false;
			}

			return true;
		});
	}, [items, debouncedSearchQuery, selectedSources, starredConfig]);

	const visibleItems = useMemo(() => {
		return filteredItems.slice(0, displayLimit);
	}, [filteredItems, displayLimit]);

	const hasMoreItems = filteredItems.length > displayLimit;

	useEffect(() => {
		const prev = prevFiltersRef.current;
		if (
			prev.search !== debouncedSearchQuery ||
			prev.sources.join() !== selectedSources.join()
		) {
			setDisplayLimit(itemsPerBatch);
			prevFiltersRef.current = {
				search: debouncedSearchQuery,
				sources: selectedSources,
			};
		}
	}, [debouncedSearchQuery, selectedSources, itemsPerBatch]);

	const loadMore = () => {
		setDisplayLimit((prev) => prev + itemsPerBatch);
	};

	const clearFilters = () => {
		setSearchQuery("");
		setSelectedSources([]);
	};

	return {
		searchQuery,
		setSearchQuery,
		selectedSources,
		setSelectedSources,
		sources,
		filteredItems,
		visibleItems,
		hasMoreItems,
		debouncedSearchQuery,
		loadMore,
		clearFilters,
	};
}
