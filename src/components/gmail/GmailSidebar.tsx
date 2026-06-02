"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Inbox, Plus, Star, Tag } from "lucide-react";
import type { ViewMode } from "@/types";
import { toggleListItem } from "../utils";

const drawerWidth = 256;

interface GmailSidebarProps {
	open: boolean;
	onClose: () => void;
	sources: string[];
	selectedSources: string[];
	onSourcesChange: (sources: string[]) => void;
	view: ViewMode;
	onViewChange: (view: ViewMode) => void;
	onAddFeed: () => void;
	isMobile: boolean;
}

export default function GmailSidebar({
	open,
	onClose,
	sources,
	selectedSources,
	onSourcesChange,
	view,
	onViewChange,
	onAddFeed,
	isMobile,
}: GmailSidebarProps) {
	const navItems = [
		{ id: "inbox" as const, label: "Inbox", icon: <Inbox size={20} /> },
		{ id: "starred" as const, label: "Starred", icon: <Star size={20} /> },
	];

	return (
		<Drawer
			variant={isMobile ? "temporary" : "permanent"}
			open={open}
			onClose={onClose}
			sx={{
				width: open || !isMobile ? drawerWidth : 0,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: drawerWidth,
					boxSizing: "border-box",
					border: "none",
					bgcolor: "background.default",
					...(!isMobile && {
						width: open ? drawerWidth : 72,
						transition: (theme) =>
							theme.transitions.create("width", {
								easing: theme.transitions.easing.sharp,
								duration: theme.transitions.duration.enteringScreen,
							}),
					}),
					overflowX: "hidden",
				},
			}}
		>
			<Toolbar />
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

			<List sx={{ pt: 1 }}>
				{navItems.map((item) => (
					<ListItem key={item.id} disablePadding sx={{ display: "block" }}>
						<ListItemButton
							selected={view === item.id}
							onClick={() => onViewChange(item.id)}
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
									color: view === item.id ? "inherit" : "text.secondary",
								}}
							>
								{item.icon}
							</ListItemIcon>
							{open && <ListItemText primary={item.label} />}
						</ListItemButton>
					</ListItem>
				))}
			</List>

			{open && sources.length > 0 && (
				<Box sx={{ mt: 2 }}>
					<Typography
						variant="overline"
						sx={{ px: 3, fontWeight: 600, color: "text.secondary" }}
					>
						Labels
					</Typography>
					<List>
						{sources.map((source) => {
							const isSelected = selectedSources.includes(source);
							return (
								<ListItem key={source} disablePadding sx={{ display: "block" }}>
									<ListItemButton
										selected={isSelected}
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
												color: isSelected ? "primary.main" : "text.secondary",
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
														fontWeight: isSelected ? 600 : 400,
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
		</Drawer>
	);
}
