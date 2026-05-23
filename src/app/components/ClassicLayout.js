"use client";

import WifiOffIcon from "@mui/icons-material/WifiOff";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import FeedList from "./FeedList";
import FilterHeader from "./filter-header/FilterHeader";

export default function ClassicLayout({
	searchQuery,
	onSearchChange,
	sources,
	selectedSources,
	onSourcesChange,
	items,
	loading,
	onRefresh,
	onOpenSettings,
	onClearFilters,
	filteredCount,
	totalCount,
	error,
	failedFeeds,
	hasMoreItems,
	onLoadMore,
	isOnline = true,
}) {
	const theme = useTheme();
	return (
		<>
			{!isOnline && (
				<Alert
					severity="warning"
					icon={<WifiOffIcon />}
					sx={{
						borderRadius: 0,
						m: 0,
						width: "100%",
						backgroundColor:
							theme.palette.mode === "dark" ? "#5a3d00" : "#fff3e0",
					}}
				>
					<AlertTitle>Offline Mode</AlertTitle>
					You are currently offline. Showing cached content and some features
					may be limited.
				</Alert>
			)}
			<FilterHeader
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				sources={sources}
				selectedSources={selectedSources}
				onSourcesChange={onSourcesChange}
				onRefresh={onRefresh}
				onOpenSettings={onOpenSettings}
				onClearFilters={onClearFilters}
				filteredCount={filteredCount}
				totalCount={totalCount}
				loading={loading}
			/>

			<Box sx={{ maxWidth: "800px", mx: "auto", pb: 4, pt: 2 }}>
				<FeedList
					loading={loading}
					error={error}
					failedFeeds={failedFeeds}
					items={items}
					onRefresh={onRefresh}
					hasMoreItems={hasMoreItems}
					onLoadMore={onLoadMore}
					totalCount={totalCount}
				/>
			</Box>
		</>
	);
}
