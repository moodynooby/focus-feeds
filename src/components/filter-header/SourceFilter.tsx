"use client";

import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";

interface SourceFilterProps {
	sources: string[];
	selectedSources: string[];
	onChange: (sources: string[]) => void;
}

export default function SourceFilter({
	sources,
	selectedSources,
	onChange,
}: SourceFilterProps) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

	const handleRemove = (sourceToRemove: string) => {
		onChange(selectedSources.filter((s) => s !== sourceToRemove));
	};

	const handleAdd = (source: string) => {
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
						startIcon={<Plus size={20} />}
						endIcon={<ChevronDown size={20} />}
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
