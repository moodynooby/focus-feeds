"use client";

import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { alpha, styled, useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useContext, useState } from "react";
import { ColorModeContext } from "../../theme";

const Search = styled("div")(({ theme }) => ({
	position: "relative",
	borderRadius: 24,
	backgroundColor:
		theme.palette.mode === "dark"
			? alpha(theme.palette.common.white, 0.05)
			: "#eaf1fb",
	"&:hover": {
		backgroundColor:
			theme.palette.mode === "dark"
				? alpha(theme.palette.common.white, 0.1)
				: "#dde7f5",
	},
	marginRight: theme.spacing(2),
	marginLeft: 0,
	width: "100%",
	maxWidth: 720,
	[theme.breakpoints.up("sm")]: {
		marginLeft: theme.spacing(3),
	},
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
	padding: theme.spacing(0, 2),
	height: "100%",
	position: "absolute",
	pointerEvents: "none",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
	color: "inherit",
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1.5, 1, 1.5, 0),
		paddingLeft: `calc(1em + ${theme.spacing(4)})`,
		transition: theme.transitions.create("width"),
		width: "100%",
	},
}));

import { GHOST_APPS } from "./config";

export default function GhostHeader({
	searchQuery,
	onSearchChange,
	onToggleSidebar,
	onOpenSettings,
	onSignOut,
	status,
}) {
	const [anchorElApps, setAnchorElApps] = useState(null);
	const [anchorElProfile, setAnchorElProfile] = useState(null);

	const handleOpenApps = (event) => setAnchorElApps(event.currentTarget);
	const handleCloseApps = () => setAnchorElApps(null);

	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);

	const handleOpenProfile = (event) => setAnchorElProfile(event.currentTarget);
	const handleCloseProfile = () => setAnchorElProfile(null);

	return (
		<AppBar
			position="fixed"
			color="inherit"
			elevation={0}
			sx={{
				zIndex: (theme) => theme.zIndex.drawer + 1,
				bgcolor: "background.default",
				borderBottom: "none",
			}}
		>
			<Toolbar sx={{ gap: 1 }}>
				<IconButton
					edge="start"
					color="inherit"
					aria-label="menu"
					onClick={onToggleSidebar}
				>
					<MenuOutlinedIcon />
				</IconButton>

				<Box
					sx={{
						display: { xs: "none", sm: "flex" },
						alignItems: "center",
						gap: 1,
						minWidth: 120,
					}}
				>
					<Typography
						variant="h6"
						noWrap
						component="div"
						sx={{ color: "text.secondary", fontWeight: 500 }}
					>
						Focus Feeds
					</Typography>
				</Box>

				<Search>
					<SearchIconWrapper>
						<SearchOutlinedIcon />
					</SearchIconWrapper>
					<StyledInputBase
						placeholder="Search mail"
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						inputProps={{ "aria-label": "search" }}
					/>
				</Search>

				<Box sx={{ flexGrow: 1 }} />

				<Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
					<IconButton
						color="inherit"
						onClick={() => colorMode.toggleColorMode()}
					>
						{theme.palette.mode === "dark" ? (
							<LightModeOutlinedIcon />
						) : (
							<DarkModeOutlinedIcon />
						)}
					</IconButton>
					<IconButton
						color="inherit"
						sx={{ display: { xs: "none", sm: "flex" } }}
					>
						<HelpOutlineOutlinedIcon />
					</IconButton>
					<IconButton color="inherit" onClick={onOpenSettings}>
						<SettingsOutlinedIcon />
					</IconButton>
					<IconButton color="inherit" onClick={handleOpenApps}>
						<AppsOutlinedIcon />
					</IconButton>
					<IconButton onClick={handleOpenProfile} sx={{ p: 0.5 }}>
						<Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
							U
						</Avatar>
					</IconButton>
				</Box>

				{/* Apps Menu */}
				<Menu
					anchorEl={anchorElApps}
					open={Boolean(anchorElApps)}
					onClose={handleCloseApps}
					PaperProps={{
						sx: {
							mt: 1.5,
							width: 320,
							p: 2,
							borderRadius: 4,
							bgcolor: "background.paper",
						},
					}}
				>
					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: 1,
						}}
					>
						{GHOST_APPS.map((app) => (
							<Box
								key={app.name}
								component="a"
								href={app.url}
								target="_blank"
								sx={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									gap: 1,
									p: 1,
									textDecoration: "none",
									color: "text.primary",
									borderRadius: 2,
									"&:hover": { bgcolor: "action.hover" },
								}}
							>
								<Typography sx={{ fontSize: "2rem" }}>{app.icon}</Typography>
								<Typography variant="caption" sx={{ textAlign: "center" }}>
									{app.name}
								</Typography>
							</Box>
						))}
					</Box>
				</Menu>

				{/* Profile Menu */}
				<Menu
					anchorEl={anchorElProfile}
					open={Boolean(anchorElProfile)}
					onClose={handleCloseProfile}
					transformOrigin={{ horizontal: "right", vertical: "top" }}
					anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
				>
					<Box sx={{ p: 2, textAlign: "center" }}>
						<Avatar
							sx={{
								width: 64,
								height: 64,
								mx: "auto",
								mb: 1,
								bgcolor: "primary.main",
							}}
						>
							U
						</Avatar>
						<Typography variant="subtitle1">User</Typography>
						<Typography variant="body2" color="text.secondary">
							{status === "authenticated" ? "Authenticated" : "Guest"}
						</Typography>
					</Box>
					<MenuItem
						onClick={() => {
							handleCloseProfile();
							onSignOut();
						}}
					>
						Sign Out
					</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
}
