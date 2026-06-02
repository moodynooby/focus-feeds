"use client";

import AppBar from "@mui/material/AppBar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { ChevronUp, ListFilter, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useModeContext } from "@/lib/theme";
import SearchField from "../filter-header/SearchField";
import ColorModeToggle from "./ColorModeToggle";
import HeaderActions from "./HeaderActions";
import ModeMenu from "./ModeMenu";

interface AppHeaderProps {
	title?: string;
	searchQuery?: string;
	onSearchChange?: (value: string) => void;
	sourceFilter?: React.ReactNode;
	onRefresh: () => void;
	onOpenSettings: () => void;
	onClearFilters?: () => void;
	loading?: boolean;
	filteredCount?: number;
	totalCount?: number;
	leftSlot?: React.ReactNode;
	rightSlot?: React.ReactNode;
	mobileExtraItems?: React.ReactNode;
	fixed?: boolean;
}

export default function AppHeader({
	title = "Focus Feeds",
	searchQuery,
	onSearchChange,
	sourceFilter,
	onRefresh,
	onOpenSettings,
	onClearFilters,
	loading = false,
	filteredCount,
	totalCount,
	leftSlot,
	rightSlot,
	mobileExtraItems,
	fixed = false,
}: AppHeaderProps) {
	const { mode } = useModeContext();
	const [mobileExpanded, setMobileExpanded] = useState(false);
	const [anchorElMenu, setAnchorElMenu] = useState<HTMLElement | null>(null);

	const hasActiveFilters = Boolean(searchQuery && searchQuery.length > 0);

	const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElMenu(event.currentTarget);
	};

	const handleCloseMenu = () => {
		setAnchorElMenu(null);
	};

	return (
		<AppBar
			position={fixed ? "fixed" : "sticky"}
			elevation={0}
			sx={{
				bgcolor: "background.paper",
				borderBottom: "1px solid",
				borderColor: "divider",
				mb: fixed ? 0 : 2,
				...(fixed && {
					zIndex: (t) => t.zIndex.drawer + 1,
				}),
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
					{leftSlot}
					<Typography
						variant="h6"
						sx={{ fontWeight: 600, color: "text.primary" }}
					>
						{title}
					</Typography>
					{filteredCount !== undefined && totalCount !== undefined && (
						<Typography variant="caption" sx={{ color: "text.secondary" }}>
							({filteredCount}/{totalCount})
						</Typography>
					)}
				</Box>

				{searchQuery !== undefined && onSearchChange && (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							gap: 2,
							flex: 1,
							maxWidth: 800,
							justifyContent: "center",
						}}
					>
						<SearchField value={searchQuery} onChange={onSearchChange} />
						{sourceFilter && (
							<Box
								sx={{
									display: "flex",
									alignItems: "center",
									gap: 0.75,
									flexWrap: "wrap",
								}}
							>
								{sourceFilter}
							</Box>
						)}
					</Box>
				)}

				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
					<HeaderActions
						onRefresh={onRefresh}
						onOpenSettings={onOpenSettings}
						onClearFilters={onClearFilters}
						loading={loading}
					/>
					{rightSlot}
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
					{leftSlot}
					<Typography
						variant="h6"
						sx={{
							fontWeight: 600,
							color: "text.primary",
							fontSize: "1.1rem",
						}}
					>
						{title}
					</Typography>
					{filteredCount !== undefined && totalCount !== undefined && (
						<Typography variant="caption" sx={{ color: "text.secondary" }}>
							({filteredCount}/{totalCount})
						</Typography>
					)}
				</Box>

				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
					{mode !== "twitter" && <ModeMenu />}
					<ColorModeToggle />
					{sourceFilter && (
						<Tooltip title={mobileExpanded ? "Hide filters" : "Show filters"}>
							<IconButton
								onClick={() => setMobileExpanded(!mobileExpanded)}
								size="small"
								sx={{
									color: hasActiveFilters ? "primary.main" : "text.secondary",
									bgcolor: hasActiveFilters ? "primary.light" : "transparent",
								}}
							>
								<Badge badgeContent={0} color="primary">
									{mobileExpanded ? (
										<ChevronUp size={20} />
									) : (
										<ListFilter size={20} />
									)}
								</Badge>
							</IconButton>
						</Tooltip>
					)}
					<Tooltip title="More">
						<IconButton
							onClick={handleOpenMenu}
							size="small"
							sx={{ color: "text.secondary" }}
						>
							<MoreVertical size={20} />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={anchorElMenu}
						open={Boolean(anchorElMenu)}
						onClose={handleCloseMenu}
					>
						<MenuItem
							onClick={() => {
								onRefresh();
								handleCloseMenu();
							}}
						>
							Refresh
						</MenuItem>
						<MenuItem
							onClick={() => {
								onOpenSettings();
								handleCloseMenu();
							}}
						>
							Settings
						</MenuItem>
						{mobileExtraItems}
					</Menu>
				</Box>
			</Toolbar>

			{sourceFilter && (
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
								{searchQuery !== undefined && onSearchChange && (
									<SearchField
										value={searchQuery}
										onChange={onSearchChange}
										fullWidth
									/>
								)}
								{sourceFilter}
							</Box>
						</Paper>
					</Box>
				</Collapse>
			)}
		</AppBar>
	);
}
