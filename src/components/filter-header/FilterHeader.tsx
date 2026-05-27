"use client";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import FilterActions from "./FilterActions";
import SearchField from "./SearchField";
import SourceFilter from "./SourceFilter";

interface FilterHeaderProps {
	searchQuery: string;
	onSearchChange: (value: string) => void;
	sources: string[];
	selectedSources: string[];
	onSourcesChange: (sources: string[]) => void;
	onRefresh: () => void;
	onOpenSettings: () => void;
	onClearFilters: () => void;
	filteredCount?: number;
	totalCount?: number;
	loading?: boolean;
}

export default function FilterHeader({
	searchQuery,
	onSearchChange,
	sources,
	selectedSources,
	onSourcesChange,
	onRefresh,
	onOpenSettings,
	onClearFilters,
	filteredCount,
	totalCount,
	loading = false,
}: FilterHeaderProps) {
	const [mobileExpanded, setMobileExpanded] = useState(false);

	const activeFilterCount = (searchQuery ? 1 : 0) + selectedSources.length;

	const hasActiveFilters = activeFilterCount > 0;

	return (
		<AppBar
			position="sticky"
			elevation={0}
			sx={{
				bgcolor: "background.paper",
				borderBottom: "1px solid",
				borderColor: "divider",
				mb: 2,
			}}
		>
			<Toolbar
				sx={{
					display: { xs: "none", md: "flex" },
					justifyContent: "space-between",
					py: 1.5,
					minHeight: 64,
					px: 3,
					gap: 2,
				}}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						minWidth: 140,
					}}
				>
					<Typography
						variant="h6"
						sx={{ fontWeight: 600, color: "text.primary" }}
					>
						Focus Feeds
					</Typography>
					{filteredCount !== undefined && totalCount !== undefined && (
						<Typography variant="caption" sx={{ color: "text.secondary" }}>
							({filteredCount}/{totalCount})
						</Typography>
					)}
				</Box>

				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 2,
						flex: 1,
						justifyContent: "center",
						flexWrap: "wrap",
					}}
				>
					<SearchField value={searchQuery} onChange={onSearchChange} />
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 0.75,
							flexWrap: "wrap",
						}}
					>
						<SourceFilter
							sources={sources}
							selectedSources={selectedSources}
							onChange={onSourcesChange}
						/>
					</Box>
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
					<FilterActions
						onRefresh={onRefresh}
						onOpenSettings={onOpenSettings}
						onClearFilters={onClearFilters}
						showClearButton={true}
						loading={loading}
					/>
				</Box>
			</Toolbar>

			<Toolbar
				sx={{
					display: { xs: "flex", md: "none" },
					alignItems: "center",
					justifyContent: "space-between",
					gap: 1,
					py: 1,
					minHeight: 56,
					px: 2,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Typography
						variant="h6"
						sx={{
							fontWeight: 600,
							color: "text.primary",
							fontSize: "1.1rem",
						}}
					>
						Focus Feeds
					</Typography>
					{filteredCount !== undefined && totalCount !== undefined && (
						<Typography variant="caption" sx={{ color: "text.secondary" }}>
							({filteredCount}/{totalCount})
						</Typography>
					)}
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
					<Tooltip title="Refresh feeds">
						<IconButton
							onClick={onRefresh}
							size="small"
							sx={{ color: "text.secondary" }}
						>
							<RefreshIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title="Settings">
						<IconButton
							onClick={onOpenSettings}
							size="small"
							sx={{ color: "text.secondary" }}
						>
							<SettingsIcon fontSize="small" />
						</IconButton>
					</Tooltip>
					<Tooltip title={mobileExpanded ? "Hide filters" : "Show filters"}>
						<IconButton
							onClick={() => setMobileExpanded(!mobileExpanded)}
							size="small"
							sx={{
								color: hasActiveFilters ? "primary.main" : "text.secondary",
								bgcolor: hasActiveFilters ? "primary.light" : "transparent",
							}}
						>
							<Badge badgeContent={activeFilterCount || null} color="primary">
								{mobileExpanded ? (
									<ExpandLessIcon fontSize="small" />
								) : (
									<FilterListIcon fontSize="small" />
								)}
							</Badge>
						</IconButton>
					</Tooltip>
				</Box>
			</Toolbar>

			<Collapse in={mobileExpanded} timeout="auto" unmountOnExit>
				<Box sx={{ display: { xs: "block", md: "none" } }}>
					<Paper
						elevation={0}
						sx={{
							mx: 2,
							mb: 2,
							p: 2,
							border: "1px solid",
							borderColor: "divider",
							borderRadius: 2,
							bgcolor: "background.default",
						}}
					>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
							<SearchField
								value={searchQuery}
								onChange={onSearchChange}
								fullWidth
							/>

							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 0.75,
									flexWrap: "wrap",
								}}
							>
								<SourceFilter
									sources={sources}
									selectedSources={selectedSources}
									onChange={onSourcesChange}
								/>
							</Box>

							{hasActiveFilters && (
								<FilterActions
									onRefresh={onRefresh}
									onOpenSettings={onOpenSettings}
									onClearFilters={onClearFilters}
									showClearButton={true}
									loading={loading}
								/>
							)}
						</Box>
					</Paper>
				</Box>
			</Collapse>
		</AppBar>
	);
}
