"use client";

import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";

export default function SourceFilter({ sources, selectedSources, onChange }) {
	const [anchorEl, setAnchorEl] = useState(null);

	const handleRemove = (sourceToRemove) => {
		onChange(selectedSources.filter((s) => s !== sourceToRemove));
	};

	const handleAdd = (source) => {
		if (!selectedSources.includes(source)) {
			onChange([...selectedSources, source]);
		}
		setAnchorEl(null);
	};

	const availableSources = sources.filter((s) => !selectedSources.includes(s));

	return (
		<>
			{selectedSources.map((source) => (
				<Chip
					key={source}
					label={source}
					size="small"
					onDelete={() => handleRemove(source)}
					sx={{
						bgcolor: "primary.main",
						color: "primary.contrastText",
						"& .MuiChip-deleteIcon": {
							color: "primary.contrastText",
							opacity: 0.7,
							"&:hover": { opacity: 1 },
						},
					}}
				/>
			))}
			{availableSources.length > 0 && (
				<>
					<Button
						size="small"
						startIcon={<AddIcon />}
						endIcon={<KeyboardArrowDownIcon />}
						onClick={(e) => setAnchorEl(e.currentTarget)}
						sx={{ minWidth: 0, px: 1 }}
					>
						{selectedSources.length === 0 ? "Sources" : ""}
					</Button>
					<Menu
						anchorEl={anchorEl}
						open={Boolean(anchorEl)}
						onClose={() => setAnchorEl(null)}
					>
						{availableSources.map((source) => (
							<MenuItem key={source} onClick={() => handleAdd(source)}>
								{source}
							</MenuItem>
						))}
					</Menu>
				</>
			)}
		</>
	);
}
