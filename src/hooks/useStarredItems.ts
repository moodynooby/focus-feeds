import { useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { toggleListItem } from "@/components/utils";
import type { ViewMode } from "@/types";

interface UseStarredItemsReturn {
	starredItems: string[];
	toggleStar: (id: string) => void;
	view: ViewMode;
	setView: (view: ViewMode) => void;
}

export default function useStarredItems(): UseStarredItemsReturn {
	const [starredItems, setStarredItems] = useLocalStorage<string[]>(
		"focusFeedsStarredItems",
		[],
	);
	const [view, setView] = useState<ViewMode>("inbox");

	const toggleStar = (id: string) => {
		setStarredItems((prev) => toggleListItem(prev, id));
	};

	return { starredItems, toggleStar, view, setView };
}
