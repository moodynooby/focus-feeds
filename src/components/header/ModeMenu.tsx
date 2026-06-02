"use client";

import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { MODE_CONFIG, MODE_NAMES } from "@/lib/modes";
import { useModeContext } from "@/lib/theme";

export default function ModeMenu() {
	const { mode, setMode } = useModeContext();
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<>
			<Tooltip title="Switch Mode">
				<IconButton color="inherit" onClick={handleOpen}>
					<AppsOutlinedIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={handleClose}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				slotProps={{
					paper: {
						sx: {
							mt: 1.5,
							width: 320,
							p: 2,
							borderRadius: 4,
						},
					},
				}}
			>
				<Grid container spacing={1}>
					{MODE_NAMES.map((modeOption) => {
						const config = MODE_CONFIG[modeOption];
						const Icon = config.icon;
						const isSelected = mode === modeOption;

						return (
							<Grid key={modeOption} size={4}>
								<Box
									component="button"
									onClick={() => {
										if (!isSelected) {
											setMode(modeOption);
										}
										handleClose();
									}}
									sx={{
										width: "100%",
										display: "flex",
										flexDirection: "column",
										alignItems: "center",
										gap: 1,
										p: 1.5,
										border: "none",
										background: "transparent",
										cursor: "pointer",
										color: isSelected ? "primary.main" : "text.primary",
										borderRadius: 2,
										"&:hover": { bgcolor: "action.hover" },
										...(isSelected && {
											bgcolor: "action.selected",
										}),
									}}
								>
									<Icon sx={{ fontSize: "1.5rem" }} />
									<Typography variant="caption" sx={{ textAlign: "center" }}>
										{config.name}
									</Typography>
								</Box>
							</Grid>
						);
					})}
				</Grid>
			</Menu>
		</>
	);
}
