"use client";

import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";

interface SearchFieldProps {
	value: string;
	onChange: (value: string) => void;
	fullWidth?: boolean;
}

export default function SearchField({
	value,
	onChange,
	fullWidth = false,
}: SearchFieldProps) {
	return (
		<TextField
			size="small"
			placeholder="Search articles..."
			value={value}
			onChange={(e) => onChange(e.target.value)}
			fullWidth={fullWidth}
			sx={{ width: fullWidth ? undefined : 280 }}
			slotProps={{
				input: {
					startAdornment: (
						<InputAdornment position="start">
							<SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
						</InputAdornment>
					),
					endAdornment: value && (
						<InputAdornment position="end">
							<IconButton
								size="small"
								onClick={() => onChange("")}
								sx={{ color: "text.secondary" }}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</InputAdornment>
					),
				},
			}}
		/>
	);
}
