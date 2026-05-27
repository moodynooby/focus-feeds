import { useEffect, useRef, useState } from "react";
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

	const sources = [
		...new Set(items.map((item) => item.feedTitle || item.source || "Unknown")),
	].sort();

	const filteredItems = items.filter((item) => {
		if (starredConfig && starredConfig.view === "starred") {
			const itemId = item.guid || item.link;
			if (!starredConfig.starredItems.includes(itemId)) {
				return false;
			}
		}

		const matchesSearch = debouncedSearchQuery
			? (item.title || "")
					.toLowerCase()
					.includes(debouncedSearchQuery.toLowerCase()) ||
				(item.contentSnippet || "")
					.toLowerCase()
					.includes(debouncedSearchQuery.toLowerCase()) ||
				(item.content || "")
					.toLowerCase()
					.includes(debouncedSearchQuery.toLowerCase())
			: true;

		const matchesSource =
			selectedSources.length > 0
				? selectedSources.includes(item.feedTitle || item.source || "Unknown")
				: true;

		return matchesSearch && matchesSource;
	});

	const visibleItems = filteredItems.slice(0, displayLimit);
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
