"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Plus, Tag } from "lucide-react";
import { useState } from "react";
import { MODE_CONFIG, MODE_NAMES } from "@/lib/modes";
import { useModeContext } from "@/lib/theme";
import { toggleListItem } from "@/lib/utils";
import type { AppMode } from "@/types";
import SearchField from "../filter-header/SearchField";

interface NavItem {
	id: string;
	label: string;
	icon: React.ReactNode;
}

interface FeedSidebarProps {
	open: boolean;
	onClose: () => void;
	isMobile: boolean;

	searchQuery?: string;
	onSearchChange?: (value: string) => void;

	navItems: NavItem[];
	activeNav: string;
	onNavChange: (id: string) => void;

	showModeSwitcher?: boolean;

	sources: string[];
	selectedSources: string[];
	onSourcesChange: (sources: string[]) => void;

	onAddFeed?: () => void;

	sourceSectionLabel: string;
}

const DRAWER_WIDTH = 256;

export default function FeedSidebar({
	open,
	onClose,
	isMobile,
	searchQuery,
	onSearchChange,
	navItems,
	activeNav,
	onNavChange,
	showModeSwitcher = false,
	sources,
	selectedSources,
	onSourcesChange,
	onAddFeed,
	sourceSectionLabel,
}: FeedSidebarProps) {
	const { mode, setMode } = useModeContext();
	const [sourceCollapsed, setSourceCollapsed] = useState(false);

	const filtersActive = selectedSources.length > 0 || Boolean(searchQuery);

	const handleNavClick = (id: string) => {
		if (id === "filters") {
			setSourceCollapsed((prev) => !prev);
		} else {
			onNavChange(id);
		}
		if (isMobile) onClose();
	};

	return (
		<Drawer
			variant={isMobile ? "temporary" : "permanent"}
			open={open}
			onClose={onClose}
			sx={{
				width: open || !isMobile ? DRAWER_WIDTH : 0,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: DRAWER_WIDTH,
					boxSizing: "border-box",
					border: "none",
					bgcolor: "background.default",
					...(!isMobile && {
						width: open ? DRAWER_WIDTH : 72,
						transition: (t) =>
							t.transitions.create("width", {
								easing: t.transitions.easing.sharp,
								duration: t.transitions.duration.enteringScreen,
							}),
					}),
					overflowX: "hidden",
				},
			}}
		>
			<Toolbar />

			{searchQuery !== undefined && onSearchChange && open && (
				<Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
					<SearchField
						value={searchQuery}
						onChange={onSearchChange}
						fullWidth
					/>
				</Box>
			)}

			{onAddFeed && (
				<Box sx={{ p: 2, pb: 1 }}>
					<Button
						variant="contained"
						startIcon={<Plus size={28} />}
						onClick={onAddFeed}
						sx={{
							height: 56,
							borderRadius: 16,
							px: open ? 3 : 1.5,
							minWidth: open ? 120 : 56,
							boxShadow: "none",
						}}
					>
						{open && (
							<Typography sx={{ fontWeight: 500, fontSize: "0.875rem" }}>
								Add Feed
							</Typography>
						)}
					</Button>
				</Box>
			)}

			<List sx={{ pt: 1 }}>
				{navItems.map((item) => {
					const isFilters = item.id === "filters";
					const selected = isFilters
						? filtersActive && !sourceCollapsed
						: activeNav === item.id;

					return (
						<ListItem key={item.id} disablePadding sx={{ display: "block" }}>
							<ListItemButton
								selected={selected}
								onClick={() => handleNavClick(item.id)}
								sx={{
									minHeight: 32,
									justifyContent: open ? "initial" : "center",
									px: 2.5,
								}}
							>
								<ListItemIcon
									sx={{
										minWidth: 0,
										mr: open ? 3 : "auto",
										justifyContent: "center",
										color: selected ? "inherit" : "text.secondary",
									}}
								>
									{item.icon}
								</ListItemIcon>
								{open && <ListItemText primary={item.label} />}
							</ListItemButton>
						</ListItem>
					);
				})}
			</List>

			{showModeSwitcher && open && (
				<Box sx={{ px: 3, py: 1 }}>
					<Typography
						variant="overline"
						sx={{ fontWeight: 600, color: "text.secondary" }}
					>
						Apps / Views
					</Typography>
					<Box sx={{ display: "flex", gap: 0.5, mt: 0.5 }}>
						{MODE_NAMES.map((mod) => {
							const Icon = MODE_CONFIG[mod].icon;
							return (
								<Box
									key={mod}
									component="button"
									onClick={() => setMode(mod as AppMode)}
									sx={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										width: 40,
										height: 40,
										border: "none",
										borderRadius: 999,
										background: "transparent",
										cursor: "pointer",
										color: mode === mod ? "primary.main" : "text.secondary",
										bgcolor: mode === mod ? "primary.light" : "transparent",
										"&:hover": { bgcolor: "action.hover" },
									}}
								>
									<Icon size={20} />
								</Box>
							);
						})}
					</Box>
				</Box>
			)}

			<Collapse in={open && !sourceCollapsed} timeout="auto">
				{sources.length > 0 && (
					<Box sx={{ mt: 1 }}>
						<Typography
							variant="overline"
							sx={{ px: 3, fontWeight: 600, color: "text.secondary" }}
						>
							{sourceSectionLabel}
						</Typography>
						<List>
							{sources.map((source) => {
								const isSourceSelected = selectedSources.includes(source);
								return (
									<ListItem
										key={source}
										disablePadding
										sx={{ display: "block" }}
									>
										<ListItemButton
											selected={isSourceSelected}
											onClick={() =>
												onSourcesChange(toggleListItem(selectedSources, source))
											}
											sx={{
												minHeight: 32,
												justifyContent: "initial",
												px: 2.5,
											}}
										>
											<ListItemIcon
												sx={{
													minWidth: 0,
													mr: 3,
													justifyContent: "center",
													color: isSourceSelected
														? "primary.main"
														: "text.secondary",
												}}
											>
												<Tag size={20} />
											</ListItemIcon>
											<ListItemText
												primary={source}
												slotProps={{
													primary: {
														variant: "body2",
														noWrap: true,
														sx: {
															fontWeight: isSourceSelected ? 600 : 400,
														},
													},
												}}
											/>
										</ListItemButton>
									</ListItem>
								);
							})}
						</List>
					</Box>
				)}
			</Collapse>
		</Drawer>
	);
}
