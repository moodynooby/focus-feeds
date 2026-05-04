"use client";

import CreateIcon from "@mui/icons-material/Create";
import InboxIcon from "@mui/icons-material/Inbox";
import LabelIcon from "@mui/icons-material/Label";
import StarIcon from "@mui/icons-material/Star";
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

const drawerWidth = 256;

export default function GhostSidebar({
	open,
	sources,
	selectedSources,
	onSourcesChange,
	view,
	onViewChange,
	onAddFeed,
}) {
	const navItems = [
		{ id: "inbox", label: "Inbox", icon: <InboxIcon /> },
		{ id: "starred", label: "Starred", icon: <StarIcon /> },
	];

	return (
		<Drawer
			variant="permanent"
			sx={{
				width: open ? drawerWidth : 72,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: open ? drawerWidth : 72,
					boxSizing: "border-box",
					border: "none",
					bgcolor: "background.default",
					transition: (theme) =>
						theme.transitions.create("width", {
							easing: theme.transitions.easing.sharp,
							duration: theme.transitions.duration.enteringScreen,
						}),
					overflowX: "hidden",
				},
			}}
		>
			<Toolbar />
			<Box sx={{ p: 2, pb: 1 }}>
				<Button
					variant="contained"
					startIcon={<CreateIcon />}
					onClick={onAddFeed}
					sx={{
						height: 56,
						borderRadius: 16,
						px: open ? 3 : 1.5,
						minWidth: open ? 120 : 56,
						bgcolor: (theme) =>
							theme.palette.mode === "dark" ? "#444746" : "#c2e7ff",
						color: (theme) =>
							theme.palette.mode === "dark" ? "#e3e2e6" : "#001d35",
						boxShadow: "none",
						"&:hover": {
							boxShadow: "0 1px 3px 1px rgba(0,0,0,0.15)",
							bgcolor: (theme) =>
								theme.palette.mode === "dark" ? "#525554" : "#d3e3fd",
						},
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
										onClick={() => {
											if (isSelected) {
												onSourcesChange(
													selectedSources.filter((s) => s !== source),
												);
											} else {
												onSourcesChange([...selectedSources, source]);
											}
										}}
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
											<LabelIcon fontSize="small" />
										</ListItemIcon>
										<ListItemText
											primary={source}
											primaryTypographyProps={{
												variant: "body2",
												noWrap: true,
												sx: {
													fontWeight: isSelected ? 600 : 400,
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
